import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {injectSpeedInsights} from '@vercel/speed-insights';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

injectSpeedInsights();
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
