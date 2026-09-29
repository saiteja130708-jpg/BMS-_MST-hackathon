import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-500.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import App from './App';
import Galaxy from './Galaxy';
import './styles.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <style>{`body { background: transparent !important; margin: 0; }`}</style>
    <div style={{ position: 'fixed', inset: 0, zIndex: -10, pointerEvents: 'none' }}>
      <Galaxy 
        mouseRepulsion={false}
        mouseInteraction={false}
        density={0.45}
        glowIntensity={0.25}
        saturation={0.8}
        hueShift={240}
      />
    </div>
    <App />
  </React.StrictMode>
);
