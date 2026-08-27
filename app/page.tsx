'use client';

import { useEffect, useState } from 'react';
import InstallPrompt from '@/components/InstallPrompt';

export default function Home() {
  const [showArrival, setShowArrival] = useState(false);

  useEffect(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type !== 'reload') return;
    setShowArrival(true);
    const timer = window.setTimeout(() => setShowArrival(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  return <main className="landing-page">
    <header className="site-header landing-header">
      <a className="mini-logo" href="#inicio" aria-label="El Truchita, inicio"><span>ESQUITES</span><strong>EL TRUCHITA</strong></a>
      <nav aria-label="Navegación principal"><a href="/menu">MENÚ</a><a href="#domicilio">A DOMICILIO</a></nav>
      <a className="header-order header-menu" href="/menu">VER MENÚ <i aria-hidden="true">↗</i></a>
    </header>

    <section className="hero landing-hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-photo" /><div className="hero-ink" /><div className="hero-grain" aria-hidden="true" /><div className="vintage-burn burn-one" aria-hidden="true" /><div className="vintage-burn burn-two" aria-hidden="true" />
      <div className="smoke smoke-one" aria-hidden="true" /><div className="smoke smoke-two" aria-hidden="true" />
      <div className="ember-field" aria-hidden="true">{[['7%', '21%', '0s'], ['27%', '79%', '1.2s'], ['55%', '16%', '2.1s'], ['68%', '68%', '.7s'], ['91%', '32%', '1.6s']].map(([left, top, delay]) => <i className="ember" key={left} style={{ left, top, animationDelay: delay }} />)}</div>
      <div className="hero-content"><p className="eyebrow"><span />ZACAPOAXTLA, PUEBLA <span /></p><h1 id="hero-title"><span className="esquites">ESQUITES</span><span className="truchita">EL TRUCHITA</span><span className="carbon">AL CARBÓN</span></h1><p className="hero-sentence">Del elote a la brasa.<br />De la brasa al vaso.</p><p className="hero-detail">Elote asado al carbón, desgranado y preparado al momento.</p><div className="hero-actions"><a className="button button-fire" href="/menu">VER MENÚ <span>↓</span></a></div></div>
      <aside className="future-space" id="domicilio"><p>PRÓXIMAMENTE</p><strong>UN RINCÓN PARA DISFRUTARLO CON CALMA.</strong><span>Estamos preparando un espacio para que nuestros clientes degusten su preparación tranquilamente.</span></aside>
      <div className="hero-edge"><span>SOLO A DOMICILIO</span><b>✦</b><span>DOM–VIE · 6:30 P. M. — 12:30 A. M.</span><b>✦</b><span>SÁBADO CERRADO</span></div>
    </section>

    {showArrival && <div className="site-arrival" aria-live="polite" aria-label="Bienvenida a El Truchita"><div className="arrival-rings" aria-hidden="true"><i /><i /><i /></div><div className="arrival-embers" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div><img src="/app-icon.png" alt="" /><p>DE LA BRASA A TU ANTOJO</p></div>}
    <InstallPrompt />
  </main>;
}
