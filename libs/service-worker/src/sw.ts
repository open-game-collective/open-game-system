// /// <reference lib="webworker" />
// //@ts-ignore
// sw = self;
// declare var sw: ServiceWorkerGlobalScope;
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="WebWorker" />

// todo build a way to be able to fire HTTP requests
// to trpc using the connection access token

// todo use pushsubscriptionchange to update subscription from background
// see: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/pushsubscriptionchange_event

const sw = self as ServiceWorkerGlobalScope & typeof globalThis;

// const pushReceivedTracking;

self.addEventListener('push', async (event) => {
  // todo add tracking

  const send = sw.registration.showNotification('Hello world!', {
    body: 'MY BODY!!!',
  });

  event.waitUntil(send);
});
