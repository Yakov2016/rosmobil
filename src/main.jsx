import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const fontTextSample = 'Росперевозки Москва Владивосток Доставка Страхование Поддержка От 20000 кг 88005553535 ABCxyz';

function isTextEntryActive() {
  const activeElement = document.activeElement;

  if (!(activeElement instanceof HTMLElement)) return false;

  return activeElement.matches('input, textarea, [contenteditable="true"]');
}

function installStableViewportHeight() {
  let viewportWidth = window.innerWidth;

  const setViewportHeight = () => {
    document.documentElement.style.setProperty('--app-vh', `${window.innerHeight * 0.01}px`);
  };

  const handleResize = () => {
    const widthChanged = Math.abs(window.innerWidth - viewportWidth) > 1;

    if (isTextEntryActive() && !widthChanged) return;

    viewportWidth = window.innerWidth;
    setViewportHeight();
  };

  setViewportHeight();

  window.addEventListener('resize', handleResize, { passive: true });
  window.visualViewport?.addEventListener('resize', handleResize, { passive: true });
  window.addEventListener(
    'orientationchange',
    () => {
      window.setTimeout(() => {
        viewportWidth = window.innerWidth;
        setViewportHeight();
      }, 250);
    },
    { passive: true },
  );
}

installStableViewportHeight();

async function loadAppFonts() {
  if (!document.fonts?.load) return;

  await Promise.all([
    ...[400, 500, 600, 700, 800].map((weight) =>
      document.fonts.load(`${weight} 16px Inter`, fontTextSample),
    ),
    ...[600, 700, 800].map((weight) =>
      document.fonts.load(`${weight} 16px Montserrat`, fontTextSample),
    ),
  ]);

  await document.fonts.ready;
}

function showPage() {
  document.documentElement.classList.remove('fonts-loading');
  document.documentElement.classList.add('fonts-ready');
}

async function startApp() {
  try {
    await loadAppFonts();
  } finally {
    createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );

    window.requestAnimationFrame(showPage);
  }
}

startApp();
