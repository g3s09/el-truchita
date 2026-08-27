'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { defaultMenu, ExtraOption, isMenuData, MenuData, Product } from '@/lib/menu';

type CartItem = { id: string; product: Product; mayo: boolean; queso: boolean; extra: ExtraOption; note: string };
type Modal = 'none' | 'customize' | 'cart' | 'checkout' | 'sending';

const WHATSAPP_BUSINESS_NUMBER = '522204419169';
const money = (amount: number) => `$${amount}`;

function IngredientReference({ kind }: { kind: 'mayo' | 'queso' | 'elote' | 'ingredientes' }) {
  return <span className={`ingredient-reference ingredient-${kind}`} aria-hidden="true" />;
}

export default function Home() {
  const [menu, setMenu] = useState<MenuData>(defaultMenu);
  const [modal, setModal] = useState<Modal>('none');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mayo, setMayo] = useState(true);
  const [queso, setQueso] = useState(true);
  const [extra, setExtra] = useState<ExtraOption>(defaultMenu.extras[0]);
  const [note, setNote] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', references: '' });

  useEffect(() => {
    let live = true;
    fetch('/api/menu', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data: unknown) => { if (live && isMenuData(data)) setMenu(data); })
      .catch(() => undefined);
    return () => { live = false; };
  }, []);

  const traditional = menu.products.filter((product) => product.section === 'traditional');
  const specialties = menu.products.filter((product) => product.section === 'specialty');
  const availableExtras = useMemo(
    () => menu.extras.filter((option) => !option.onlyWithIngredients || activeProduct?.hasIngredients),
    [activeProduct, menu.extras],
  );
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.price + item.extra.price, 0), [cart]);

  const openCustomizer = (product: Product) => {
    setActiveProduct(product);
    setMayo(true);
    setQueso(true);
    setExtra(menu.extras.find((option) => option.id === 'sin-extra') ?? menu.extras[0]);
    setNote('');
    setModal('customize');
  };

  const addToCart = () => {
    if (!activeProduct) return;
    setCart((items) => [...items, { id: `${activeProduct.id}-${Date.now()}`, product: activeProduct, mayo, queso, extra, note: note.trim() }]);
    setModal('cart');
  };

  const whatsappUrl = () => {
    const order = cart.map((item, index) => {
      const details = [`Mayonesa: ${item.mayo ? 'sí' : 'no'}`, `Queso: ${item.queso ? 'sí' : 'no'}`, `Extra: ${item.extra.name}`, item.note ? `Nota: ${item.note}` : ''].filter(Boolean).join(' · ');
      return `${index + 1}. *${item.product.name}* — ${money(item.product.price + item.extra.price)}\n   ${details}`;
    }).join('\n\n');
    const message = `*PEDIDO NUEVO — EL TRUCHITA* 🔥\n\n${order}\n\n*TOTAL: ${money(total)}*\n\n*Datos de entrega*\nNombre: ${customer.name}\nTeléfono: ${customer.phone}\nModalidad: Servicio a domicilio\nDirección: ${customer.address}\nReferencias: ${customer.references}`;
    return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const handleCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModal('sending');
    window.setTimeout(() => window.location.assign(whatsappUrl()), 1150);
  };

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="mini-logo" href="#inicio" aria-label="El Truchita, inicio"><span>ESQUITES</span><strong>EL TRUCHITA</strong></a>
        <nav aria-label="Navegación principal"><a href="#proceso">EL FUEGO</a><a href="#menu">MENÚ</a><a href="#contacto">A DOMICILIO</a></nav>
        <button className="header-order" type="button" onClick={() => setModal('cart')}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} aria-label={cart.length ? `${cart.length} productos seleccionados` : 'Sin productos seleccionados'} /></button>
      </header>

      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-photo" /><div className="hero-ink" /><div className="hero-grain" aria-hidden="true" /><div className="vintage-burn burn-one" aria-hidden="true" /><div className="vintage-burn burn-two" aria-hidden="true" />
        <div className="smoke smoke-one" aria-hidden="true" /><div className="smoke smoke-two" aria-hidden="true" />
        <div className="ember-field" aria-hidden="true">{[['7%', '21%', '0s'], ['27%', '79%', '1.2s'], ['55%', '16%', '2.1s'], ['68%', '68%', '.7s'], ['91%', '32%', '1.6s']].map(([left, top, delay]) => <i className="ember" key={left} style={{ left, top, animationDelay: delay }} />)}</div>
        <div className="hero-content"><p className="eyebrow"><span />ZACAPOAXTLA, PUEBLA <span /></p><h1 id="hero-title"><span className="esquites">ESQUITES</span><span className="truchita">EL TRUCHITA</span><span className="carbon">AL CARBÓN</span></h1><p className="hero-sentence">Del elote a la brasa.<br />De la brasa al vaso.</p><p className="hero-detail">Elote asado al carbón, desgranado y preparado al momento.</p><div className="hero-actions"><a className="button button-fire" href="#menu">VER MENÚ <span>↓</span></a><a className="button button-ghost" href="#contacto">VER HORARIOS <span>↓</span></a></div></div>
        <div className="hero-edge"><span>MAÍZ</span><b>✦</b><span>FUEGO</span><b>✦</b><span>CALLE</span><b>✦</b><span>MAÍZ</span><b>✦</b><span>FUEGO</span></div>
      </section>

      <section className="process" id="proceso" aria-labelledby="process-title"><div className="process-intro"><p className="section-kicker">LA DIFERENCIA ESTÁ EN EL HUMO</p><h2 id="process-title">AQUÍ EL MAÍZ<br />SÍ CONOCE<br /><em>EL FUEGO.</em></h2><p>Nuestros elotes pasan directo por el carbón. Se asan, se desgranan y se preparan al momento para que cada vaso llegue con ese sabor que no sale de una olla.</p></div><div className="process-steps" aria-label="Proceso de preparación">{[['01', '◉', 'ELOTE', 'Elegimos el maíz que aguanta el fuego.'], ['02', '✦', 'CARBÓN', 'Aquí no hervimos el sabor.'], ['03', '╱', 'DESGRANADO', 'Sale de la brasa, directo al cuchillo.'], ['04', '▰', 'AL VASO', 'Lo preparamos cuando lo pides.']].map(([number, visual, title, description]) => <article className="process-step" key={title}><div className="step-number">{number}</div><div className="step-visual" aria-hidden="true"><span>{visual}</span></div><h3>{title}</h3><p>{description}</p></article>)}</div></section>

      <section className="menu" id="menu" aria-labelledby="menu-title"><div className="menu-lead"><p className="section-kicker light">ARMA TU VASO, A TU GUSTO</p><h2 id="menu-title">EL MENÚ<br /><em>ESTÁ CALIENTE.</em></h2><div className="menu-lead-side"><figure className="menu-photo"><img src="/esquite-callejero.png" alt="Vaso de esquites al carbón con chile, queso y limón" /><figcaption>HECHOS AL MOMENTO · SOLO A DOMICILIO</figcaption></figure><p>Cada esquite se prepara al momento. Elige tus ingredientes, revisa su foto de referencia y déjanos tu nota.</p></div></div>
        <MenuSection eyebrow="LOS DE SIEMPRE. PERO AQUÍ EMPIEZAN EN EL CARBÓN." title="LOS TRADICIONALES" products={traditional} onChoose={openCustomizer} />
        <MenuSection eyebrow="SABORES DE MÉXICO LLEVADOS AL ESQUITE." title="ESPECIALES DE LA CASA" products={specialties} onChoose={openCustomizer} accent />
        <div className="menu-bottom-line"><span>¿YA SABES QUÉ SE TE ANTOJA?</span><button type="button" onClick={() => setModal('cart')}>VER MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></div>
      </section>

      <section className="contact" id="contacto"><div><p className="section-kicker">CUANDO EL ANTOJO PEGA</p><h2>SOLO A<br /><em>DOMICILIO.</em></h2></div><div className="contact-copy"><p>Entregamos en Zacapoaxtla, Puebla.</p><dl className="hours"><div><dt>DOMINGO A VIERNES</dt><dd>6:30 P. M. — 12:30 A. M.</dd></div><div><dt>SÁBADO</dt><dd>CERRADO</dd></div></dl><a href={`https://wa.me/${WHATSAPP_BUSINESS_NUMBER}`} target="_blank" rel="noreferrer">PEDIR POR WHATSAPP <span>↗</span></a></div></section>
      <footer><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><p>SOLO A DOMICILIO · DOM–VIE 6:30 P. M. — 12:30 A. M.</p><button type="button" onClick={() => setModal('cart')}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></footer>
      <button className="floating-order" type="button" onClick={() => setModal('cart')} aria-label="Abrir mi pedido"><span>MI PEDIDO</span><strong>{cart.length || '0'}</strong><i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button>

      {modal !== 'none' && <div className="modal-backdrop" onMouseDown={() => modal !== 'sending' && setModal('none')}><section className={`order-modal ${modal}`} role="dialog" aria-modal="true" aria-label="Mi pedido" onMouseDown={(event) => event.stopPropagation()}>
        {modal !== 'sending' && <button className="close-modal" type="button" onClick={() => setModal('none')} aria-label="Cerrar">×</button>}
        {modal === 'customize' && activeProduct && <><p className="modal-kicker">PERSONALIZA TU VASO</p><h2>{activeProduct.name}</h2><p className="modal-price">{money(activeProduct.price)} <small>base</small></p><div className="custom-options">
          <label className="switch-row switch-row-visual"><span className="switch-option-copy"><IngredientReference kind="mayo" /><span><b>MAYONESA</b><small>Como te gusta, o sin ella.</small></span></span><input type="checkbox" checked={mayo} onChange={(event) => setMayo(event.target.checked)} /><i /></label>
          <label className="switch-row switch-row-visual"><span className="switch-option-copy"><IngredientReference kind="queso" /><span><b>QUESO</b><small>Queso para cerrar bien el vaso.</small></span></span><input type="checkbox" checked={queso} onChange={(event) => setQueso(event.target.checked)} /><i /></label>
          <fieldset><legend>¿LE METEMOS UN EXTRA?</legend><div className="extra-grid">{availableExtras.map((option) => <label key={option.id} className={extra.id === option.id ? 'extra-option selected' : 'extra-option'}><input type="radio" name="extra" checked={extra.id === option.id} onChange={() => setExtra(option)} /><IngredientReference kind={option.imagePosition} /><span><b>{option.name}</b><small>{option.description}</small></span><strong>{option.price ? `+${money(option.price)}` : '—'}</strong></label>)}</div></fieldset>
          <label className="note-field"><span>NOTA PARA TU PEDIDO</span><textarea maxLength={180} placeholder="Ej. bien picoso, sin limón..." value={note} onChange={(event) => setNote(event.target.value)} /></label>
        </div><button className="wide-action" type="button" onClick={addToCart}>AGREGAR A MI PEDIDO <span>{money(activeProduct.price + extra.price)}</span></button></>}

        {modal === 'cart' && <><p className="modal-kicker">ESTO ES LO QUE SE VA A LA BRASA</p><h2>MI PEDIDO <span className="cart-count">{cart.length}</span></h2>{cart.length === 0 ? <div className="empty-cart"><span>◌</span><p>Aún no hay esquites aquí.</p><button type="button" onClick={() => { setModal('none'); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}>VER EL MENÚ</button></div> : <><div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><div><h3>{item.product.name}</h3><p>{item.mayo ? 'Con mayo' : 'Sin mayo'} · {item.queso ? 'Con queso' : 'Sin queso'} · {item.extra.name}{item.note ? ` · “${item.note}”` : ''}</p></div><b>{money(item.product.price + item.extra.price)}</b><button type="button" onClick={() => setCart((items) => items.filter((cartItem) => cartItem.id !== item.id))} aria-label={`Eliminar ${item.product.name}`}>×</button></article>)}</div><div className="cart-total"><span>TOTAL</span><strong>{money(total)}</strong></div><div className="cart-actions"><button type="button" className="secondary-action" onClick={() => { setModal('none'); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}>SEGUIR ORDENANDO</button><button type="button" className="empty-button" onClick={() => setCart([])}>VACIAR SELECCIÓN</button></div><button className="wide-action" type="button" onClick={() => setModal('checkout')}>REALIZAR PEDIDO <span>→</span></button></>}</>}

        {modal === 'checkout' && <form onSubmit={handleCheckout}><p className="modal-kicker">SERVICIO ÚNICAMENTE A DOMICILIO</p><h2>¿A NOMBRE DE QUIÉN?</h2><p className="checkout-note">Estos datos van incluidos en tu mensaje de WhatsApp.</p><div className="customer-form"><label><span>NOMBRE</span><input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" /></label><label><span>TELÉFONO</span><input required type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Tu número" /></label><div className="delivery-only">ENTREGA A DOMICILIO</div><label><span>DIRECCIÓN</span><input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y colonia" /></label><label className="form-wide"><span>REFERENCIAS</span><textarea required value={customer.references} onChange={(event) => setCustomer({ ...customer, references: event.target.value })} placeholder="Color de portón, entre calles o cualquier referencia." /></label></div><button className="wide-action" type="submit">ENVIAR A WHATSAPP <span>↗</span></button><button className="back-button" type="button" onClick={() => setModal('cart')}>← VOLVER A MI PEDIDO</button></form>}
        {modal === 'sending' && <div className="sending-state"><div className="corn-flight" aria-hidden="true"><span>◐</span><i>✦</i><i>✦</i><i>✦</i></div><p className="modal-kicker">PREPARANDO TU MENSAJE</p><h2>¡VA VOLANDO<br />A WHATSAPP!</h2><p>Un momento, ya llevamos tu pedido.</p></div>}
      </section></div>}
    </main>
  );
}

function MenuSection({ eyebrow, title, products, onChoose, accent = false }: { eyebrow: string; title: string; products: Product[]; onChoose: (product: Product) => void; accent?: boolean }) {
  return <section className={accent ? 'menu-section menu-section-accent' : 'menu-section'}><header><p>{eyebrow}</p><h3>{title}</h3></header><div className="product-grid">{products.map((product, index) => <article className={product.id === 'truchita' ? 'product-card product-card-featured' : 'product-card'} key={product.id}><div className="product-number">{String(index + 1).padStart(2, '0')}</div><figure className="product-thumb"><img src={product.image || '/esquite-callejero.png'} alt="" /></figure><div className="product-copy">{product.tag && <span className="product-tag">{product.tag}</span>}<h4>{product.name}</h4><p>{product.description}</p></div><strong>{money(product.price)}</strong><button type="button" onClick={() => onChoose(product)}>PERSONALIZAR <span>+</span></button></article>)}</div></section>;
}
