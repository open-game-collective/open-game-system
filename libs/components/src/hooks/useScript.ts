import { ReadableAtom, WritableAtom, atom } from 'nanostores';
import { useEffect, useMemo } from 'react';

// Script Record Definition
type ScriptLoadState = 'idle' | 'loading' | 'loaded' | 'error';

// Store to maintain script loading status atoms
const scriptStateMap = {} as Record<string, WritableAtom<ScriptLoadState>>;

// Hook to dynamically load scripts
export function useScript(src: string) {
  const status$ = useMemo(() => {
    let $ = scriptStateMap[src];

    if (!$) {
      $ = atom('idle');
      scriptStateMap[src] = $;
    }
    return $;
    // return scriptStateMap[src];
  }, [src]);

  useEffect(() => {
    // Check if the atom for this src already exists
    const status = status$.get();

    // If already loaded or loading, no need to proceed
    if (status !== 'idle') {
      return;
    }
    status$.set('loading');

    let script = document.querySelector(
      `script[src="${src}"]`
    ) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        status$.set('loaded');
      };

      script.onerror = () => {
        status$.set('error');
      };

      document.body.appendChild(script);
    } else if (script.hasAttribute('loaded')) {
      status$.set('loaded');
    }

    return () => {
      script?.removeEventListener('load', () => status$.set('loaded'));
      script?.removeEventListener('error', () => status$.set('error'));
    };
  }, [status$]);

  return status$ as ReadableAtom<ScriptLoadState>;
}
