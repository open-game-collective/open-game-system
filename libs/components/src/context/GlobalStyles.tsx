import { getCssText } from '@explorers-club/styles';

export const GlobalStyles = () => {
  return (
    <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
  );
};
