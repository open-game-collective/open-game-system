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
// import { NotificationPayloadSchema } from '@schema/common';
import { precacheAndRoute } from 'workbox-precaching';

const sw = self as ServiceWorkerGlobalScope & typeof globalThis;

const manifest = precacheAndRoute(self.__WB_MANIFEST);

// const pushReceivedTracking;

self.addEventListener('push', async (event) => {
  const body = event.data!.json();
  const { title, options } = body;
  // todo make typesafe
  // const { title, options } = NotificationPayloadSchema.parse(body);
  // console.log({ title, options });

  const send = sw.registration.showNotification(title);
  event.waitUntil(send);
});
