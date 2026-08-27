'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { defaultMenu, ExtraOption, isMenuData, MenuData, MenuSection as MenuSectionType, Product } from '@/lib/menu';

type SnackFlavor = { id: string; name: string; note: string; color: string };
type CartItem = { id: string; product: Product; mayo: boolean; queso: boolean; extra: ExtraOption; note: string; snackFlavor?: SnackFlavor };
type Modal = 'none' | 'customize' | 'cart' | 'checkout' | 'sending';

const WHATSAPP_BUSINESS_NUMBER = '522204419169';
const money = (amount: number) => `$${amount}`;
const snackFlavors: SnackFlavor[] = [
  { id: 'doritos-nacho', name: 'DORITOS NACHO', note: 'Crujiente y quesito.', color: 'maize' },
  { id: 'doritos-fuego', name: 'DORITOS FUEGO', note: 'Con un toque más bravo.', color: 'ember' },
  { id: 'cheetos-flamin', name: 'CHEETOS FLAMIN’ HOT', note: 'Para quien quiere picante.', color: 'flamin' },
  { id: 'takis', name: 'TAKIS', note: 'Chile y limón al frente.', color: 'lime' },
  { id: 'tostitos', name: 'TOSTITOS', note: 'El clásico para llenar bien.', color: 'toast' },
];

const panelDetails: Array<{ key: MenuSectionType; nav: string; eyebrow: string; title: string; accent?: boolean }> = [
  { key: 'traditional', nav: 'TRADICIONALES', eyebrow: 'LOS DE SIEMPRE. PERO AQUÍ EMPIEZAN EN EL CARBÓN.', title: 'LOS TRADICIONALES' },
  { key: 'specialty', nav: 'ESPECIALES', eyebrow: 'SABORES DE MÉXICO LLEVADOS AL ESQUITE.', title: 'ESPECIALES DE LA CASA', accent: true },
  { key: 'elotes', nav: 'ELOTES', eyebrow: 'DEL ASADOR A TUS MANOS.', title: 'ELOTES AL CARBÓN' },
  { key: 'bolsa', nav: 'EN BOLSA', eyebrow: 'ABRIMOS LA BOTANA. EL RESTO LO HACEMOS NOSOTROS.', title: 'ESQUITES EN BOLSA', accent: true },
];

function IngredientReference({ kind }: { kind: 'mayo' | 'queso' | 'elote' | 'ingredientes' }) {
  return <span className={`ingredient-reference ingredient-${kind}`} aria-hidden="true" />;
}

function serviceLabel(product: Product) {
  if (product.service === 'bag') return 'PERSONALIZA TU BOLSA';
  if (product.service === 'corn') return 'PERSONALIZA TU ELOTE';
  return 'PERSONALIZA TU VASO';
}

export default function MenuExperience() {
  const [menu, setMenu] = useState<MenuData>(defaultMenu);
  const [modal, setModal] = useState<Modal>('none');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mayo, setMayo] = useState(true);
  const [queso, setQueso] = useState(true);
  const [extra, setExtra] = useState<ExtraOption>(defaultMenu.extras[0]);
  const [note, setNote] = useState('');
  const [snackFlavor, setSnackFlavor] = useState<SnackFlavor>(snackFlavors[0]);
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '', references: '' });
  const panelRail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    fetch('/api/menu', { cache: 'no-store' }).then((response) => response.json()).then((data: unknown) => {
      if (live && isMenuData(data)) setMenu(data);
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);

  const productsBySection = useMemo(() => Object.fromEntries(panelDetails.map((panel) => [panel.key, menu.products.filter((product) => product.section === panel.key)])) as Record<MenuSectionType, Product[]>, [menu.products]);
  const availableExtras = useMemo(() => menu.extras.filter((option) => !option.onlyWithIngredients || activeProduct?.hasIngredients), [activeProduct, menu.extras]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.product.price + item.extra.price, 0), [cart]);

  const openCustomizer = (product: Product, flavor = snackFlavors[0]) => {
    setActiveProduct(product);
    setMayo(true);
    setQueso(true);
    setExtra(menu.extras.find((option) => option.id === 'sin-extra') ?? menu.extras[0]);
    setSnackFlavor(flavor);
    setNote('');
    setModal('customize');
  };

  const navigatePanel = (index: number) => {
    const rail = panelRail.current;
    if (!rail) return;
    rail.scrollTo({ left: rail.clientWidth * index, behavior: 'smooth' });
    setActivePanel(index);
  };

  const trackActivePanel = () => {
    const rail = panelRail.current;
    if (!rail) return;
    setActivePanel(Math.max(0, Math.min(panelDetails.length - 1, Math.round(rail.scrollLeft / rail.clientWidth))));
  };

  const addToCart = () => {
    if (!activeProduct) return;
    setCart((items) => [...items, {
      id: `${activeProduct.id}-${Date.now()}`,
      product: activeProduct,
      mayo,
      queso,
      extra,
      note: note.trim(),
      snackFlavor: activeProduct.service === 'bag' ? snackFlavor : undefined,
    }]);
    setModal('cart');
  };

  const whatsappUrl = () => {
    const order = cart.map((item, index) => {
      const details = [
        item.snackFlavor ? `Botana: ${item.snackFlavor.name}` : '',
        `Mayonesa: ${item.mayo ? 'sí' : 'no'}`,
        `Queso: ${item.queso ? 'sí' : 'no'}`,
        `Extra: ${item.extra.name}`,
        item.note ? `Nota: ${item.note}` : '',
      ].filter(Boolean).join(' · ');
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

  const closeCartToMenu = () => {
    setModal('none');
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return <main className="menu-page">
    <header className="site-header menu-header">
      <a className="mini-logo" href="/" aria-label="Volver al inicio"><span>ESQUITES</span><strong>EL TRUCHITA</strong></a>
      <nav aria-label="Navegación principal"><a href="/">INICIO</a><a href="#menu">MENÚ</a><a href="#contacto">A DOMICILIO</a></nav>
      <button className="header-order" type="button" onClick={() => setModal('cart')}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button>
    </header>

    <section className="menu menu-only" id="menu" aria-labelledby="menu-title">
      <div className="menu-lead">
        <p className="section-kicker light">ARMA TU ANTOJO, A TU GUSTO</p>
        <h1 id="menu-title">EL MENÚ<br /><em>ESTÁ CALIENTE.</em></h1>
        <div className="menu-lead-side"><figure className="menu-photo"><img src="/esquite-callejero.png" alt="Vaso de esquites al carbón con chile, queso y limón" /><figcaption>HECHOS AL MOMENTO · SOLO A DOMICILIO</figcaption></figure><p>Elige una sección con los botones. Cada preparación se arma al momento y puedes dejar tu nota.</p></div>
      </div>

      <div className="menu-category-nav" aria-label="Secciones del menú">
        <div className="menu-tabs" role="tablist">{panelDetails.map((panel, index) => <button key={panel.key} className={activePanel === index ? 'active' : ''} type="button" onClick={() => navigatePanel(index)} role="tab" aria-selected={activePanel === index}>{panel.nav}</button>)}</div>
        <div className="menu-nav-arrows"><button type="button" aria-label="Sección anterior" onClick={() => navigatePanel((activePanel + panelDetails.length - 1) % panelDetails.length)}>←</button><span>{String(activePanel + 1).padStart(2, '0')} / {String(panelDetails.length).padStart(2, '0')}</span><button type="button" aria-label="Sección siguiente" onClick={() => navigatePanel((activePanel + 1) % panelDetails.length)}>→</button></div>
      </div>

      <div className="menu-panel-rail" ref={panelRail} onScroll={trackActivePanel}>
        {panelDetails.map((panel) => <section className="menu-panel" key={panel.key} aria-label={panel.title}>
          {panel.key === 'bolsa'
            ? <BagSection product={productsBySection.bolsa[0]} onChoose={openCustomizer} />
            : <MenuSection eyebrow={panel.eyebrow} title={panel.title} products={productsBySection[panel.key]} onChoose={openCustomizer} accent={panel.accent} />}
        </section>)}
      </div>

      <div className="menu-bottom-line"><span>¿YA SABES QUÉ SE TE ANTOJA?</span><button type="button" onClick={() => setModal('cart')}>VER MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></div>
    </section>

    <section className="contact" id="contacto"><div><p className="section-kicker">CUANDO EL ANTOJO PEGA</p><h2>SOLO A<br /><em>DOMICILIO.</em></h2></div><div className="contact-copy"><p>Entregamos en Zacapoaxtla, Puebla.</p><dl className="hours"><div><dt>DOMINGO A VIERNES</dt><dd>6:30 P. M. — 12:30 A. M.</dd></div><div><dt>SÁBADO</dt><dd>CERRADO</dd></div></dl><a href={`https://wa.me/${WHATSAPP_BUSINESS_NUMBER}`} target="_blank" rel="noreferrer">PEDIR POR WHATSAPP <span>↗</span></a></div></section>
    <footer><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><p>SOLO A DOMICILIO · DOM–VIE 6:30 P. M. — 12:30 A. M.</p><button type="button" onClick={() => setModal('cart')}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></footer>
    <button className="floating-order" type="button" onClick={() => setModal('cart')} aria-label="Abrir mi pedido"><span>MI PEDIDO</span><strong>{cart.length || '0'}</strong><i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button>

    {modal !== 'none' && <div className="modal-backdrop" onMouseDown={() => modal !== 'sending' && setModal('none')}><section className={`order-modal ${modal}`} role="dialog" aria-modal="true" aria-label="Mi pedido" onMouseDown={(event) => event.stopPropagation()}>
      {modal !== 'sending' && <button className="close-modal" type="button" onClick={() => setModal('none')} aria-label="Cerrar">×</button>}
      {modal === 'customize' && activeProduct && <><p className="modal-kicker">{serviceLabel(activeProduct)}</p><h2>{activeProduct.name}</h2><p className="modal-price">{money(activeProduct.price)} <small>base</small></p><div className="custom-options">
        {activeProduct.service === 'bag' && <fieldset className="bag-customizer"><legend>¿QUIERES CAMBIAR LA BOTANA?</legend><div className="bag-customizer-options">{snackFlavors.map((flavor) => <label className={snackFlavor.id === flavor.id ? 'selected' : ''} key={flavor.id}><input type="radio" name="snack" checked={snackFlavor.id === flavor.id} onChange={() => setSnackFlavor(flavor)} /><span className={`snack-swatch snack-${flavor.color}`} /><b>{flavor.name}</b></label>)}</div></fieldset>}
        <label className="switch-row switch-row-visual"><span className="switch-option-copy"><IngredientReference kind="mayo" /><span><b>MAYONESA</b><small>Como te gusta, o sin ella.</small></span></span><input type="checkbox" checked={mayo} onChange={(event) => setMayo(event.target.checked)} /><i /></label>
        <label className="switch-row switch-row-visual"><span className="switch-option-copy"><IngredientReference kind="queso" /><span><b>QUESO</b><small>Queso para cerrar bien la preparación.</small></span></span><input type="checkbox" checked={queso} onChange={(event) => setQueso(event.target.checked)} /><i /></label>
        <fieldset><legend>¿LE METEMOS UN EXTRA?</legend><div className="extra-grid">{availableExtras.map((option) => <label key={option.id} className={extra.id === option.id ? 'extra-option selected' : 'extra-option'}><input type="radio" name="extra" checked={extra.id === option.id} onChange={() => setExtra(option)} /><IngredientReference kind={option.imagePosition} /><span><b>{option.name}</b><small>{option.description}</small></span><strong>{option.price ? `+${money(option.price)}` : '—'}</strong></label>)}</div></fieldset>
        <label className="note-field"><span>NOTA PARA TU PEDIDO</span><textarea maxLength={180} placeholder="Ej. bien picoso, sin limón..." value={note} onChange={(event) => setNote(event.target.value)} /></label>
      </div><button className="wide-action" type="button" onClick={addToCart}>AGREGAR A MI PEDIDO <span>{money(activeProduct.price + extra.price)}</span></button></>}
      {modal === 'cart' && <><p className="modal-kicker">ESTO ES LO QUE SE VA A LA BRASA</p><h2>MI PEDIDO <span className="cart-count">{cart.length}</span></h2>{cart.length === 0 ? <div className="empty-cart"><span>◌</span><p>Aún no hay antojos aquí.</p><button type="button" onClick={closeCartToMenu}>VER EL MENÚ</button></div> : <><div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><div><h3>{item.product.name}</h3><p>{item.snackFlavor ? `${item.snackFlavor.name} · ` : ''}{item.mayo ? 'Con mayo' : 'Sin mayo'} · {item.queso ? 'Con queso' : 'Sin queso'} · {item.extra.name}{item.note ? ` · “${item.note}”` : ''}</p></div><b>{money(item.product.price + item.extra.price)}</b><button type="button" onClick={() => setCart((items) => items.filter((cartItem) => cartItem.id !== item.id))} aria-label={`Eliminar ${item.product.name}`}>×</button></article>)}</div><div className="cart-total"><span>TOTAL</span><strong>{money(total)}</strong></div><div className="cart-actions"><button type="button" className="secondary-action" onClick={closeCartToMenu}>SEGUIR ORDENANDO</button><button type="button" className="empty-button" onClick={() => setCart([])}>VACIAR SELECCIÓN</button></div><button className="wide-action" type="button" onClick={() => setModal('checkout')}>REALIZAR PEDIDO <span>→</span></button></>}</>}
      {modal === 'checkout' && <form onSubmit={handleCheckout}><p className="modal-kicker">SERVICIO ÚNICAMENTE A DOMICILIO</p><h2>¿A NOMBRE DE QUIÉN?</h2><p className="checkout-note">Estos datos van incluidos en tu mensaje de WhatsApp.</p><div className="customer-form"><label><span>NOMBRE</span><input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" /></label><label><span>TELÉFONO</span><input required type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Tu número" /></label><div className="delivery-only">ENTREGA A DOMICILIO</div><label><span>DIRECCIÓN</span><input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y colonia" /></label><label className="form-wide"><span>REFERENCIAS</span><textarea required value={customer.references} onChange={(event) => setCustomer({ ...customer, references: event.target.value })} placeholder="Color de portón, entre calles o cualquier referencia." /></label></div><button className="wide-action" type="submit">ENVIAR A WHATSAPP <span>↗</span></button><button className="back-button" type="button" onClick={() => setModal('cart')}>← VOLVER A MI PEDIDO</button></form>}
      {modal === 'sending' && <div className="sending-state"><div className="corn-flight" aria-hidden="true"><span>◐</span><i>✦</i><i>✦</i><i>✦</i></div><p className="modal-kicker">PREPARANDO TU MENSAJE</p><h2>¡VA VOLANDO<br />A WHATSAPP!</h2><p>Un momento, ya llevamos tu pedido.</p></div>}
    </section></div>}
  </main>;
}

function MenuSection({ eyebrow, title, products, onChoose, accent = false }: { eyebrow: string; title: string; products: Product[]; onChoose: (product: Product) => void; accent?: boolean }) {
  return <div className={accent ? 'menu-section menu-section-accent' : 'menu-section'}><header><p>{eyebrow}</p><h2>{title}</h2></header><div className="product-grid">{products.map((product, index) => <article className={product.id === 'truchita' ? 'product-card product-card-featured' : 'product-card'} key={product.id}><div className="product-number">{String(index + 1).padStart(2, '0')}</div><figure className="product-thumb"><img src={product.image || '/esquite-callejero.png'} alt="" /></figure><div className="product-copy">{product.tag && <span className="product-tag">{product.tag}</span>}<h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong><button type="button" onClick={() => onChoose(product)}>PERSONALIZAR <span>+</span></button></article>)}</div></div>;
}

function BagSection({ product, onChoose }: { product?: Product; onChoose: (product: Product, flavor: SnackFlavor) => void }) {
  if (!product) return <div className="bag-section-empty">Próximamente habrá una nueva bolsa para elegir.</div>;
  return <div className="bag-section"><div className="bag-section-copy"><p className="section-kicker light">ABRIMOS LA BOTANA. EL RESTO LO HACEMOS NOSOTROS.</p><span className="bag-price">{money(product.price)}</span><h2>ESQUITES<br /><em>EN BOLSA.</em></h2><p>La botana se abre, se llena de elote y se termina con lo que se te antoje. Elige una y arma tu preparación.</p></div><figure className="bag-main-photo"><img src="/botanas-en-bolsa.png" alt="Bolsas de botana de distintos sabores sobre una mesa con chiles y limón" /><figcaption>UNA BOLSA · UN ANTOJO COMPLETO</figcaption></figure><div className="bag-flavor-area"><p>¿QUÉ BOTANA SE TE ANTOJA?</p><div className="bag-flavor-stack">{snackFlavors.map((flavor, index) => <button type="button" className={`bag-flavor flavor-${flavor.color}`} style={{ '--flavor-index': index } as CSSProperties} key={flavor.id} onClick={() => onChoose(product, flavor)}><span>0{index + 1}</span><b>{flavor.name}</b><small>{flavor.note}</small><i>+</i></button>)}</div><small className="bag-hint">DESLIZA LAS BOTANAS O ELIGE LA QUE MÁS SE TE ANTOJE</small></div></div>;
}
