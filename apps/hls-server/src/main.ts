import HLSServer from 'hls-server';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import http from 'http';
import { launch, getStream } from 'puppeteer-stream';
import { Transform } from 'stream';

type AnyFunction = (...args: any[]) => any;

var server = http.createServer();

const getOrCreateStream = (() => {
  const loadingMap = new Map<string, boolean>();
  const streamMap = new Map<string, Transform>();
  const callbacksMap = new Map<string, AnyFunction[]>();

  return async (id: string) => {
    let stream = streamMap.get(id);
    console.log({ id, stream: !!stream });
    if (stream) {
      return stream;
    }

    // if already loading, add as callback then wait til its resolved
    if (loadingMap.get(id)) {
      if (!callbacksMap.get(id)) {
        callbacksMap.set(id, []);
      }

      await new Promise((resolve) => callbacksMap.get(id).push(resolve));
      return streamMap.get(id);
    }

    loadingMap.set(id, true);
    let resolved = false;

    const browser = await launch({
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--headless=new'],
      defaultViewport: {
        width: 1024,
        height: 768,
      },
    });

    console.log('going to page');
    const page = await browser.newPage();
    await page.goto(`https://dl6.webmfiles.org/big-buck-bunny_trailer.webm`);

    // For some reason screencast fails if started too early
    await new Promise<null>((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 2000);
    });

    stream = await getStream(page, { audio: true, video: true });
    streamMap.set(id, stream);
    const m3u8path = `./tmp/${id}.m3u8`;

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

    const callbacks = callbacksMap.get(id);
    if (callbacks) {
      callbacksMap.get(id).forEach((callback) => callback(stream));
      callbacksMap.delete(id);
    }

    loadingMap.set(id, false);
    return stream;
  };
})();

new HLSServer(server, {
  provider: {
    exists: async function (req, callback) {
      const [id, ext] = req.filePath.split('.');
      console.log(req.filePath, id, ext);

      if (ext === 'm3u8') {
        await getOrCreateStream(id);
      }

      callback(null, true); // file exists and is ready to start streaming
    },
    getManifestStream: async function (req, callback) {
      const m3u8path = `./tmp/${req.filePath}`;
      console.log('getting manifest', { m3u8path });
      const stream = fs.createReadStream(m3u8path);
      callback(null, stream);
    },
    getSegmentStream: function (req, callback) {
      // returns the correct .ts file
      const segmentPath = `./tmp/${req.filePath}`;
      console.log('getting segment', segmentPath);
      const stream = fs.createReadStream(segmentPath);
      callback(null, stream);
    },
  },
});
server.listen(process.env.PORT || 3333);
