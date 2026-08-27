'use client';

import { useEffect, useState } from 'react';

type InstallChoice = { outcome: 'accepted' | 'dismissed' };
type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallChoice>;
};

const DISMISSED_KEY = 'truchita-install-dismissed';

function isAppleMobile() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallPrompt | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
    setShowDialog(false);
  };

  const startInstall = async () => {
    if (!deferredPrompt) {
      setShowGuide(true);
      setShowDialog(true);
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    if (choice.outcome === 'accepted') {
      localStorage.setItem(DISMISSED_KEY, 'true');
      setShowDialog(false);
      return;
    }
    dismiss();
  };

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const wasDismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
    setDismissed(wasDismissed);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const saveInstall = () => {
      localStorage.setItem(DISMISSED_KEY, 'true');
      setShowDialog(false);
    };

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as DeferredInstallPrompt);
      if (!wasDismissed) setShowDialog(true);
    };

    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', saveInstall);

    if (isAppleMobile() && !wasDismissed) {
      setShowGuide(true);
      setShowDialog(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', saveInstall);
    };
  }, []);

  if (!showDialog && !dismissed) return null;

  return <>
    {showDialog && <div className="install-backdrop"><section className="install-card" role="dialog" aria-modal="true" aria-labelledby="install-title"><button className="install-close" type="button" onClick={dismiss} aria-label="Cerrar aviso de instalación">×</button><img src="/app-icon.png" alt="Ícono de El Truchita" /><p>EL TRUCHITA, A UN TOQUE</p><h2 id="install-title">¿INSTALAR<br />LA APP?</h2>{showGuide ? <div className="install-guide"><strong>{isAppleMobile() ? 'En iPhone o iPad:' : 'Desde tu navegador:'}</strong><span>{isAppleMobile() ? 'Pulsa Compartir y elige “Agregar a pantalla de inicio”.' : 'Busca “Instalar aplicación” o “Instalar El Truchita” en el menú del navegador.'}</span></div> : <span className="install-copy">Encuentra el menú y manda tus pedidos más fácil desde el inicio de tu celular o computadora.</span>}<button className="install-action" type="button" onClick={startInstall}>{showGuide ? 'ENTENDIDO' : 'INSTALAR AHORA'} <b>↗</b></button><button className="install-later" type="button" onClick={dismiss}>AHORITA NO</button></section></div>}
    {dismissed && <button className="install-nudge" type="button" onClick={() => { setShowGuide(!deferredPrompt); setShowDialog(true); }}><img src="/app-icon.png" alt="" /><span>INSTALAR<br />LA APP</span></button>}
  </>;
}
