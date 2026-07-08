import type { AppProps } from 'next/app';
import '@origon/tokens-react/css';
import '@origon/tokens-react/themes/css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
