'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { defaultMenu, ExtraOption, isMenuData, MenuData, MenuSection as MenuSectionType, Product } from '@/lib/menu';

type SnackFlavor = { id: string; name: string; note: string; color: string; price: number };
type Preparation = 'standard' | 'muy-mexicano';
type CustomizeOptions = { snackFlavor?: SnackFlavor; bagFilling?: Product; preparation?: Preparation };
type CartItem = { id: string; product: Product; mayo: boolean; queso: boolean; extras: ExtraOption[]; note: string; snackFlavor?: SnackFlavor; bagFilling?: Product; preparation: Preparation };
type Modal = 'none' | 'customize' | 'cart' | 'checkout' | 'sending';
type CustomerDetails = { name: string; phone: string; address: string; references: string; exactLocation: string; payment: 'exact' | 'change'; changeFor: string };

const WHATSAPP_BUSINESS_NUMBER = '522204419169';
const money = (amount: number) => '$' + amount;
const snackFlavors: SnackFlavor[] = [
  { id: 'doritos-nacho', name: 'DORITOS NACHO', note: 'Crujiente y quesito.', color: 'maize', price: 30 },
  { id: 'doritos-fuego', name: 'DORITOS FUEGO', note: 'Con un toque más bravo.', color: 'ember', price: 30 },
  { id: 'cheetos-flamin', name: 'CHEETOS FLAMIN’ HOT', note: 'Para quien quiere picante.', color: 'flamin', price: 30 },
  { id: 'takis', name: 'TAKIS', note: 'Chile y limón al frente.', color: 'lime', price: 35 },
  { id: 'tostitos', name: 'TOSTITOS', note: 'El clásico para llenar bien.', color: 'toast', price: 35 },
];

const panelDetails: Array<{ key: MenuSectionType; nav: string; eyebrow: string; title: string; accent?: boolean }> = [
  { key: 'traditional', nav: 'TRADICIONALES', eyebrow: 'LOS DE SIEMPRE. PERO AQUÍ EMPIEZAN EN EL CARBÓN.', title: 'LOS TRADICIONALES' },
  { key: 'specialty', nav: 'ESPECIALES', eyebrow: 'SABORES DE MÉXICO LLEVADOS AL ESQUITE.', title: 'ESPECIALES DE LA CASA', accent: true },
  { key: 'elotes', nav: 'ELOTES', eyebrow: 'DEL ASADOR A TUS MANOS.', title: 'ELOTES AL CARBÓN' },
  { key: 'bolsa', nav: 'UN GUSTITO MÁS', eyebrow: 'ABRIMOS LA BOTANA. EL RESTO LO ARMAS A TU GUSTO.', title: 'UN GUSTITO MÁS', accent: true },
  { key: 'muy-mexicano', nav: 'MUY MEXICANO', eyebrow: 'MAÍZ, BRASA Y OFICIO. NADA MÁS.', title: 'MUY MEXICANO' },
];

function IngredientReference({ kind }: { kind: 'mayo' | 'queso' | 'elote' | 'ingredientes' }) {
  return <span className={'ingredient-reference ingredient-' + kind} aria-hidden="true" />;
}

function serviceLabel(product: Product) {
  if (product.service === 'bag') return 'PERSONALIZA TU GUSTITO';
  if (product.service === 'corn') return 'PERSONALIZA TU ELOTE';
  return 'PERSONALIZA TU VASO';
}

function selectionBasePrice(product: Product, snackFlavor?: SnackFlavor, bagFilling?: Product) {
  if (product.service === 'bag') return (snackFlavor?.price ?? 0) + (bagFilling?.price ?? 0);
  return product.price;
}

function cartItemTotal(item: CartItem) {
  return selectionBasePrice(item.product, item.snackFlavor, item.bagFilling) + item.extras.reduce((sum, extra) => sum + extra.price, 0);
}

export default function MenuExperience() {
  const [menu, setMenu] = useState<MenuData>(defaultMenu);
  const [modal, setModal] = useState<Modal>('none');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mayo, setMayo] = useState(true);
  const [queso, setQueso] = useState(true);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [snackFlavor, setSnackFlavor] = useState<SnackFlavor>(snackFlavors[0]);
  const [bagFilling, setBagFilling] = useState<Product | undefined>();
  const [preparation, setPreparation] = useState<Preparation>('standard');
  const [customer, setCustomer] = useState<CustomerDetails>({ name: '', phone: '', address: '', references: '', exactLocation: '', payment: 'exact', changeFor: '' });
  const panelRail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let live = true;
    fetch('/api/menu', { cache: 'no-store' }).then((response) => response.json()).then((data: unknown) => {
      if (live && isMenuData(data)) setMenu(data);
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);

  const productsBySection = useMemo(() => Object.fromEntries(panelDetails.map((panel) => [panel.key, menu.products.filter((product) => product.section === panel.key)])) as Record<MenuSectionType, Product[]>, [menu.products]);
  const bagFillings = useMemo(() => [...productsBySection.traditional, ...productsBySection.specialty], [productsBySection]);
  const availableExtras = useMemo(() => menu.extras.filter((option) => {
    if (option.onlyWithIngredients && !activeProduct?.hasIngredients) return false;
    if (option.onlyForServices && !option.onlyForServices.includes(activeProduct?.service ?? 'cup')) return false;
    return true;
  }), [activeProduct, menu.extras]);
  const selectedExtras = useMemo(() => availableExtras.filter((option) => selectedExtraIds.includes(option.id)), [availableExtras, selectedExtraIds]);
  const activeBasePrice = useMemo(() => activeProduct ? selectionBasePrice(activeProduct, snackFlavor, bagFilling) : 0, [activeProduct, bagFilling, snackFlavor]);
  const activePrice = useMemo(() => activeBasePrice + selectedExtras.reduce((sum, option) => sum + option.price, 0), [activeBasePrice, selectedExtras]);
  const total = useMemo(() => cart.reduce((sum, item) => sum + cartItemTotal(item), 0), [cart]);

  const openCustomizer = (product: Product, options: CustomizeOptions = {}) => {
    setActiveProduct(product);
    setMayo(true);
    setQueso(true);
    setSelectedExtraIds([]);
    setSnackFlavor(options.snackFlavor ?? snackFlavors[0]);
    setBagFilling(options.bagFilling ?? bagFillings[0]);
    setPreparation(options.preparation ?? 'standard');
    setNote('');
    setModal('customize');
  };

  const navigatePanel = (index: number) => {
    const rail = panelRail.current;
    if (!rail) return;
    rail.scrollTo({ left: rail.clientWidth * index, behavior: 'smooth' });
    setActivePanel(index);
  };

  const toggleExtra = (id: string) => setSelectedExtraIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const addToCart = () => {
    if (!activeProduct) return;
    setCart((items) => [...items, {
      id: activeProduct.id + '-' + Date.now(),
      product: activeProduct, mayo, queso, extras: selectedExtras, note: note.trim(),
      snackFlavor: activeProduct.service === 'bag' ? snackFlavor : undefined,
      bagFilling: activeProduct.service === 'bag' ? bagFilling : undefined,
      preparation,
    }]);
    setModal('cart');
  };

  const whatsappUrl = () => {
    const order = cart.map((item, index) => {
      const details = [
        item.preparation === 'muy-mexicano' ? 'Estilo Muy Mexicano: 100% al carbón, sin mantequilla ni especias' : '',
        item.snackFlavor ? 'Botana: ' + item.snackFlavor.name : '',
        item.bagFilling ? 'Esquite dentro: ' + item.bagFilling.name : '',
        'Mayonesa: ' + (item.mayo ? 'sí' : 'no'),
        'Queso: ' + (item.queso ? 'sí' : 'no'),
        item.extras.length ? 'Extras: ' + item.extras.map((extra) => extra.name).join(', ') : 'Sin extras',
        item.note ? 'Nota: ' + item.note : '',
      ].filter(Boolean).join(' · ');
      return String(index + 1) + '. *' + item.product.name + '* — ' + money(cartItemTotal(item)) + '\n   ' + details;
    }).join('\n\n');
    const payment = customer.payment === 'change' ? 'Sí, llevar cambio para ' + money(Number(customer.changeFor)) : 'No, pago exacto';
    const message = '*PEDIDO NUEVO — EL TRUCHITA* 🔥\n\n' + order + '\n\n*TOTAL: ' + money(total) + '*\n\n*Datos de entrega*\nNombre: ' + customer.name + '\nTeléfono: ' + customer.phone + '\nModalidad: Servicio a domicilio\nDirección: ' + customer.address + '\nReferencias: ' + customer.references + '\nUbicación exacta: ' + (customer.exactLocation || 'No compartida') + '\nCambio: ' + payment + '\n\n*Importante:* El pedido se trabajará hasta ser confirmado por El Truchita. Gracias por tu preferencia.';
    return 'https://wa.me/' + WHATSAPP_BUSINESS_NUMBER + '?text=' + encodeURIComponent(message);
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

  const currentIndex = String(activePanel + 1).padStart(2, '0') + ' / ' + String(panelDetails.length).padStart(2, '0');

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
        <div className="menu-nav-arrows"><button type="button" aria-label="Sección anterior" onClick={() => navigatePanel((activePanel + panelDetails.length - 1) % panelDetails.length)}>←</button><span>{currentIndex}</span><button type="button" aria-label="Sección siguiente" onClick={() => navigatePanel((activePanel + 1) % panelDetails.length)}>→</button></div>
      </div>

      <div className="menu-panel-rail" ref={panelRail} onScroll={() => {
        const rail = panelRail.current;
        if (rail) setActivePanel(Math.max(0, Math.min(panelDetails.length - 1, Math.round(rail.scrollLeft / rail.clientWidth))));
      }}>
        {panelDetails.map((panel) => <section className="menu-panel" key={panel.key} aria-label={panel.title}>
          {panel.key === 'bolsa'
            ? <BagSection product={productsBySection.bolsa[0]} fillings={bagFillings} onChoose={openCustomizer} />
            : panel.key === 'muy-mexicano'
              ? <MuyMexicanoSection productsBySection={productsBySection} bagFillings={bagFillings} onChoose={openCustomizer} />
              : <MenuSection eyebrow={panel.eyebrow} title={panel.title} products={productsBySection[panel.key]} onChoose={openCustomizer} accent={panel.accent} />}
        </section>)}
      </div>

      <div className="menu-bottom-line"><span>¿YA SABES QUÉ SE TE ANTOJA?</span><button type="button" onClick={() => setModal('cart')}>VER MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></div>
    </section>

    <section className="contact" id="contacto"><div><p className="section-kicker">CUANDO EL ANTOJO PEGA</p><h2>SOLO A<br /><em>DOMICILIO.</em></h2></div><div className="contact-copy"><p>Entregamos en Zacapoaxtla, Puebla.</p><dl className="hours"><div><dt>DOMINGO A VIERNES</dt><dd>6:30 P. M. — 12:30 A. M.</dd></div><div><dt>SÁBADO</dt><dd>CERRADO</dd></div></dl><a href={'https://wa.me/' + WHATSAPP_BUSINESS_NUMBER} target="_blank" rel="noreferrer">PEDIR POR WHATSAPP <span>↗</span></a></div></section>
    <footer><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><p>SOLO A DOMICILIO · DOM–VIE 6:30 P. M. — 12:30 A. M.</p><button type="button" onClick={() => setModal('cart')}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></footer>
    <button className="floating-order" type="button" onClick={() => setModal('cart')} aria-label="Abrir mi pedido"><span>MI PEDIDO</span><strong>{cart.length || '0'}</strong><i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button>

    {modal !== 'none' && <div className="modal-backdrop" onMouseDown={() => modal !== 'sending' && setModal('none')}><section className={'order-modal ' + modal} role="dialog" aria-modal="true" aria-label="Mi pedido" onMouseDown={(event) => event.stopPropagation()}>
      {modal !== 'sending' && <button className="close-modal" type="button" onClick={() => setModal('none')} aria-label="Cerrar">×</button>}
      {modal === 'customize' && activeProduct && <Customizer activeProduct={activeProduct} activeBasePrice={activeBasePrice} activePrice={activePrice} preparation={preparation} mayo={mayo} queso={queso} setMayo={setMayo} setQueso={setQueso} snackFlavor={snackFlavor} setSnackFlavor={setSnackFlavor} bagFilling={bagFilling} setBagFilling={setBagFilling} bagFillings={bagFillings} availableExtras={availableExtras} selectedExtraIds={selectedExtraIds} toggleExtra={toggleExtra} note={note} setNote={setNote} onAdd={addToCart} />}
      {modal === 'cart' && <CartView cart={cart} total={total} onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))} onEmpty={() => setCart([])} onContinue={closeCartToMenu} onCheckout={() => setModal('checkout')} />}
      {modal === 'checkout' && <CheckoutForm customer={customer} setCustomer={setCustomer} onSubmit={handleCheckout} onBack={() => setModal('cart')} />}
      {modal === 'sending' && <div className="sending-state"><div className="corn-flight" aria-hidden="true"><span>◐</span><i>✦</i><i>✦</i><i>✦</i></div><p className="modal-kicker">PREPARANDO TU MENSAJE</p><h2>¡VA VOLANDO<br />A WHATSAPP!</h2><p>Un momento, ya llevamos tu pedido.</p></div>}
    </section></div>}
  </main>;
}

function Customizer({ activeProduct, activeBasePrice, activePrice, preparation, mayo, queso, setMayo, setQueso, snackFlavor, setSnackFlavor, bagFilling, setBagFilling, bagFillings, availableExtras, selectedExtraIds, toggleExtra, note, setNote, onAdd }: { activeProduct: Product; activeBasePrice: number; activePrice: number; preparation: Preparation; mayo: boolean; queso: boolean; setMayo: (value: boolean) => void; setQueso: (value: boolean) => void; snackFlavor: SnackFlavor; setSnackFlavor: (value: SnackFlavor) => void; bagFilling?: Product; setBagFilling: (value: Product) => void; bagFillings: Product[]; availableExtras: ExtraOption[]; selectedExtraIds: string[]; toggleExtra: (id: string) => void; note: string; setNote: (value: string) => void; onAdd: () => void }) {
  const carbonOnly = preparation === 'muy-mexicano';
  return <><p className="modal-kicker">{carbonOnly ? '100% AL CARBÓN · MUY MEXICANO' : serviceLabel(activeProduct)}</p><h2>{activeProduct.name}</h2><p className="modal-price">{money(activeBasePrice)} <small>{activeProduct.service === 'bag' ? 'tu selección' : 'base'}</small></p>{activeProduct.service === 'bag' && <p className="bag-total-note">Incluye la botana elegida; sus precios no se muestran por separado.</p>}{carbonOnly && <p className="carbon-only-note">Esta versión sale de las brasas sin mantequilla, epazote ni especias añadidas.</p>}<div className="custom-options">
    {activeProduct.service === 'bag' && <><fieldset className="bag-customizer"><legend>¿QUIERES CAMBIAR LA BOTANA?</legend><div className="bag-customizer-options">{snackFlavors.map((flavor) => <label className={snackFlavor.id === flavor.id ? 'selected' : ''} key={flavor.id}><input type="radio" name="snack" checked={snackFlavor.id === flavor.id} onChange={() => setSnackFlavor(flavor)} /><span className={'snack-swatch snack-' + flavor.color} /><b>{flavor.name}</b></label>)}</div></fieldset><fieldset className="bag-filling-customizer"><legend>¿QUÉ ESQUITE QUIERES DENTRO?</legend><div>{bagFillings.map((filling) => <label className={bagFilling?.id === filling.id ? 'selected' : ''} key={filling.id}><input type="radio" name="bag-filling" checked={bagFilling?.id === filling.id} onChange={() => setBagFilling(filling)} /><span>{filling.section === 'traditional' ? 'CLÁSICO' : 'ESPECIAL'}</span><b>{filling.name}</b><em>{money(filling.price)}</em></label>)}</div></fieldset></>}
    <ToggleRow kind="mayo" title="MAYONESA" description={carbonOnly ? 'Opcional: se agrega aparte si la quieres.' : 'Como te gusta, o sin ella.'} checked={mayo} disabled={false} onChange={setMayo} />
    <ToggleRow kind="queso" title="QUESO" description={carbonOnly ? 'Opcional: se agrega aparte si lo quieres.' : 'Queso para cerrar bien la preparación.'} checked={queso} disabled={false} onChange={setQueso} />
    <fieldset><legend>{activeProduct.service === 'corn' ? 'SI EL ELOTE NO TE BASTA, AGRÉGALE…' : 'ELIGE TODOS LOS EXTRAS QUE SE TE ANTOJEN'}</legend>{activeProduct.service === 'corn' && <p className="extra-help">Tocino, salchicha, quesos fundidos o una porción de maíz asado — $25 c/u.</p>}<div className="extra-grid">{availableExtras.map((option) => <label key={option.id} className={selectedExtraIds.includes(option.id) ? 'extra-option selected' : 'extra-option'}><input type="checkbox" checked={selectedExtraIds.includes(option.id)} onChange={() => toggleExtra(option.id)} /><IngredientReference kind={option.imagePosition} /><span><b>{option.name}</b><small>{option.description}</small></span><strong>+{money(option.price)}</strong></label>)}</div></fieldset>
    <label className="note-field"><span>NOTA PARA TU PEDIDO</span><textarea maxLength={180} placeholder="Ej. bien picoso, sin limón..." value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </div><button className="wide-action" type="button" onClick={onAdd}>AGREGAR A MI PEDIDO <span>{money(activePrice)}</span></button></>;
}

function ToggleRow({ kind, title, description, checked, disabled, onChange }: { kind: 'mayo' | 'queso'; title: string; description: string; checked: boolean; disabled: boolean; onChange: (value: boolean) => void }) {
  return <label className={disabled ? 'switch-row switch-row-visual disabled' : 'switch-row switch-row-visual'}><span className="switch-option-copy"><IngredientReference kind={kind} /><span><b>{title}</b><small>{description}</small></span></span><input disabled={disabled} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i /></label>;
}

function CartView({ cart, total, onRemove, onEmpty, onContinue, onCheckout }: { cart: CartItem[]; total: number; onRemove: (id: string) => void; onEmpty: () => void; onContinue: () => void; onCheckout: () => void }) {
  return <><p className="modal-kicker">ESTO ES LO QUE SE VA A LA BRASA</p><h2>MI PEDIDO <span className="cart-count">{cart.length}</span></h2>{cart.length === 0 ? <div className="empty-cart"><span>◌</span><p>Aún no hay antojos aquí.</p><button type="button" onClick={onContinue}>VER EL MENÚ</button></div> : <><div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><div><h3>{item.product.name}</h3><p>{item.preparation === 'muy-mexicano' ? '100% al carbón · ' : ''}{item.snackFlavor ? item.snackFlavor.name + ' · ' : ''}{item.bagFilling ? 'Con ' + item.bagFilling.name + ' · ' : ''}{item.mayo ? 'Con mayo' : 'Sin mayo'} · {item.queso ? 'Con queso' : 'Sin queso'} · {item.extras.length ? item.extras.map((extra) => extra.name).join(', ') : 'Sin extras'}{item.note ? ' · “' + item.note + '”' : ''}</p></div><b>{money(cartItemTotal(item))}</b><button type="button" onClick={() => onRemove(item.id)} aria-label={'Eliminar ' + item.product.name}>×</button></article>)}</div><div className="cart-total"><span>TOTAL</span><strong>{money(total)}</strong></div><div className="cart-actions"><button type="button" className="secondary-action" onClick={onContinue}>SEGUIR ORDENANDO</button><button type="button" className="empty-button" onClick={onEmpty}>VACIAR SELECCIÓN</button></div><button className="wide-action" type="button" onClick={onCheckout}>REALIZAR PEDIDO <span>→</span></button></>}</>;
}

function CheckoutForm({ customer, setCustomer, onSubmit, onBack }: { customer: CustomerDetails; setCustomer: (value: CustomerDetails) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onBack: () => void }) {
  const [locationStatus, setLocationStatus] = useState('');

  const shareExactLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Tu navegador no permite compartir ubicación. Puedes pegar un enlace de Google Maps.');
      return;
    }
    setLocationStatus('Buscando tu ubicación…');
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const location = 'https://www.google.com/maps/search/?api=1&query=' + coords.latitude.toFixed(6) + ',' + coords.longitude.toFixed(6);
      setCustomer({ ...customer, exactLocation: location });
      setLocationStatus('Ubicación agregada a tu pedido.');
    }, () => setLocationStatus('No pudimos obtenerla. Revisa el permiso o pega un enlace de Google Maps.'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };

  return <form onSubmit={onSubmit}><p className="modal-kicker">SERVICIO ÚNICAMENTE A DOMICILIO</p><h2>¿A NOMBRE DE QUIÉN?</h2><p className="checkout-note">Estos datos van incluidos en tu mensaje de WhatsApp.</p><div className="customer-form"><label><span>NOMBRE</span><input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" /></label><label><span>TELÉFONO</span><input required type="tel" inputMode="tel" autoComplete="tel" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Tu número" /></label><div className="delivery-only">ENTREGA A DOMICILIO</div><label><span>DIRECCIÓN</span><input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y colonia" /></label><label className="form-wide"><span>REFERENCIAS</span><textarea required value={customer.references} onChange={(event) => setCustomer({ ...customer, references: event.target.value })} placeholder="Color de portón, entre calles o cualquier referencia." /></label><div className="form-wide location-field"><span>UBICACIÓN EXACTA <small>OPCIONAL, MUY ÚTIL PARA EL REPARTIDOR</small></span><div><input value={customer.exactLocation} onChange={(event) => setCustomer({ ...customer, exactLocation: event.target.value })} placeholder="Pega un enlace de Google Maps" /><button type="button" onClick={shareExactLocation}>USAR MI UBICACIÓN ACTUAL <b>⌖</b></button></div>{locationStatus && <p role="status">{locationStatus}</p>}</div><fieldset className="form-wide payment-choice"><legend>¿PAGARÁS CON CAMBIO?</legend><div><label className={customer.payment === 'exact' ? 'selected' : ''}><input type="radio" name="payment" checked={customer.payment === 'exact'} onChange={() => setCustomer({ ...customer, payment: 'exact', changeFor: '' })} /><span><b>NO, LLEVO PAGO EXACTO</b><small>Así la entrega es más ágil.</small></span></label><label className={customer.payment === 'change' ? 'selected' : ''}><input type="radio" name="payment" checked={customer.payment === 'change'} onChange={() => setCustomer({ ...customer, payment: 'change' })} /><span><b>SÍ, NECESITO CAMBIO</b><small>Indícanos con cuánto pagarás.</small></span></label></div>{customer.payment === 'change' && <label className="change-field"><span>NECESITO CAMBIO PARA</span><input required type="number" min="1" inputMode="numeric" value={customer.changeFor} onChange={(event) => setCustomer({ ...customer, changeFor: event.target.value })} placeholder="Ej. 200" /><b>MXN</b></label>}</fieldset></div><aside className="delivery-notice"><p>AVISO DE ENVÍO</p><strong>EL COSTO DEPENDE DE LA DISTANCIA.</strong><span>En pedidos de <b>$400 o más</b>, el envío es gratis. Entre <b>$250 y $300</b>, nosotros cubrimos la mitad; por debajo de $250, corre por cuenta del cliente.</span><small>El tiempo de preparación y entrega puede variar según tu pedido, la disponibilidad del repartidor y cualquier contratiempo en el camino.</small></aside><aside className="order-confirmation"><p>IMPORTANTE</p><strong>TU ORDEN SE TRABAJARÁ HASTA QUE SEA CONFIRMADA POR EL NEGOCIO.</strong><span>Gracias por tu preferencia. En breve te responderemos por WhatsApp.</span></aside><button className="wide-action" type="submit">ENVIAR A WHATSAPP <span>↗</span></button><button className="back-button" type="button" onClick={onBack}>← VOLVER A MI PEDIDO</button></form>;
}

function MenuSection({ eyebrow, title, products, onChoose, accent = false }: { eyebrow: string; title: string; products: Product[]; onChoose: (product: Product, options?: CustomizeOptions) => void; accent?: boolean }) {
  const isCorn = products.some((product) => product.service === 'corn');
  return <div className={accent ? 'menu-section menu-section-accent' : 'menu-section'}><header><p>{eyebrow}</p><h2>{title}</h2>{isCorn && <p className="elote-extra-note">Si el elote no es suficiente, agrega tocino, salchicha, quesos fundidos o una porción de maíz asado por <b>$25 c/u.</b></p>}</header><div className="product-grid">{products.map((product, index) => <article className={product.id === 'truchita' ? 'product-card product-card-featured' : 'product-card'} key={product.id}><div className="product-number">{String(index + 1).padStart(2, '0')}</div><figure className="product-thumb"><img src={product.image || '/esquite-callejero.png'} alt={'Referencia de ' + product.name} /></figure><div className="product-copy">{product.tag && <span className="product-tag">{product.tag}</span>}<h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong><button type="button" onClick={() => onChoose(product)}>PERSONALIZAR <span>+</span></button></article>)}</div></div>;
}

function BagSection({ product, fillings, onChoose }: { product?: Product; fillings: Product[]; onChoose: (product: Product, options?: CustomizeOptions) => void }) {
  if (!product) return <div className="bag-section-empty">Próximamente habrá una nueva bolsa para elegir.</div>;
  return <div className="bag-section"><div className="bag-section-copy"><p className="section-kicker light">ABRIMOS LA BOTANA. EL RESTO LO ARMAS A TU GUSTO.</p><span className="bag-price">BOTANA + ESQUITE A TU ELECCIÓN</span><h2>UN GUSTITO<br /><em>MÁS.</em></h2><p>Elige la botana y el esquite clásico o especial que quieres dentro. Verás el total de tu combinación antes de agregar extras.</p></div><figure className="bag-main-photo"><img src="/botanas-en-bolsa.png" alt="Bolsas de botana de distintos sabores sobre una mesa con chiles y limón" /><figcaption>UNA BOLSA · EL ESQUITE QUE TÚ ELIJAS</figcaption></figure><div className="bag-flavor-area"><p>¿QUÉ BOTANA SE TE ANTOJA?</p><div className="bag-flavor-stack">{snackFlavors.map((flavor, index) => <button type="button" className={'bag-flavor flavor-' + flavor.color} style={{ '--flavor-index': index } as CSSProperties} key={flavor.id} onClick={() => onChoose(product, { snackFlavor: flavor, bagFilling: fillings[0] })}><span>0{index + 1}</span><b>{flavor.name}</b><small>{flavor.note}</small><i>+</i></button>)}</div><small className="bag-hint">ELIGE TU BOTANA Y DESPUÉS DECIDE QUÉ ESQUITE VA DENTRO</small></div></div>;
}

function MuyMexicanoSection({ productsBySection, bagFillings, onChoose }: { productsBySection: Record<MenuSectionType, Product[]>; bagFillings: Product[]; onChoose: (product: Product, options?: CustomizeOptions) => void }) {
  const groups = [
    { name: 'CLÁSICOS', detail: 'La base de siempre, directo del carbón.', products: productsBySection.traditional },
    { name: 'ESPECIALES', detail: 'Sabores de la casa con el fuego al frente.', products: productsBySection.specialty },
    { name: 'ELOTES', detail: 'Enteros, asados y sin rodeos.', products: productsBySection.elotes },
    { name: 'UN GUSTITO MÁS', detail: 'Tu botana y tu esquite preferido, a las brasas.', products: productsBySection.bolsa },
  ];
  return <div className="mexican-section"><header><p>MAÍZ, FUEGO Y TRADICIÓN, COMO DEBE SER.</p><h2>MUY MEXICANO</h2></header><div className="mexican-intro"><div><p>100% AL CARBÓN</p><strong>EL SABOR DEL MAÍZ CUANDO LO DEJAS HABLAR.</strong><span>Estas preparaciones salen del asador sin mantequilla, epazote ni especias añadidas. Mayonesa y queso son opcionales y se sirven aparte.</span></div><div className="mexican-reference-images"><img src="/elote-brasa-real.jpeg" alt="Elote asado a las brasas" /><img src="/fogon-carbon-real.jpeg" alt="Preparación sobre brasas" /></div></div><div className="mexican-family-grid">{groups.map((group) => <article key={group.name}><p>{group.name}</p><span>{group.detail}</span><div>{group.products.map((product) => <button key={product.id} type="button" onClick={() => onChoose(product, { preparation: 'muy-mexicano', snackFlavor: snackFlavors[0], bagFilling: bagFillings[0] })}><b>{product.name}</b><small>{product.service === 'bag' ? 'A TU ELECCIÓN' : money(product.price)}</small><i>↗</i></button>)}</div></article>)}</div></div>;
}
