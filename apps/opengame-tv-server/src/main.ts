import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import HLSServer from 'hls-server';
import http from 'http';
import * as JWT from 'jsonwebtoken';
import { getStream, launch } from 'puppeteer-stream';
import { Transform } from 'stream';

const getStreamId = (accessToken: string) => {
  const parsedAccessToken = JWT.verify(accessToken, 'my_private_key');
  if (
    typeof parsedAccessToken === 'object' &&
    parsedAccessToken &&
    'stream_id' in parsedAccessToken &&
    typeof parsedAccessToken['stream_id'] === 'string'
  ) {
    return parsedAccessToken.stream_id;
  }
  return null;
};

type AnyFunction = (...args: any[]) => any;

var server = http.createServer();

const getOrCreateStream = (() => {
  const loadingMap = new Map<string, boolean>();
  const streamMap = new Map<string, Transform>();
  const callbacksMap = new Map<string, AnyFunction[]>();

  return async (streamId: string) => {
    let stream = streamMap.get(streamId);
    if (stream) {
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

    // await page.goto(STRIKERS_GAME_WEB_URL);

    // For some reason screencast fails if started too early
    await new Promise<null>((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 2000);
    });

    console.log('getting stream');
    stream = await getStream(page, { audio: true, video: true });
    streamMap.set(streamId, stream);
    console.log('sending stream to ffmpeg');
    const m3u8path = `./tmp/${streamId}.m3u8`;

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
      const { token, ext } = getFileInfo(req.url);
      const streamId = getStreamId(token)!;
      // assert(streamId, 'expected to find streamId in token from url');

      let exists = false;
      if (ext === 'm3u8') {
        await getOrCreateStream(streamId);
        exists = true;
      } else if (ext === 'ts') {
        // todo check for file
        exists = true;
      }

      callback(null, exists);
    },
    getManifestStream: async function (req, callback) {
      const { token } = getFileInfo(req.url);
      const streamId = getStreamId(token)!;
      // assert(streamId, 'expected to find streamId in token from url');

      const m3u8path = `./tmp/${streamId}.m3u8`;
      const stream = fs.createReadStream(m3u8path);
      callback(null, stream);
    },
    getSegmentStream: function (req, callback) {
      const { token } = getFileInfo(req.url);
      const streamId = getStreamId(token)!;
      // assert(streamId, 'expected to find streamId in token from url');

      const segmentPath = `./tmp/${streamId}.ts`;
      const stream = fs.createReadStream(segmentPath);
      callback(null, stream);
    },
  },
});
server.listen(process.env.PORT || 3333);

// todo fix type on request to have not optional url
const getFileInfo = (url?: string) => {
  // assert(url, 'expected url');
  const { pathname } = new URL(url!);
  const [_, fileName] = pathname.split('/');
  const [token, ext] = fileName.split(/.m3u8|.ts/); // only support .m3u8 and .ts

  const streamId = getStreamId(token);
  return { fileName, token, ext, streamId };
};
