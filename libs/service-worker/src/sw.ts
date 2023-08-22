// /// <reference lib="webworker" />
// //@ts-ignore
// sw = self;
// declare var sw: ServiceWorkerGlobalScope;
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="WebWorker" />

const sw = self as ServiceWorkerGlobalScope & typeof globalThis;

self.addEventListener('push', async (event) => {
  console.log('PUSH EVENT RECEVE!', self);
  console.log(sw.registration);
  await sw.registration.showNotification('Hello world!', {
    actions: [
      {
        action: 'YES!',
        title: 'Ma1',
      },
      {
        action: 'NO',
        title: 'Ma2',
      },
    ],
    badge: 1,
    body: 'MY BODY!!!',
  });

  //   const nofication = new Notification('Hello world!!');
  //   nofication.addEventListener('click', () => {
  //     console.log('click');
  //   });
  //   nofication.addEventListener('error', () => {
  //     console.log('error');
  //   });
  //   nofication.addEventListener('close', () => {
  //     console.log('close');
  //   });
  //   nofication.addEventListener('show', () => {
  //     console.log('show');
  //   });
  //   event.
});
