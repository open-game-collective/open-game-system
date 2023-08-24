import { registerSW } from 'virtual:pwa-register';
import { swRegStore } from '@context/ServiceWorkerContext';

registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl, r) {
    swRegStore.set(r);
  },
  onOfflineReady() {
    console.log('PWA application ready to work offline');
  },
});
