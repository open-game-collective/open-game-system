// import { assert } from '@explorers-club/utils';
import crypto from 'crypto';
import { generateSnowflakeId } from '@api/ids';
import { assert } from '@explorers-club/utils';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import HLSServer from 'hls-server';
import http from 'http';
import * as JWT from 'jsonwebtoken';
import { getStream, launch } from 'puppeteer-stream';
import { Transform } from 'stream';
import { z } from 'zod';

export const envSchema = z.object({
  PUBLIC_STRIKERS_GAME_WEB_URL: z.string(),
});

const { PUBLIC_STRIKERS_GAME_WEB_URL } = envSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}

var server = http.createServer();

const getOrCreateStream = (() => {
  const loadingMap = new Map<string, boolean>();
  const streamMap = new Map<string, Transform>();
  const callbacksMap = new Map<string, AnyFunction[]>();

  return async ({
    token,
    streamId,
    sessionId,
    streamUrl,
  }: {
    token: string;
    streamId: string;
    sessionId: string;
    streamUrl: string;
  }) => {
    let stream = streamMap.get(streamId);
    if (stream) {
      console.log('stream already exists!');
      return stream;
    }

    // if already loading, add as callback then wait til its resolved
    if (loadingMap.get(streamId)) {
      if (!callbacksMap.get(streamId)) {
        callbacksMap.set(streamId, []);
      }

      await new Promise((resolve) => callbacksMap.get(streamId)!.push(resolve));
      return streamMap.get(streamId);
    }

    loadingMap.set(streamId, true);
    let resolved = false;
    console.log('launching browser');

    const browser = await launch({
      // executablePath,
      channel: 'chrome',
      // https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md see for details about no-sandbox, might need to adjust Dockerfile
      args: ['--headless=new', '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    });

    console.log('creating page');
    const page = await browser.newPage();
    // set user agent (override the default headless User Agent)
    await page.setUserAgent('OGS HLS-Server v0.0.1');

    const refreshToken = JWT.sign(
      {
        sessionId,
        deviceId: generateSnowflakeId(),
      },
      'my_private_key',
      {
        subject: streamId,
        audience: 'STRIKERS_GAME_WEB',
        issuer: 'HLS_SERVER',
        expiresIn: '30d',
      }
    );

    // await page
    // Set a cookie
    const domain = PUBLIC_STRIKERS_GAME_WEB_URL.replace('https://', ''); // Make sure the domain matches the site you navigated to
    await page.setCookie({
      name: 'refreshToken',
      value: refreshToken,
      domain, // Make sure the domain matches the site you navigated to
      expires: Date.now() / 1000 + 90 * 24 * 60 * 60, // 90 days
      // There are other optional properties too, like secure, httpOnly, etc.
    });

    // const accessToken = JWT.sign(
    //   {
    //     url,
    //     sessionId: connectionEntity.sessionId,
    //     // schema: 'session',
    //     // scope: ['stream.view'],
    //   },
    //   'my_private_key',
    //   {
    //     subject: streamId,
    //     expiresIn: '30d',
    //   }
    // );

    // const accessToken = JWT.sign(
    //   {
    //     url: streamUrl,
    //     // roles
    //   },
    //   'my_private_key',
    //   {
    //     subject: connectionId,
    //     issuer: 'strikers-game-web',
    //     // audience: "", // todo https://api.opengame.org
    //     expiresIn: '30d',
    //     jwtid: 'ONE_TIME_TOKEN',
    //   }
    // );

    // await page.setExtraHTTPHeaders({
    //   Authorization: `Bearer ${accessToken}`,
    // });

    // todo how do we set either a cooking or 'Authorization: Bearing {TOKEN}' header

    await page.goto(streamUrl);

    // For some reason screencast fails if started too early
    await new Promise<null>((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 2000);
    });
    console.log('getting stream');

    stream = await getStream(page, { audio: true, video: true });
    streamMap.set(streamId, stream);
    const m3u8path = getManifestFilepath(token);
    console.log('sending to ffmpeg');

    await new Promise((resolve) => {
      ffmpeg(stream)
        .outputOptions([
          '-fflags nobuffer',
          //   "-vcodec libx264",
          //   "-preset superfast",
          //   "-pix_fmt yuv420p",
          '-r 24',
          '-g 24',
          '-hls_time 1',
          '-hls_list_size 3',
          '-hls_flags delete_segments',
          '-f hls',
        ])
        // .on('start', function (commandLine) {
        //   console.log('STARTED!', commandLine);
        //   //   resolve(null);
        // })
        .on('progress', function (progressData) {
          if (!resolved) {
            fs.exists(m3u8path, (exists) => {
              if (exists && !resolved) {
                resolved = true;
                resolve(null);
              }
            });
          }
        })
        // .on('stderr', function (stdErrLine) {
        //   console.log('An error occurred: ' + stdErrLine);
        // })
        // .on('error', function (err) {
        //   console.log('An error occurred: ' + err.message);
        // })
        .output(m3u8path)
        .run();
    });

    const callbacks = callbacksMap.get(streamId);
    if (callbacks) {
      callbacksMap.get(streamId)!.forEach((callback) => callback(stream));
      callbacksMap.delete(streamId);
    }

    loadingMap.set(streamId, false);
    return stream;
  };
})();

new HLSServer(server, {
  provider: {
    exists: async function (req, callback) {
      const { baseFilename, ext } = getFileInfo(req.url);
      if (ext === 'm3u8') {
        const { token, streamUrl, streamId, sessionId } =
          getStreamInfoFromToken(baseFilename);
        await getOrCreateStream({ token, streamId, streamUrl, sessionId });
        callback(null, true);
      } else if (ext === 'ts') {
        const filePath = getSegmentFilepath(baseFilename);
        fs.exists(filePath, (exists) => {
          callback(null, exists);
        });
      } else {
        callback(new Error('unhandled file type' + ext), false);
      }
    },
    getManifestStream: async function (req, callback) {
      const { baseFilename, ext } = getFileInfo(req.url);
      const m3u8path = getManifestFilepath(baseFilename);
      const stream = fs.createReadStream(m3u8path);
      callback(null, stream);
    },
    getSegmentStream: function (req, callback) {
      const { baseFilename, ext } = getFileInfo(req.url);
      const segmentPath = getSegmentFilepath(baseFilename);
      const stream = fs.createReadStream(segmentPath);
      callback(null, stream);
    },
  },
});
server.listen(process.env.PORT || 3333);

// todo fix type on request to have not optional url
const getStreamInfoFromToken = (token: string) => {
  const streamId = getStreamId(token);
  const streamUrl = getStreamUrl(token);
  const sessionId = getSessionId(token);
  assert(streamId, 'expected streamId when parsing token from ' + token);
  assert(streamUrl, 'expected streamUrl when parsing token from ' + token);
  assert(sessionId, 'expected sessionId when parsing token from ' + token);
  return { token, streamId, streamUrl, sessionId };
};

// todo fix not able to import from utils
// function assert<T>(expression: T, errorMessage: string): asserts expression {
//   if (!expression) {
//     throw new Error(errorMessage);
//   }
// }

const getFileInfo = (pathname?: string) => {
  assert(pathname, 'expected pathname');
  const [_, fileName] = pathname.split('/');
  const [baseFilename, ext] = fileName
    .match(/(.*?)(?:\.([^\.]+))?$/)
    ?.slice(1) || ['', ''];
  return { baseFilename, ext };
};

const getSessionId = (token: string) => {
  const parsed = JWT.verify(token, 'my_private_key');
  if (
    typeof parsed === 'object' &&
    parsed &&
    'sessionId' in parsed &&
    typeof parsed['sessionId'] === 'string'
  ) {
    return parsed.sessionId;
  }
  return null;
};

const getStreamUrl = (token: string) => {
  const parsed = JWT.verify(token, 'my_private_key');
  if (
    typeof parsed === 'object' &&
    parsed &&
    'url' in parsed &&
    typeof parsed['url'] === 'string'
  ) {
    return parsed.url;
  }
  return null;
};

const getStreamId = (token: string) => {
  const parsed = JWT.verify(token, 'my_private_key');
  return parsed.sub as string;
};

type AnyFunction = (...args: any[]) => any;

function getManifestFilepath(token: string): string {
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return `./tmp/${hash}.m3u8`;
}

function getSegmentFilepath(filename: string): string {
  return `./tmp/${filename}.ts`;
}
