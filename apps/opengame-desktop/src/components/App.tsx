import { invoke } from '@tauri-apps/api';
import { useEffect } from 'react';

export function App() {
  useEffect(() => {
    // now we can call our Command!
    // Right-click the application background and open the developer tools.
    // You will see "Hello, World!" printed in the console!
    invoke('greet', { name: 'World' })
      // `invoke` returns a Promise
      .then((response) => console.log(response));
  }, []);

  return <div>Welcome to the OGS Desktop App!</div>;
}
