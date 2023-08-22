"use strict";
// /// <reference lib="webworker" />
// //@ts-ignore
// sw = self;
// declare var sw: ServiceWorkerGlobalScope;
/// <reference no-default-lib="true"/>
/// <reference lib="es2020" />
/// <reference lib="WebWorker" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const sw = self;
self.addEventListener('push', (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('PUSH EVENT RECEVE!', self);
    console.log(sw.registration);
    yield sw.registration.showNotification('Hello world!', {
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
}));
//# sourceMappingURL=sw.js.map