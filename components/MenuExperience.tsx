'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { defaultMenu, ExtraOption, isMenuData, MenuData, MenuSection as MenuSectionType, Product } from '@/lib/menu';

type SnackFlavor = { id: string; name: string; note: string; color: string; price: number };
type Preparation = 'standard' | 'muy-mexicano';
type CustomizeOptions = { snackFlavor?: SnackFlavor; bagFilling?: Product; preparation?: Preparation };
type CartItem = { id: string; product: Product; mayo: boolean; queso: boolean; extras: ExtraOption[]; note: string; snackFlavor?: SnackFlavor; bagFilling?: Product; preparation: Preparation };
type Modal = 'none' | 'customize' | 'cart' | 'checkout' | 'sending';
type MaicitoAction = 'idle' | 'guide' | 'celebrate';
type CustomerDetails = { name: string; phone: string; address: string; references: string; exactLocation: string; payment: 'exact' | 'change'; changeFor: string };
type BusinessStatus = { open: boolean; label: string; isSaturday: boolean };
type DeliveryPolicy = { title: string; detail: string; whatsapp: string };

const WHATSAPP_BUSINESS_NUMBER = '522204419169';
const CART_STORAGE_KEY = 'el-truchita-cart-v1';
const money = (amount: number) => '$' + amount;
const snackFlavors: SnackFlavor[] = [
  { id: 'doritos-nacho', name: 'DORITOS NACHO', note: 'Crujiente y quesito.', color: 'maize', price: 30 },
  { id: 'doritos-fuego', name: 'DORITOS FUEGO', note: 'Con un toque más bravo.', color: 'ember', price: 30 },
  { id: 'cheetos-flamin', name: 'CHEETOS FLAMIN’ HOT', note: 'Para quien quiere picante.', color: 'flamin', price: 30 },
  { id: 'takis', name: 'TAKIS', note: 'Chile y limón al frente.', color: 'lime', price: 35 },
  { id: 'tostitos', name: 'TOSTITOS', note: 'El clásico para llenar bien.', color: 'toast', price: 35 },
];

const emptyCartMessages = [
  'Tu carrito está más vacío que tus ganas de cocinar.',
  'No te vayas así… el carbón ya se ilusionó.',
  'Mirar el menú no llena el alma. Bueno, tampoco el estómago.',
  'Hay un espacio vacío aquí. Igual que en tu corazón después de oler elote.',
  'No dejes a Maicito hablando solo; el carbón no da terapia.',
  'Tu antojo está en visto. Y el carrito también.',
  'Puedes seguir fingiendo que no tienes hambre; el carrito no te cree.',
  'Cero antojos, cero problemas… mentira, el hambre vuelve.',
];
const addedCartMessages = [
  'Excelente. Una decisión menos cuestionable que muchas otras.',
  'Tu antojo ya tiene futuro. A diferencia de algunos planes.',
  'El carbón aprueba esta compra impulsiva.',
  'Una compra impulsiva, pero con mejor destino que tus últimos mensajes.',
  'Bien: ya hiciste algo útil con el día.',
  'Tu pedido crece; tus pendientes pueden esperar cinco minutos.',
  'Esto no arregla todo, pero sí arregla la cena.',
  'Elote añadido. Crisis existencial pospuesta.',
];
const sendingMessages = [
  'Maicito va en camino, porque tú ya hiciste suficiente por hoy.',
  'Tu pedido salió disparado; nuestras responsabilidades no tanto.',
  'Más rápido que el arrepentimiento después del primer bocado.',
  'Va directo a WhatsApp, donde empieza la verdadera novela.',
  'Cruza el internet con más ganas que tú cruzando por el elote.',
  'Mensaje enviado: ahora solo falta que el universo no se meta.',
  'Rápido, caliente y sin preguntar por tus decisiones.',
  'Hacia WhatsApp, antes de que cambies de opinión.',
];

const panelDetails: Array<{ key: MenuSectionType; nav: string; eyebrow: string; title: string; level: string; icon: string; clue: string; accent?: boolean }> = [
  { key: 'traditional', nav: 'TRADICIONALES', eyebrow: 'LOS DE SIEMPRE. PERO AQUÍ EMPIEZAN EN EL CARBÓN.', title: 'LOS TRADICIONALES', level: 'NIVEL 01', icon: '◈', clue: 'Lo clásico, pero con brasas.' },
  { key: 'specialty', nav: 'ESPECIALES', eyebrow: 'SABORES DE MÉXICO LLEVADOS AL ESQUITE.', title: 'ESPECIALES DE LA CASA', level: 'NIVEL 02', icon: '✹', clue: 'Para entrarle con hambre.', accent: true },
  { key: 'elotes', nav: 'ELOTES', eyebrow: 'DEL ASADOR A TUS MANOS.', title: 'ELOTES AL CARBÓN', level: 'NIVEL 03', icon: '♨', clue: 'Enteros, tostados y sin rodeos.' },
  { key: 'bolsa', nav: 'UN GUSTITO MÁS', eyebrow: 'ABRIMOS LA BOTANA. EL RESTO LO ARMAS A TU GUSTO.', title: 'UN GUSTITO MÁS', level: 'NIVEL 04', icon: '▰', clue: 'Botana abierta, carbón adentro.', accent: true },
  { key: 'muy-mexicano', nav: 'MUY MEXICANO', eyebrow: 'MAÍZ, BRASA Y OFICIO. NADA MÁS.', title: 'MUY MEXICANO', level: 'NIVEL 05', icon: '✦', clue: 'Maíz, fuego y oficio.' },
];

function IngredientReference({ kind }: { kind: 'mayo' | 'queso' | 'elote' | 'ingredientes' }) {
  return <span className={'ingredient-reference ingredient-' + kind} aria-hidden="true" />;
}

function serviceLabel(product: Product) {
  if (product.service === 'bag') return 'PERSONALIZA TU GUSTITO';
  if (product.service === 'corn') return 'PERSONALIZA TU ELOTE';
  return 'ARMA TU CHAROLA';
}

function productImageForDisplay(product: Product) {
  if (product.service === 'cup' && (/esquite-callejero|tradicional-/.test(product.image) || !product.image)) return '/esquites-charola-carbon.png';
  return product.image || '/esquites-charola-carbon.png';
}

function selectionBasePrice(product: Product, snackFlavor?: SnackFlavor, bagFilling?: Product) {
  if (product.service === 'bag') return (snackFlavor?.price ?? 0) + (bagFilling?.price ?? 0);
  return product.price;
}

function cartItemTotal(item: CartItem) {
  return selectionBasePrice(item.product, item.snackFlavor, item.bagFilling) + item.extras.reduce((sum, extra) => sum + extra.price, 0);
}

function businessStatus(now = new Date()): BusinessStatus {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const value = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const day = parts.find((part) => part.type === 'weekday')?.value;
  const minutes = value('hour') * 60 + value('minute');
  const afterEveningOpen = minutes >= 18 * 60 + 30 && day !== 'Sat';
  const afterMidnightOpen = minutes <= 30 && day !== 'Sun';
  const open = afterEveningOpen || afterMidnightOpen;
  return { open, isSaturday: day === 'Sat', label: open ? 'ABIERTO AHORA · TOMAMOS PEDIDOS' : 'CERRADO AHORA · DOM–VIE 6:30 P. M. — 12:30 A. M.' };
}

function deliveryPolicy(total: number): DeliveryPolicy {
  if (total >= 400) return { title: 'ENVÍO GRATIS', detail: 'Tu pedido alcanza el envío gratis. Solo confirmaremos que la dirección esté dentro de nuestra zona de reparto.', whatsapp: 'Envío gratis por subtotal de ' + money(total) + '. Zona de entrega por confirmar.' };
  if (total >= 250 && total <= 300) return { title: 'CUBRIMOS LA MITAD DEL ENVÍO', detail: 'Nosotros cubrimos la mitad. El monto final depende de la distancia de entrega.', whatsapp: 'El negocio cubre la mitad del envío. Monto final según distancia.' };
  if (total < 250) return { title: 'ENVÍO POR CUENTA DEL CLIENTE', detail: 'El costo se confirma según la distancia de entrega.', whatsapp: 'Costo de envío por cuenta del cliente; monto por confirmar según distancia.' };
  return { title: 'ENVÍO POR CONFIRMAR', detail: 'En pedidos de $301 a $399 confirmamos el costo según la distancia antes de preparar.', whatsapp: 'Costo de envío por confirmar según distancia antes de preparar.' };
}

function orderReference() {
  return 'TRU-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
}

function nextMaicitoMessage(key: string, messages: string[]) {
  const last = window.sessionStorage.getItem(key);
  const options = messages.filter((message) => message !== last);
  const message = options[Math.floor(Math.random() * options.length)] ?? messages[0];
  window.sessionStorage.setItem(key, message);
  return message;
}

export default function MenuExperience() {
  const [menu, setMenu] = useState<MenuData>(defaultMenu);
  const [modal, setModal] = useState<Modal>('none');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [activePanel, setActivePanel] = useState(0);
  const [visitedPanels, setVisitedPanels] = useState<number[]>([0]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [mayo, setMayo] = useState(true);
  const [queso, setQueso] = useState(true);
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [snackFlavor, setSnackFlavor] = useState<SnackFlavor>(snackFlavors[0]);
  const [bagFilling, setBagFilling] = useState<Product | undefined>();
  const [preparation, setPreparation] = useState<Preparation>('standard');
  const [customer, setCustomer] = useState<CustomerDetails>({ name: '', phone: '', address: '', references: '', exactLocation: '', payment: 'exact', changeFor: '' });
  const [status, setStatus] = useState<BusinessStatus | null>(null);
  const [reference, setReference] = useState('');
  const [emptyCartMessage, setEmptyCartMessage] = useState(emptyCartMessages[0]);
  const [addedCartMessage, setAddedCartMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(sendingMessages[0]);
  const [maicitoAction, setMaicitoAction] = useState<MaicitoAction>('idle');
  const panelRail = useRef<HTMLDivElement>(null);
  const maicitoTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    let live = true;
    fetch('/api/menu', { cache: 'no-store' }).then((response) => response.json()).then((data: unknown) => {
      if (live && isMenuData(data)) setMenu(data);
    }).catch(() => undefined);
    return () => { live = false; };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? '[]');
      if (Array.isArray(saved)) setCart(saved as CartItem[]);
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!cartLoaded) return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, cartLoaded]);

  useEffect(() => {
    const updateStatus = () => setStatus(businessStatus());
    updateStatus();
    const timer = window.setInterval(updateStatus, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setEmptyCartMessage(nextMaicitoMessage('truchita-empty-cart-phrase', emptyCartMessages));
  }, []);

  useEffect(() => () => window.clearTimeout(maicitoTimer.current), []);

  const availableProducts = useMemo(() => menu.products.filter((product) => product.available !== false), [menu.products]);
  const productsBySection = useMemo(() => Object.fromEntries(panelDetails.map((panel) => [panel.key, availableProducts.filter((product) => product.section === panel.key)])) as Record<MenuSectionType, Product[]>, [availableProducts]);
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
  const isOpen = status?.open !== false;

  const triggerMaicito = (action: Exclude<MaicitoAction, 'idle'>) => {
    window.clearTimeout(maicitoTimer.current);
    setMaicitoAction(action);
    maicitoTimer.current = window.setTimeout(() => setMaicitoAction('idle'), action === 'celebrate' ? 2100 : 1600);
  };

  useEffect(() => {
    setCart((items) => items.filter((item) => {
      const currentProduct = menu.products.find((product) => product.id === item.product.id);
      const currentFilling = item.bagFilling ? menu.products.find((product) => product.id === item.bagFilling?.id) : undefined;
      return currentProduct?.available !== false && currentProduct !== undefined && (!item.bagFilling || (currentFilling !== undefined && currentFilling.available !== false));
    }));
  }, [menu.products]);

  const openCustomizer = (product: Product, options: CustomizeOptions = {}) => {
    triggerMaicito('guide');
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
    triggerMaicito('guide');
    rail.scrollTo({ left: rail.clientWidth * index, behavior: 'smooth' });
    setActivePanel(index);
    setVisitedPanels((current) => current.includes(index) ? current : [...current, index]);
  };

  const syncActivePanel = () => {
    const rail = panelRail.current;
    if (!rail) return;
    const index = Math.max(0, Math.min(panelDetails.length - 1, Math.round(rail.scrollLeft / rail.clientWidth)));
    setActivePanel(index);
    setVisitedPanels((current) => current.includes(index) ? current : [...current, index]);
  };

  const toggleExtra = (id: string) => setSelectedExtraIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const charcoalBet = () => {
    const candidates = availableExtras.filter((extra) => !extra.onlyWithIngredients || activeProduct?.hasIngredients);
    const extra = candidates[Math.floor(Math.random() * candidates.length)];
    triggerMaicito('celebrate');
    setMayo(true);
    setQueso(true);
    setSelectedExtraIds(extra ? [extra.id] : []);
    setNote('');
  };

  const addToCart = () => {
    if (!activeProduct) return;
    triggerMaicito('celebrate');
    setCart((items) => [...items, {
      id: activeProduct.id + '-' + Date.now(),
      product: activeProduct, mayo, queso, extras: selectedExtras, note: note.trim(),
      snackFlavor: activeProduct.service === 'bag' ? snackFlavor : undefined,
      bagFilling: activeProduct.service === 'bag' ? bagFilling : undefined,
      preparation,
    }]);
    setAddedCartMessage(nextMaicitoMessage('truchita-added-cart-phrase', addedCartMessages));
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
    const delivery = deliveryPolicy(total);
    const message = '*PEDIDO NUEVO — EL TRUCHITA* 🔥\n*Folio:* ' + reference + '\n\n' + order + '\n\n*SUBTOTAL: ' + money(total) + '*\nEnvío: ' + delivery.whatsapp + '\n\n*Datos de entrega*\nNombre: ' + customer.name + '\nTeléfono: ' + customer.phone + '\nModalidad: Servicio a domicilio\nDirección: ' + customer.address + '\nReferencias: ' + customer.references + '\nUbicación exacta: ' + (customer.exactLocation || 'No compartida') + '\nCambio: ' + payment + '\n\n*Importante:* El pedido se trabajará hasta ser confirmado por El Truchita. Gracias por tu preferencia.';
    return 'https://wa.me/' + WHATSAPP_BUSINESS_NUMBER + '?text=' + encodeURIComponent(message);
  };

  const handleCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isOpen) return;
    triggerMaicito('celebrate');
    setSendingMessage(nextMaicitoMessage('truchita-sending-phrase', sendingMessages));
    setModal('sending');
    window.setTimeout(() => window.location.assign(whatsappUrl()), 1150);
  };

  const closeCartToMenu = () => {
    setModal('none');
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openCart = () => {
    if (!cart.length) setEmptyCartMessage(nextMaicitoMessage('truchita-empty-cart-phrase', emptyCartMessages));
    setAddedCartMessage('');
    setModal('cart');
  };

  const currentIndex = String(activePanel + 1).padStart(2, '0') + ' / ' + String(panelDetails.length).padStart(2, '0');
  const nextPanel = (activePanel + 1) % panelDetails.length;

  return <main className="menu-page">
    <header className="site-header menu-header">
      <a className="mini-logo" href="/" aria-label="Volver al inicio"><span>ESQUITES</span><strong>EL TRUCHITA</strong></a>
      <nav aria-label="Navegación principal"><a href="/">INICIO</a><a href="#menu">MENÚ</a><a href="#contacto">A DOMICILIO</a></nav>
      <button className="header-order" type="button" onClick={openCart}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button>
    </header>
    <div className={'maicito-roamer is-' + maicitoAction} aria-hidden="true"><img src={maicitoAction === 'guide' ? '/maicito-truchita-guide.png' : '/maicito-truchita-free.png'} alt="" /><i>✦</i><i>✦</i><i>✦</i></div>

    <section className="menu menu-only" id="menu" aria-labelledby="menu-title">
      <div className="menu-lead">
        <p className="section-kicker light">ARMA TU ANTOJO, A TU GUSTO</p>
        <h1 id="menu-title">EL MENÚ<br /><em>ESTÁ CALIENTE.</em></h1>
        <div className="menu-lead-side"><figure className="menu-photo"><img src="/esquites-charola-carbon.png" alt="Charola de aluminio con esquites asados al carbón, queso, mayonesa y limón" /><figcaption>CHAROLA ALUMINIO · HECHA AL MOMENTO · SOLO A DOMICILIO</figcaption></figure><p>Elige un nivel. Cada preparación se arma al carbón y sale en charola de aluminio.</p></div>
      </div>

      <section className="arcade-level-select" aria-labelledby="level-select-title">
        <div className="arcade-level-heading"><p>INSERTA TU ANTOJO</p><h2 id="level-select-title">ELIGE UN<br /><em>NIVEL.</em></h2><span>05 NIVELES · HECHOS AL CARBÓN</span></div>
        <div className="level-card-grid" role="tablist" aria-label="Niveles del menú">{panelDetails.map((panel, index) => <button key={panel.key} className={'level-card level-' + panel.key + (activePanel === index ? ' active' : '') + (visitedPanels.includes(index) ? ' visited' : '')} type="button" onClick={() => navigatePanel(index)} role="tab" aria-selected={activePanel === index}><span className="level-card-number">{panel.level}</span><i aria-hidden="true">{panel.icon}</i><strong>{panel.nav}</strong><small>{panel.clue}</small><b>{visitedPanels.includes(index) ? 'VISTO' : 'NUEVO'}</b></button>)}</div>
      </section>

      <div className="menu-category-nav arcade-mini-map" aria-label="Navegación del menú">
        <div className="menu-tabs" role="tablist">{panelDetails.map((panel, index) => <button key={panel.key} className={(activePanel === index ? 'active ' : '') + (visitedPanels.includes(index) ? 'visited' : 'unvisited')} type="button" onClick={() => navigatePanel(index)} role="tab" aria-selected={activePanel === index}><span>{String(index + 1).padStart(2, '0')}</span>{panel.nav}</button>)}</div>
        <div className="menu-nav-arrows"><button type="button" aria-label="Sección anterior" onClick={() => navigatePanel((activePanel + panelDetails.length - 1) % panelDetails.length)}>←</button><span>{currentIndex}</span><button type="button" aria-label="Sección siguiente" onClick={() => navigatePanel((activePanel + 1) % panelDetails.length)}>→</button></div>
      </div>

      <div className="menu-panel-rail" ref={panelRail} onScroll={syncActivePanel}>
        {panelDetails.map((panel) => <section className="menu-panel" key={panel.key} aria-label={panel.title}>
          {panel.key === 'bolsa'
            ? <BagSection product={productsBySection.bolsa[0]} fillings={bagFillings} onChoose={openCustomizer} />
            : panel.key === 'muy-mexicano'
              ? <MuyMexicanoSection productsBySection={productsBySection} bagFillings={bagFillings} onChoose={openCustomizer} />
              : <MenuSection eyebrow={panel.eyebrow} title={panel.title} products={productsBySection[panel.key]} onChoose={openCustomizer} accent={panel.accent} />}
        </section>)}
      </div>

      <div className="menu-bottom-line"><span>¿YA SABES QUÉ SE TE ANTOJA?</span><button type="button" onClick={openCart}>VER MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></div>
    </section>

    <section className="contact" id="contacto"><div><p className="section-kicker">CUANDO EL ANTOJO PEGA</p><h2>SOLO A<br /><em>DOMICILIO.</em></h2></div><div className="contact-copy"><p>Entregamos en Zacapoaxtla, Puebla.</p><dl className="hours"><div><dt>DOMINGO A VIERNES</dt><dd>6:30 P. M. — 12:30 A. M.</dd></div><div><dt>SÁBADO</dt><dd>CERRADO</dd></div></dl><a href={'https://wa.me/' + WHATSAPP_BUSINESS_NUMBER} target="_blank" rel="noreferrer">PEDIR POR WHATSAPP <span>↗</span></a></div></section>
    <footer><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><p>SOLO A DOMICILIO · DOM–VIE 6:30 P. M. — 12:30 A. M.</p><button type="button" onClick={openCart}>MI PEDIDO <i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button></footer>
    <button className="floating-order" type="button" onClick={openCart} aria-label="Abrir mi pedido"><span>MI PEDIDO</span><strong>{cart.length || '0'}</strong><i className={cart.length ? 'cart-dot active' : 'cart-dot'} /></button>

    {modal !== 'none' && <div className="modal-backdrop" onMouseDown={() => modal !== 'sending' && setModal('none')}><section className={'order-modal ' + modal} role="dialog" aria-modal="true" aria-label="Mi pedido" onMouseDown={(event) => event.stopPropagation()}>
      {modal !== 'sending' && <button className="close-modal" type="button" onClick={() => setModal('none')} aria-label="Cerrar">×</button>}
      {modal === 'customize' && activeProduct && <Customizer activeProduct={activeProduct} activeBasePrice={activeBasePrice} activePrice={activePrice} preparation={preparation} mayo={mayo} queso={queso} setMayo={setMayo} setQueso={setQueso} snackFlavor={snackFlavor} setSnackFlavor={setSnackFlavor} bagFilling={bagFilling} setBagFilling={setBagFilling} bagFillings={bagFillings} availableExtras={availableExtras} selectedExtraIds={selectedExtraIds} toggleExtra={toggleExtra} note={note} setNote={setNote} onCharcoalBet={charcoalBet} onAdd={addToCart} />}
      {modal === 'cart' && <CartView cart={cart} total={total} isOpen={isOpen} isSaturday={status?.isSaturday} statusLabel={status?.label} emptyMessage={emptyCartMessage} addedMessage={addedCartMessage} suggestedPanel={panelDetails[nextPanel]} onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))} onEmpty={() => { setCart([]); setReference(''); setAddedCartMessage(''); setEmptyCartMessage(nextMaicitoMessage('truchita-empty-cart-phrase', emptyCartMessages)); }} onContinue={closeCartToMenu} onExplore={() => { setModal('none'); window.setTimeout(() => navigatePanel(nextPanel), 0); }} onCheckout={() => { if (!isOpen) return; setReference((current) => current || orderReference()); setModal('checkout'); }} />}
      {modal === 'checkout' && <CheckoutForm customer={customer} setCustomer={setCustomer} total={total} reference={reference} isOpen={isOpen} statusLabel={status?.label} onSubmit={handleCheckout} onBack={() => setModal('cart')} />}
      {modal === 'sending' && <div className="sending-state"><div className="corn-flight" aria-hidden="true"><img src="/maicito-truchita-free.png" alt="" /><i>✦</i><i>✦</i><i>✦</i></div><p className="modal-kicker">PREPARANDO TU MENSAJE</p><h2>¡VA VOLANDO<br />A WHATSAPP!</h2><p>{sendingMessage}</p></div>}
    </section></div>}
  </main>;
}

function Customizer({ activeProduct, activeBasePrice, activePrice, preparation, mayo, queso, setMayo, setQueso, snackFlavor, setSnackFlavor, bagFilling, setBagFilling, bagFillings, availableExtras, selectedExtraIds, toggleExtra, note, setNote, onCharcoalBet, onAdd }: { activeProduct: Product; activeBasePrice: number; activePrice: number; preparation: Preparation; mayo: boolean; queso: boolean; setMayo: (value: boolean) => void; setQueso: (value: boolean) => void; snackFlavor: SnackFlavor; setSnackFlavor: (value: SnackFlavor) => void; bagFilling?: Product; setBagFilling: (value: Product) => void; bagFillings: Product[]; availableExtras: ExtraOption[]; selectedExtraIds: string[]; toggleExtra: (id: string) => void; note: string; setNote: (value: string) => void; onCharcoalBet: () => void; onAdd: () => void }) {
  const carbonOnly = preparation === 'muy-mexicano';
  const selectedCount = Number(mayo) + Number(queso) + selectedExtraIds.length;
  const previewClass = 'tray-preview' + (mayo ? ' has-mayo' : '') + (queso ? ' has-queso' : '') + (selectedExtraIds.length ? ' has-extras' : '');
  const previewImage = activeProduct.service === 'bag' ? '/botanas-en-bolsa.png' : '/esquites-charola-carbon.png';
  return <><p className="modal-kicker">{carbonOnly ? '100% AL CARBÓN · MUY MEXICANO' : serviceLabel(activeProduct)}</p><h2>{activeProduct.name}</h2><div className="customizer-arcade-top"><figure className={previewClass}><img src={previewImage} alt={activeProduct.service === 'bag' ? 'Botana para personalizar' : 'Charola de aluminio con esquites al carbón'} /><span className="preview-charcoal">AL CARBÓN</span>{mayo && <b className="preview-chip chip-mayo">MAYO</b>}{queso && <b className="preview-chip chip-queso">QUESO</b>}{selectedExtraIds.length > 0 && <b className="preview-chip chip-extra">+{selectedExtraIds.length} EXTRA{selectedExtraIds.length > 1 ? 'S' : ''}</b>}</figure><div className="arcade-score"><span>ANTOJO SCORE</span><strong>{money(activePrice)}</strong><small>{activeProduct.service === 'bag' ? 'BOTANA + ESQUITE' : 'CHAROLA DE ALUMINIO'}</small><b>{String(selectedCount).padStart(2, '0')} POWER-UPS</b></div></div><ol className="customizer-steps" aria-label="Pasos para personalizar"><li className="active"><span>01</span> BASE</li><li className={selectedCount ? 'active' : ''}><span>02</span> TOQUES</li><li className={note ? 'active' : ''}><span>03</span> NOTA</li></ol>{activeProduct.service === 'bag' && <p className="bag-total-note">Incluye la botana elegida; sus precios no se muestran por separado.</p>}{carbonOnly && <p className="carbon-only-note">Esta versión sale de las brasas sin mantequilla, epazote ni especias añadidas.</p>}<div className="custom-options">
    {activeProduct.service === 'bag' && <><fieldset className="bag-customizer"><legend>PASO 01 · ¿QUIERES CAMBIAR LA BOTANA?</legend><div className="bag-customizer-options">{snackFlavors.map((flavor) => <label className={snackFlavor.id === flavor.id ? 'selected' : ''} key={flavor.id}><input type="radio" name="snack" checked={snackFlavor.id === flavor.id} onChange={() => setSnackFlavor(flavor)} /><span className={'snack-swatch snack-' + flavor.color} /><b>{flavor.name}</b></label>)}</div></fieldset><fieldset className="bag-filling-customizer"><legend>¿QUÉ ESQUITE QUIERES DENTRO?</legend><div>{bagFillings.map((filling) => <label className={bagFilling?.id === filling.id ? 'selected' : ''} key={filling.id}><input type="radio" name="bag-filling" checked={bagFilling?.id === filling.id} onChange={() => setBagFilling(filling)} /><span>{filling.section === 'traditional' ? 'CLÁSICO' : 'ESPECIAL'}</span><b>{filling.name}</b><em>{money(filling.price)}</em></label>)}</div></fieldset></>}
    <div className="customizer-step-label"><span>02</span><b>ELIGE TUS TOQUES</b><small>La charola se arma a tu gusto.</small></div><ToggleRow kind="mayo" title="MAYONESA" description={carbonOnly ? 'Opcional: se agrega aparte si la quieres.' : 'Como te gusta, o sin ella.'} checked={mayo} disabled={false} onChange={setMayo} />
    <ToggleRow kind="queso" title="QUESO" description={carbonOnly ? 'Opcional: se agrega aparte si lo quieres.' : 'Queso para cerrar bien la preparación.'} checked={queso} disabled={false} onChange={setQueso} />
    <fieldset><legend>{activeProduct.service === 'corn' ? 'SI EL ELOTE NO TE BASTA, AGRÉGALE…' : 'ELIGE TODOS LOS EXTRAS QUE SE TE ANTOJEN'}</legend>{activeProduct.service === 'corn' && <p className="extra-help">Tocino, salchicha, quesos fundidos o una porción de maíz asado — $25 c/u.</p>}<div className="extra-grid">{availableExtras.map((option) => <label key={option.id} className={selectedExtraIds.includes(option.id) ? 'extra-option selected' : 'extra-option'}><input type="checkbox" checked={selectedExtraIds.includes(option.id)} onChange={() => toggleExtra(option.id)} /><IngredientReference kind={option.imagePosition} /><span><b>{option.name}</b><small>{option.description}</small></span><strong>+{money(option.price)}</strong></label>)}</div></fieldset><button type="button" className="charcoal-bet" onClick={onCharcoalBet}><span>✦ APUESTA DEL CARBÓN</span><small>Maicito te arma una combinación con un extra.</small><b>↯</b></button>
    <label className="note-field"><span><b>03</b> NOTA PARA TU PEDIDO</span><textarea maxLength={180} placeholder="Ej. bien picoso, sin limón..." value={note} onChange={(event) => setNote(event.target.value)} /></label>
  </div><button className="wide-action arcade-add" type="button" onClick={onAdd}>AGREGAR A MI PEDIDO <span>{money(activePrice)}</span></button></>;
}

function ToggleRow({ kind, title, description, checked, disabled, onChange }: { kind: 'mayo' | 'queso'; title: string; description: string; checked: boolean; disabled: boolean; onChange: (value: boolean) => void }) {
  return <label className={disabled ? 'switch-row switch-row-visual disabled' : 'switch-row switch-row-visual'}><span className="switch-option-copy"><IngredientReference kind={kind} /><span><b>{title}</b><small>{description}</small></span></span><input disabled={disabled} type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i /></label>;
}

function Maicito({ mood = 'happy', caption }: { mood?: 'happy' | 'sleepy' | 'sad'; caption?: string }) {
  return <figure className={'maicito maicito-' + mood} aria-hidden="true"><img src={mood === 'sad' ? '/maicito-truchita-sad-free.png' : '/maicito-truchita-free.png'} alt="" />{caption && <figcaption>{caption}</figcaption>}</figure>;
}

function CartView({ cart, total, isOpen, isSaturday, statusLabel, emptyMessage, addedMessage, suggestedPanel, onRemove, onEmpty, onContinue, onExplore, onCheckout }: { cart: CartItem[]; total: number; isOpen: boolean; isSaturday?: boolean; statusLabel?: string; emptyMessage: string; addedMessage: string; suggestedPanel: typeof panelDetails[number]; onRemove: (id: string) => void; onEmpty: () => void; onContinue: () => void; onExplore: () => void; onCheckout: () => void }) {
  const delivery = deliveryPolicy(total);
  const craving = Math.min(100, 15 + cart.length * 25 + Math.floor(total / 40) * 5);
  return <><p className="modal-kicker">ESTO ES LO QUE SE VA A LA BRASA</p><h2>MI PEDIDO <span className="cart-count">{cart.length}</span></h2>{cart.length === 0 ? <div className="empty-cart"><Maicito /><p>{emptyMessage}</p><button type="button" onClick={onContinue}>VER EL MENÚ</button></div> : <><div className="cart-list">{cart.map((item) => <article className="cart-item" key={item.id}><div><h3>{item.product.name}</h3><p>{item.preparation === 'muy-mexicano' ? '100% al carbón · ' : ''}{item.snackFlavor ? item.snackFlavor.name + ' · ' : ''}{item.bagFilling ? 'Con ' + item.bagFilling.name + ' · ' : ''}{item.mayo ? 'Con mayo' : 'Sin mayo'} · {item.queso ? 'Con queso' : 'Sin queso'} · {item.extras.length ? item.extras.map((extra) => extra.name).join(', ') : 'Sin extras'}{item.note ? ' · “' + item.note + '”' : ''}</p></div><b>{money(cartItemTotal(item))}</b><button type="button" onClick={() => onRemove(item.id)} aria-label={'Eliminar ' + item.product.name}>×</button></article>)}</div><div className="arcade-receipt"><span>RECIBO DE MAQUINITA · BRASA-01</span><b>◼ ◼ ◼</b></div><div className="cart-total"><span>SUBTOTAL</span><strong>{money(total)}</strong></div><div className="craving-meter"><span>MEDIDOR DEL ANTOJO</span><div aria-label={'Antojo al ' + craving + '%'}><i style={{ width: craving + '%' }} /></div><b>{craving}%</b></div><aside className="delivery-summary"><p>{delivery.title}</p><span>{delivery.detail}</span></aside>{addedMessage && <aside className="cart-added-message" role="status"><Maicito /><div><p>{addedMessage}</p><button type="button" onClick={onExplore}>NIVEL SIGUIENTE · {suggestedPanel.nav} ↗</button></div></aside>}{!isOpen && <aside className="closed-notice"><Maicito mood={isSaturday ? 'sad' : 'sleepy'} /><div><p>{statusLabel ?? 'CERRADO AHORA'}</p><span>{isSaturday ? 'Te extraño, pronto nos veremos. Hoy me tocó sobrevivir a la uni.' : 'Puedes guardar tu antojo, pero los pedidos se habilitan durante nuestro horario de atención.'}</span></div></aside>}<div className="cart-actions"><button type="button" className="secondary-action" onClick={onContinue}>SEGUIR ORDENANDO</button><button type="button" className="empty-button" onClick={onEmpty}>VACIAR SELECCIÓN</button></div><button className="wide-action" type="button" disabled={!isOpen} onClick={onCheckout}>{isOpen ? 'REALIZAR PEDIDO' : 'PEDIDOS CERRADOS'} <span>→</span></button></>}</>;
}

function CheckoutForm({ customer, setCustomer, total, reference, isOpen, statusLabel, onSubmit, onBack }: { customer: CustomerDetails; setCustomer: (value: CustomerDetails) => void; total: number; reference: string; isOpen: boolean; statusLabel?: string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onBack: () => void }) {
  const [locationStatus, setLocationStatus] = useState('');
  const delivery = deliveryPolicy(total);

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

  return <form onSubmit={onSubmit}><p className="modal-kicker">SERVICIO ÚNICAMENTE A DOMICILIO</p><h2>¿A NOMBRE DE QUIÉN?</h2><p className="checkout-note">Folio {reference}. Estos datos van incluidos en tu mensaje de WhatsApp.</p><aside className="arcade-receipt checkout-receipt"><span>RECIBO FINAL · LISTO PARA CONFIRMAR</span><strong>{money(total)}</strong><b>▣ {reference}</b></aside>{!isOpen && <aside className="closed-notice"><p>{statusLabel ?? 'CERRADO AHORA'}</p><span>El formulario se puede revisar, pero los pedidos se habilitan en horario de atención.</span></aside>}<div className="customer-form"><label><span>NOMBRE</span><input required autoComplete="name" value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Tu nombre" /></label><label><span>TELÉFONO</span><input required type="tel" inputMode="numeric" autoComplete="tel" pattern="[0-9]{10}" maxLength={10} title="Escribe un número de 10 dígitos" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10 dígitos" /></label><div className="delivery-only">ENTREGA A DOMICILIO</div><label><span>DIRECCIÓN</span><input required autoComplete="street-address" value={customer.address} onChange={(event) => setCustomer({ ...customer, address: event.target.value })} placeholder="Calle, número y colonia" /></label><label className="form-wide"><span>REFERENCIAS <small>OPCIONAL</small></span><textarea value={customer.references} onChange={(event) => setCustomer({ ...customer, references: event.target.value })} placeholder="Color de portón, entre calles o cualquier referencia." /></label><div className="form-wide location-field"><span>UBICACIÓN EXACTA <small>OPCIONAL, MUY ÚTIL PARA EL REPARTIDOR</small></span><div><input type="url" value={customer.exactLocation} onChange={(event) => setCustomer({ ...customer, exactLocation: event.target.value })} placeholder="Pega un enlace de Google Maps" /><button type="button" onClick={shareExactLocation}>USAR MI UBICACIÓN ACTUAL <b>⌖</b></button></div>{locationStatus && <p role="status">{locationStatus}</p>}</div><fieldset className="form-wide payment-choice"><legend>¿PAGARÁS CON CAMBIO?</legend><div><label className={customer.payment === 'exact' ? 'selected' : ''}><input type="radio" name="payment" checked={customer.payment === 'exact'} onChange={() => setCustomer({ ...customer, payment: 'exact', changeFor: '' })} /><span><b>NO, LLEVO PAGO EXACTO</b><small>Así la entrega es más ágil.</small></span></label><label className={customer.payment === 'change' ? 'selected' : ''}><input type="radio" name="payment" checked={customer.payment === 'change'} onChange={() => setCustomer({ ...customer, payment: 'change' })} /><span><b>SÍ, NECESITO CAMBIO</b><small>Indícanos con cuánto pagarás.</small></span></label></div>{customer.payment === 'change' && <label className="change-field"><span>NECESITO CAMBIO PARA</span><input required type="number" min="1" inputMode="numeric" value={customer.changeFor} onChange={(event) => setCustomer({ ...customer, changeFor: event.target.value })} placeholder="Ej. 200" /><b>MXN</b></label>}</fieldset></div><aside className="delivery-notice"><p>{delivery.title}</p><strong>{delivery.detail}</strong><span>La dirección se valida antes de preparar. El tiempo puede variar por tu pedido, la disponibilidad del repartidor y contratiempos en el camino.</span></aside><aside className="privacy-note"><strong>TUS DATOS, SOLO PARA TU PEDIDO.</strong><span>Se usan para preparar y entregar esta orden; se comparten con El Truchita en tu mensaje de WhatsApp.</span></aside><aside className="order-confirmation"><p>IMPORTANTE</p><strong>TU ORDEN SE TRABAJARÁ HASTA QUE SEA CONFIRMADA POR EL NEGOCIO.</strong><span>Gracias por tu preferencia. En breve te responderemos por WhatsApp.</span></aside><button className="wide-action" type="submit" disabled={!isOpen}>{isOpen ? 'ENVIAR A WHATSAPP' : 'PEDIDOS CERRADOS'} <span>↗</span></button><button className="back-button" type="button" onClick={onBack}>← VOLVER A MI PEDIDO</button></form>;
}

function MenuSection({ eyebrow, title, products, onChoose, accent = false }: { eyebrow: string; title: string; products: Product[]; onChoose: (product: Product, options?: CustomizeOptions) => void; accent?: boolean }) {
  const isCorn = products.some((product) => product.service === 'corn');
  return <div className={accent ? 'menu-section menu-section-accent' : 'menu-section'}><header><p>{eyebrow}</p><h2>{title}</h2>{isCorn && <p className="elote-extra-note">Si el elote no es suficiente, agrega tocino, salchicha, quesos fundidos o una porción de maíz asado por <b>$25 c/u.</b></p>}</header>{products.length ? <div className="product-grid">{products.map((product, index) => <article className={product.id === 'truchita' ? 'product-card product-card-featured' : 'product-card'} key={product.id}><div className="product-number">{String(index + 1).padStart(2, '0')}</div><figure className="product-thumb"><img src={productImageForDisplay(product)} alt={'Referencia de ' + product.name} /></figure><div className="product-copy">{product.tag && <span className="product-tag">{product.tag}</span>}<h3>{product.name}</h3><p>{product.description}</p></div><strong>{money(product.price)}</strong><button type="button" onClick={() => onChoose(product)}>ARMA TU CHAROLA <span>+</span></button></article>)}</div> : <div className="empty-section">POR AHORA ESTA SECCIÓN ESTÁ DESCANSANDO EN EL ASADOR. VUELVE PRONTO.</div>}</div>;
}

function BagSection({ product, fillings, onChoose }: { product?: Product; fillings: Product[]; onChoose: (product: Product, options?: CustomizeOptions) => void }) {
  if (!product || !fillings.length) return <div className="bag-section-empty">POR AHORA ESTA OPCIÓN NO ESTÁ DISPONIBLE. VUELVE PRONTO.</div>;
  return <div className="bag-section"><div className="bag-section-copy"><p className="section-kicker light">ABRIMOS LA BOTANA. EL RESTO LO ARMAS A TU GUSTO.</p><span className="bag-price">BOTANA + ESQUITE A TU ELECCIÓN</span><h2>UN GUSTITO<br /><em>MÁS.</em></h2><p>Elige la botana y el esquite clásico o especial que quieres dentro. Verás el total de tu combinación antes de agregar extras.</p></div><figure className="bag-main-photo"><img src="/botanas-en-bolsa.png" alt="Bolsas de botana de distintos sabores sobre una mesa con chiles y limón" /><figcaption>UNA BOLSA · EL ESQUITE QUE TÚ ELIJAS</figcaption></figure><div className="bag-flavor-area"><p>¿QUÉ BOTANA SE TE ANTOJA?</p><div className="bag-flavor-stack">{snackFlavors.map((flavor, index) => <button type="button" className={'bag-flavor flavor-' + flavor.color} style={{ '--flavor-index': index } as CSSProperties} key={flavor.id} onClick={() => onChoose(product, { snackFlavor: flavor, bagFilling: fillings[0] })}><span>0{index + 1}</span><b>{flavor.name}</b><small>{flavor.note}</small><i>+</i></button>)}</div><small className="bag-hint">ELIGE TU BOTANA Y DESPUÉS DECIDE QUÉ ESQUITE VA DENTRO</small></div></div>;
}

function MuyMexicanoSection({ productsBySection, bagFillings, onChoose }: { productsBySection: Record<MenuSectionType, Product[]>; bagFillings: Product[]; onChoose: (product: Product, options?: CustomizeOptions) => void }) {
  const groups = [
    { name: 'CLÁSICOS', detail: 'La base de siempre, directo del carbón.', products: productsBySection.traditional },
    { name: 'ESPECIALES', detail: 'Sabores de la casa con el fuego al frente.', products: productsBySection.specialty },
    { name: 'ELOTES', detail: 'Enteros, asados y sin rodeos.', products: productsBySection.elotes },
    { name: 'UN GUSTITO MÁS', detail: 'Tu botana y tu esquite preferido, a las brasas.', products: bagFillings.length ? productsBySection.bolsa : [] },
  ].filter((group) => group.products.length);
  return <div className="mexican-section"><header><p>MAÍZ, FUEGO Y TRADICIÓN, COMO DEBE SER.</p><h2>MUY MEXICANO</h2></header><div className="mexican-intro"><div><p>100% AL CARBÓN</p><strong>EL SABOR DEL MAÍZ CUANDO LO DEJAS HABLAR.</strong><span>Estas preparaciones salen del asador sin mantequilla, epazote ni especias añadidas. Mayonesa y queso son opcionales y se sirven aparte.</span></div><div className="mexican-reference-images"><img src="/elote-brasa-real.jpeg" alt="Elote asado a las brasas" /><img src="/fogon-carbon-real.jpeg" alt="Preparación sobre brasas" /></div></div><div className="mexican-family-grid">{groups.map((group) => <article key={group.name}><p>{group.name}</p><span>{group.detail}</span><div>{group.products.map((product) => <button key={product.id} type="button" onClick={() => onChoose(product, { preparation: 'muy-mexicano', snackFlavor: snackFlavors[0], bagFilling: bagFillings[0] })}><b>{product.name}</b><small>{product.service === 'bag' ? 'A TU ELECCIÓN' : money(product.price)}</small><i>↗</i></button>)}</div></article>)}</div></div>;
}
