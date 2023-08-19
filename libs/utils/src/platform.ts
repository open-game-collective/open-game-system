export const getPlatformInfo = () => {
  var _ua = window.navigator.userAgent;

  const isIDevice = /iphone|ipod|ipad/i.test(navigator.platform);
  const isSamsung = /Samsung/i.test(_ua);
  let isFireFox = /Firefox/i.test(_ua);
  let isOpera = /opr/i.test(_ua);
  const isEdge = /edg/i.test(_ua);

  // Opera & FireFox only Trigger on Android
  isFireFox = /android/i.test(_ua);

  if (isOpera) {
    isOpera = /android/i.test(_ua);
  }

  const isChromium = 'onbeforeinstallprompt' in window;
  const isInPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches;
  const isMobileSafari =
    isIDevice && _ua.indexOf('Safari') > -1 && _ua.indexOf('CriOS') < 0;
  const isiPad = isMobileSafari && _ua.indexOf('iPad') > -1;
  const isiPhone = isMobileSafari && _ua.indexOf('iPad') === -1;
  const isPWACompatible =
    isChromium ||
    isMobileSafari ||
    isSamsung ||
    isFireFox ||
    isOpera ||
    isIDevice;

  return {
    isChromium,
    isMobileSafari,
    isiPad,
    isiPhone,
    isEdge,
    isPWACompatible,
    isSamsung,
    isFireFox,
    isOpera,
    isIDevice,
    isInPWA,
  };
};
