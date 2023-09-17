/**
 * INITIALIZE get's called within the context of the chrome extension
 * by puppeteer calling evaluate on the extension's background page (options.html)
 *
 * captures the active puppeteer tab in to a media stream that we use
 * to call the chromecast receiver using peerjs
 */
async function INITIALIZE({ srcPeerId, destPeerId }) {
  const stream = await new Promise((resolve, reject) => {
    chrome.tabCapture.capture(
      { video: true, audio: true },
      (capturedStream) => {
        if (capturedStream) resolve(capturedStream);
        else reject(new Error('Failed to capture the tab.'));
      }
    );
  });

  const peer = new Peer(srcPeerId);
  await new Promise((resolve, reject) => {
    peer.once('open', resolve);
    peer.on('error', (error) => {
      reject(new Error(`Peer error: ${error.message}`));
    });
  });

  peer.call(destPeerId, stream);
}
