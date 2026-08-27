'use client';

import { FormEvent, useMemo, useState } from 'react';

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  tag?: string;
};

type CartItem = {
  id: string;
  product: Product;
  mayo: boolean;
  queso: boolean;
  crunch: string;
  crunchPrice: number;
  note: string;
};

type Modal = 'none' | 'customize' | 'cart' | 'checkout' | 'sending';

const traditional: Product[] = [
  { id: 'clasico', name: 'EL CLÁSICO', price: 70, description: 'Elote asado al carbón, mayonesa, queso, limón y chile.' },
  { id: 'tocino', name: 'CON TOCINO', price: 80, description: 'Elote al carbón con tocino, limón y chile.' },
  { id: 'salchicha', name: 'CON SALCHICHA', price: 80, description: 'Elote al carbón con salchicha, limón y chile.' },
  { id: 'tocino-salchicha', name: 'TOCINO + SALCHICHA', price: 85, description: 'Elote al carbón con el doble antojo.' },
  { id: 'tocino-queso', name: 'TOCINO + QUESO ESPECIAL', price: 95, description: 'Tocino y mezcla de queso manchego/hebra.' },
  { id: 'salchicha-queso', name: 'SALCHICHA + QUESO ESPECIAL', price: 95, description: 'Salchicha y mezcla de queso manchego/hebra.' },
];

const specialties: Product[] = [
  { id: 'tatemado', name: 'EL TATEMADO', price: 125, description: 'Poblano tatemado, cebolla asada, jalapeño asado, chorizo dorado, queso especial y salsa Truchita.', tag: 'FUEGO' },
  { id: 'choriqueso', name: 'EL CHORIQUESO', price: 135, description: 'Chorizo dorado, mezcla de quesos, cebolla asada y salsa tatemada.', tag: 'FUEGO' },
  { id: 'pastor', name: 'EL PASTOR', price: 145, description: 'Carne al pastor, cebolla, cilantro, queso especial y salsa de la casa.', tag: 'MEXICANO' },
  { id: 'carnitas', name: 'EL CARNITAS', price: 155, description: 'Carnitas, cebolla, cilantro, queso especial, salsa verde o roja y limón.', tag: 'MEXICANO' },
  { id: 'alambre', name: 'EL ALAMBRE', price: 165, description: 'Carne asada, tocino, poblano tatemado, cebolla, quesos fundidos y salsa de la casa.', tag: 'CASA' },
  { id: 'truchita', name: 'EL TRUCHITA', price: 170, description: 'Carne asada, chorizo, tocino, poblano tatemado, cebolla asada, quesos, salsa Truchita y limón.', tag: 'ESPECIALIDAD DE LA CASA' },
];

const crunches = [
  { name: 'Sin extra', price: 0 },
  { name: 'Doritos Flamin’', price: 15 },
  { name: 'Cheetos Flamin’', price: 15 },
  { name: 'Doritos Nachos', price: 15 },
];

// Número de WhatsApp Business completo, sin + ni espacios.
const WHATSAPP_BUSINESS_NUMBER = '522204419169';

const money = (amount: number) => `$${amount}`;

export default function Home() {
  const [modal, setModal] = useState<Modal>('none');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mayo, setMayo] = useState(true);
  const [queso, setQueso] = useState(true);
  const [crunch, setCrunch] = useState(crunches[0]);
  const [note, setNote] = useState('');
  const [customer, setCustomer] = useState({ name: '', phone: '', location: 'Servicio a domicilio', address: '', references: '' });

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price + item.crunchPrice, 0),
    [cart],
  );

  const openCustomizer = (product: Product) => {
    setActiveProduct(product);
    setMayo(true);
    setQueso(true);
    setCrunch(crunches[0]);
    setNote('');
    setModal('customize');
  };

  const addToCart = () => {
    if (!activeProduct) return;
    setCart((items) => [
      ...items,
      {
        id: `${activeProduct.id}-${Date.now()}`,
        product: activeProduct,
        mayo,
        queso,
        crunch: crunch.name,
        crunchPrice: crunch.price,
        note: note.trim(),
      },
    ]);
    setModal('cart');
  };

  const removeItem = (itemId: string) => setCart((items) => items.filter((item) => item.id !== itemId));

  const whatsappUrl = () => {
    const lines = cart.map((item, index) => {
      const extras = [
        `Mayonesa: ${item.mayo ? 'sí' : 'no'}`,
        `Queso: ${item.queso ? 'sí' : 'no'}`,
        `Crunch: ${item.crunch}`,
        item.note ? `Nota: ${item.note}` : '',
      ].filter(Boolean).join(' · ');
      return `${index + 1}. *${item.product.name}* — ${money(item.product.price + item.crunchPrice)}\n   ${extras}`;
    }).join('\n\n');

    const message = `*PEDIDO NUEVO — EL TRUCHITA* 🔥\n\n${lines}\n\n*TOTAL: ${money(total)}*\n\n*Datos de entrega*\nNombre: ${customer.name}\nTeléfono: ${customer.phone}\nModalidad: ${customer.location}\nDirección: ${customer.address}\nReferencias: ${customer.references}`;
    const base = WHATSAPP_BUSINESS_NUMBER
      ? `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=`
      : 'https://web.whatsapp.com/send?text=';
    return `${base}${encodeURIComponent(message)}`;
  };

  const handleCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModal('sending');
    window.setTimeout(() => {
      window.location.assign(whatsappUrl());
    }, 1150);
  };

  return (
    <main>
      <header className="site-header">
        <a className="mini-logo" href="#inicio" aria-label="El Truchita, inicio">
          <span>ESQUITES</span>
          <strong>EL TRUCHITA</strong>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#proceso">EL FUEGO</a>
          <a href="#menu">MENÚ</a>
          <a href="#contacto">A DOMICILIO</a>
        </nav>
        <button className="header-order" type="button" onClick={() => setModal('cart')}>
          MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} aria-label={cart.length ? `${cart.length} productos seleccionados` : 'Sin productos seleccionados'} />
        </button>
      </header>

      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-photo" />
        <div className="hero-ink" />
        <div className="hero-grain" aria-hidden="true" />
        <div className="smoke smoke-one" aria-hidden="true" />
        <div className="smoke smoke-two" aria-hidden="true" />
        <div className="ember-field" aria-hidden="true">
          {[['7%', '21%', '0s'], ['27%', '79%', '1.2s'], ['55%', '16%', '2.1s'], ['68%', '68%', '.7s'], ['91%', '32%', '1.6s']].map(([left, top, delay]) => <i className="ember" key={left} style={{ left, top, animationDelay: delay }} />)}
        </div>
        <div className="hero-content">
          <p className="eyebrow"><span />ZACAPOAXTLA, PUEBLA <span /></p>
          <h1 id="hero-title"><span className="esquites">ESQUITES</span><span className="truchita">EL TRUCHITA</span><span className="carbon">AL CARBÓN</span></h1>
          <p className="hero-sentence">Del elote a la brasa.<br />De la brasa al vaso.</p>
          <p className="hero-detail">Elote asado al carbón, desgranado y preparado al momento.</p>
          <div className="hero-actions">
            <a className="button button-fire" href="#menu">VER MENÚ <span>↓</span></a>
            <a className="button button-ghost" href="#contacto">VER HORARIOS <span>↓</span></a>
          </div>
        </div>
        <div className="hero-edge"><span>MAÍZ</span><b>✦</b><span>FUEGO</span><b>✦</b><span>CALLE</span><b>✦</b><span>MAÍZ</span><b>✦</b><span>FUEGO</span></div>
      </section>

      <section className="process" id="proceso" aria-labelledby="process-title">
        <div className="process-intro">
          <p className="section-kicker">LA DIFERENCIA ESTÁ EN EL HUMO</p>
          <h2 id="process-title">AQUÍ EL MAÍZ<br />SÍ CONOCE<br /><em>EL FUEGO.</em></h2>
          <p>Nuestros elotes pasan directo por el carbón. Se asan, se desgranan y se preparan al momento para que cada vaso llegue con ese sabor que no sale de una olla.</p>
        </div>
        <div className="process-steps" aria-label="Proceso de preparación">
          {[
            ['01', '◉', 'ELOTE', 'Elegimos el maíz que aguanta el fuego.'],
            ['02', '✦', 'CARBÓN', 'Aquí no hervimos el sabor.'],
            ['03', '╱', 'DESGRANADO', 'Sale de la brasa, directo al cuchillo.'],
            ['04', '▰', 'AL VASO', 'Lo preparamos cuando lo pides.'],
          ].map(([number, visual, title, description]) => <article className="process-step" key={title}><div className="step-number">{number}</div><div className="step-visual" aria-hidden="true"><span>{visual}</span></div><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>

      <section className="menu" id="menu" aria-labelledby="menu-title">
        <div className="menu-lead">
          <p className="section-kicker light">ARMA TU VASO, A TU GUSTO</p>
          <h2 id="menu-title">EL MENÚ<br /><em>ESTÁ CALIENTE.</em></h2>
          <div className="menu-lead-side"><figure className="menu-photo"><img src="/esquite-callejero.png" alt="Vaso de esquites al carbón con chile, queso y limón" /><figcaption>HECHOS AL MOMENTO · SOLO A DOMICILIO</figcaption></figure><p>Cada esquite se prepara al momento. Elige tus ingredientes, añade un toque crujiente y déjanos tu nota.</p></div>
        </div>

        <MenuSection eyebrow="LOS DE SIEMPRE. PERO AQUÍ EMPIEZAN EN EL CARBÓN." title="LOS TRADICIONALES" products={traditional} onChoose={openCustomizer} />
        <MenuSection eyebrow="SABORES DE MÉXICO LLEVADOS AL ESQUITE." title="ESPECIALES DE LA CASA" products={specialties} onChoose={openCustomizer} accent />

        <div className="menu-bottom-line"><span>¿YA SABES QUÉ SE TE ANTOJA?</span><button type="button" onClick={() => setModal('cart')}>VER MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></div>
      </section>

      <section className="contact" id="contacto">
        <div><p className="section-kicker">CUANDO EL ANTOJO PEGA</p><h2>SOLO A<br /><em>DOMICILIO.</em></h2></div>
        <div className="contact-copy"><p>Entregamos en Zacapoaxtla, Puebla.</p><dl className="hours"><div><dt>DOMINGO A VIERNES</dt><dd>6:30 P. M. — 12:30 A. M.</dd></div><div><dt>SÁBADO</dt><dd>CERRADO</dd></div></dl><a href={WHATSAPP_BUSINESS_NUMBER ? `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}` : 'https://web.whatsapp.com/'} target="_blank" rel="noreferrer">PEDIR POR WHATSAPP <span>↗</span></a></div>
      </section>

      <footer><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><p>SOLO A DOMICILIO · DOM–VIE 6:30 P. M. — 12:30 A. M.</p><button type="button" onClick={() => setModal('cart')}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></footer>

      <button className="floating-order" type="button" onClick={() => setModal('cart')} aria-label="Abrir mi pedido">
        <span>MI PEDIDO</span><strong>{cart.length || '0'}</strong><i className={cart.length ? 'cart-dot active' : 'cart-dot'} />
      </button>

      {modal !== 'none' && <div className="modal-backdrop" onMouseDown={() => modal !== 'sending' && setModal('none')}>
        <section className={`order-modal ${modal}`} role="dialog" aria-modal="true" aria-label="Mi pedido" onMouseDown={(event) => event.stopPropagation()}>
          {modal !== 'sending' && <button className="close-modal" type="button" onClick={() => setModal('none')} aria-label="Cerrar">×</button>}
          {modal === 'customize' && activeProduct && <>
            <p className="modal-kicker">PERSONALIZA TU VASO</p><h2>{activeProduct.name}</h2><p className="modal-price">{money(activeProduct.price)} <small>base</small></p>
            <div className="custom-options">
              <label className="switch-row"><span><b>MAYONESA</b><small>Como te gusta, o sin ella.</small></span><input type="checkbox" checked={mayo} onChange={(event) => setMayo(event.target.checked)} /><i /></label>
              <label className="switch-row"><span><b>QUESO</b><small>Queso para cerrar bien el vaso.</small></span><input type="checkbox" checked={queso} onChange={(event) => setQueso(event.target.checked)} /><i /></label>
              <fieldset><legend>¿LE PONEMOS ALGO CRUJIENTE?</legend><div className="crunch-grid">{crunches.map((option) => <label key={option.name} className={crunch.name === option.name ? 'crunch-option selected' : 'crunch-option'}><input type="radio" name="crunch" checked={crunch.name === option.name} onChange={() => setCrunch(option)} /><span>{option.name}</span><b>{option.price ? `+${money(option.price)}` : '—'}</b></label>)}</div></fieldset>
              <label className="note-field"><span>NOTA PARA TU PEDIDO</span><textarea maxLength={180} placeholder="Ej. bien picoso, sin limón..." value={note} onChange={(event) => setNote(event.target.value)} /></label>
            </div>
            <button className="wide-action" type="button" onClick={addToCart}>AGREGAR A MI PEDIDO <span>{money(activeProduct.price + crunch.price)}</span></button>
          </>}

          {modal === 'cart' && <>
            <p className="modal-kicker">ESTO ES LO QUE SE VA A LA BRASA</p><h2>MI PEDIDO <span className="cart-count">{cart.length}</span></h2>
            {cart.length === 0 ? <div className="empty-cart"><span>◌</span><p>Aún no hay esquites aquí.</p><button type="button" onClick={() => { setModal('none'); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}>VER EL MENÚ</button></div> : <>
              <div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><div><h3>{item.product.name}</h3><p>{item.mayo ? 'Con mayo' : 'Sin mayo'} · {item.queso ? 'Con queso' : 'Sin queso'} · {item.crunch}{item.note ? ` · “${item.note}”` : ''}</p></div><b>{money(item.product.price + item.crunchPrice)}</b><button type="button" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.product.name}`}>×</button></article>)}</div>
              <div className="cart-total"><span>TOTAL</span><strong>{money(total)}</strong></div>
              <div className="cart-actions"><button type="button" className="secondary-action" onClick={() => { setModal('none'); document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' }); }}>SEGUIR ORDENANDO</button><button type="button" className="empty-button" onClick={() => setCart([])}>VACIAR SELECCIÓN</button></div>
              <button className="wide-action" type="button" onClick={() => setModal('checkout')}>REALIZAR PEDIDO <span>→</span></button>
            </>}
          </>}

          {modal === 'checkout' && <form onSubmit={handleCheckout}><p className="modal-kicker">SERVICIO ÚNICAMENTE A DOMICILIO</p><h2>¿A NOMBRE DE QUIÉN?</h2><p className="checkout-note">Estos datos van incluidos en tu mensaje de WhatsApp.</p><div className="customer-form"><label><span>NOMBRE</span><input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" /></label><label><span>TELÉFONO</span><input required type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Tu número" /></label><div className="delivery-only">ENTREGA A DOMICILIO</div><label><span>DIRECCIÓN</span><input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y colonia" /></label><label className="form-wide"><span>REFERENCIAS</span><textarea required value={customer.references} onChange={(event) => setCustomer({ ...customer, references: event.target.value })} placeholder="Color de portón, entre calles o cualquier referencia." /></label></div><button className="wide-action" type="submit">ENVIAR A WHATSAPP <span>↗</span></button><button className="back-button" type="button" onClick={() => setModal('cart')}>← VOLVER A MI PEDIDO</button></form>}

          {modal === 'sending' && <div className="sending-state"><div className="corn-flight" aria-hidden="true"><span>◐</span><i>✦</i><i>✦</i><i>✦</i></div><p className="modal-kicker">PREPARANDO TU MENSAJE</p><h2>¡VA VOLANDO<br />A WHATSAPP!</h2><p>Un momento, ya llevamos tu pedido.</p></div>}
        </section>
      </div>}
    </main>
  );
}

function MenuSection({ eyebrow, title, products, onChoose, accent = false }: { eyebrow: string; title: string; products: Product[]; onChoose: (product: Product) => void; accent?: boolean }) {
  return <section className={accent ? 'menu-section menu-section-accent' : 'menu-section'}><header><p>{eyebrow}</p><h3>{title}</h3></header><div className="product-grid">{products.map((product, index) => <article className={product.id === 'truchita' ? 'product-card product-card-featured' : 'product-card'} key={product.id}><div className="product-number">{String(index + 1).padStart(2, '0')}</div><div className="product-copy">{product.tag && <span className="product-tag">{product.tag}</span>}<h4>{product.name}</h4><p>{product.description}</p></div><strong>{money(product.price)}</strong><button type="button" onClick={() => onChoose(product)}>PERSONALIZAR <span>+</span></button></article>)}</div></section>;
}
