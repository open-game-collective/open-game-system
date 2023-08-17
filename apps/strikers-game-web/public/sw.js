"use strict";
console.log('HELLO WORLD!');
self.addEventListener('push', (event) => {
    console.log('PUSH EVENT RECEVE!', event);
});