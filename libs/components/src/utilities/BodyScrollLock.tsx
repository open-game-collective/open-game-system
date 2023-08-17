import { useEffect } from 'react';

export const BodyScrollLock = () => {
  useEffect(() => {
    // const initialPosition = document.body.style.position;
    // document.body.style.position = 'fixed';

    const onScroll = (e: Event) => {
      e.preventDefault();
      window.scrollTo(0, 0);
    };

    window.addEventListener('scroll', onScroll);

    return () => {
    //   document.body.style.position = initialPosition;
      window.removeEventListener('Scroll', onScroll);
    };
  }, []);
  return null;
};
