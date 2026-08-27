'use client';

import { MouseEvent, useState } from 'react';

export default function Home() {
  const [openingMenu, setOpeningMenu] = useState(false);

  const openMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (openingMenu) return;
    setOpeningMenu(true);
    window.setTimeout(() => window.location.assign('/menu'), 920);
  };

  return <main className="landing-page">
    <header className="site-header landing-header">
      <a className="mini-logo" href="#inicio" aria-label="El Truchita, inicio"><span>ESQUITES</span><strong>EL TRUCHITA</strong></a>
      <nav aria-label="Navegación principal"><a href="/menu" onClick={openMenu}>MENÚ</a><a href="#domicilio">A DOMICILIO</a></nav>
      <a className="header-order header-menu" href="/menu" onClick={openMenu}>VER MENÚ <i aria-hidden="true">↗</i></a>
    </header>

    <section className="hero landing-hero" id="inicio" aria-labelledby="hero-title">
      <div className="hero-photo" /><div className="hero-ink" /><div className="hero-grain" aria-hidden="true" /><div className="vintage-burn burn-one" aria-hidden="true" /><div className="vintage-burn burn-two" aria-hidden="true" />
      <div className="smoke smoke-one" aria-hidden="true" /><div className="smoke smoke-two" aria-hidden="true" />
      <div className="ember-field" aria-hidden="true">{[['7%', '21%', '0s'], ['27%', '79%', '1.2s'], ['55%', '16%', '2.1s'], ['68%', '68%', '.7s'], ['91%', '32%', '1.6s']].map(([left, top, delay]) => <i className="ember" key={left} style={{ left, top, animationDelay: delay }} />)}</div>
      <div className="hero-content"><p className="eyebrow"><span />ZACAPOAXTLA, PUEBLA <span /></p><h1 id="hero-title"><span className="esquites">ESQUITES</span><span className="truchita">EL TRUCHITA</span><span className="carbon">AL CARBÓN</span></h1><p className="hero-sentence">Del elote a la brasa.<br />De la brasa al vaso.</p><p className="hero-detail">Elote asado al carbón, desgranado y preparado al momento.</p><div className="hero-actions"><a className="button button-fire" href="/menu" onClick={openMenu}>VER MENÚ <span>↓</span></a></div></div>
      <aside className="future-space" id="domicilio"><p>PRÓXIMAMENTE</p><strong>UN RINCÓN PARA DISFRUTARLO CON CALMA.</strong><span>Estamos preparando un espacio para que nuestros clientes degusten su preparación tranquilamente.</span></aside>
      <div className="hero-edge"><span>SOLO A DOMICILIO</span><b>✦</b><span>DOM–VIE · 6:30 P. M. — 12:30 A. M.</span><b>✦</b><span>SÁBADO CERRADO</span></div>
    </section>

    {openingMenu && <div className="menu-transition" aria-live="polite" aria-label="Encendiendo el carbón y abriendo el menú"><div className="transition-coals" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="transition-flame" aria-hidden="true">♨</div><div className="transition-sparks" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} />)}</div><p>ENCENDIENDO EL CARBÓN…</p></div>}
  </main>;
}
