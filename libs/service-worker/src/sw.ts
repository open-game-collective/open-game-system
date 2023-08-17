console.log('HELLO WORLD!');

self.addEventListener('push', (event) => {
  console.log('PUSH EVENT RECEVE!', event);

  const nofication = new Notification('Hello world!!');
  nofication.addEventListener('click', () => {
    console.log('click');
  });
  nofication.addEventListener('error', () => {
    console.log('error');
  });
  nofication.addEventListener('close', () => {
    console.log('close');
  });
  nofication.addEventListener('show', () => {
    console.log('show');
  });
  //   event.
});
