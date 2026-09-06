export type MenuSection = 'traditional' | 'specialty' | 'elotes' | 'bolsa' | 'muy-mexicano';
export type ProductService = 'cup' | 'corn' | 'bag';

export type Product = {
  id: string;
  section: MenuSection;
  name: string;
  price: number;
  description: string;
  tag?: string;
  image: string;
  hasIngredients: boolean;
  service?: ProductService;
  available?: boolean;
};

export type ExtraOption = {
  id: string;
  name: string;
  price: number;
  description: string;
  imagePosition: 'mayo' | 'queso' | 'elote' | 'ingredientes';
  onlyWithIngredients?: boolean;
  onlyForServices?: ProductService[];
};

export type MenuData = {
  products: Product[];
  extras: ExtraOption[];
  updatedAt: string;
};

const productImage = '/esquites-charola-carbon.png';
const cornImage = '/hero-corn.png';
const bagImage = '/botanas-en-bolsa.png';
const legacyCupImages = new Set(['/esquite-callejero.png', '/tradicional-clasico.png', '/tradicional-tocino.png', '/tradicional-salchicha.png', '/tradicional-tocino-salchicha.png', '/tradicional-tocino-queso.png', '/tradicional-salchicha-queso.png']);
const traditionalImages = {
  clasico: productImage,
  tocino: productImage,
  salchicha: productImage,
  'tocino-salchicha': productImage,
  'tocino-queso': productImage,
  'salchicha-queso': productImage,
};

export const defaultMenu: MenuData = {
  updatedAt: '2026-08-29T00:00:00.000Z',
  products: [
    { id: 'clasico', section: 'traditional', name: 'EL CLÁSICO', price: 70, description: 'Elote asado al carbón, mayonesa, queso, limón y chile.', image: traditionalImages.clasico, hasIngredients: false, service: 'cup' },
    { id: 'tocino', section: 'traditional', name: 'CON TOCINO', price: 80, description: 'Elote al carbón con tocino, limón y chile.', image: traditionalImages.tocino, hasIngredients: true, service: 'cup' },
    { id: 'salchicha', section: 'traditional', name: 'CON SALCHICHA', price: 80, description: 'Elote al carbón con salchicha, limón y chile.', image: traditionalImages.salchicha, hasIngredients: true, service: 'cup' },
    { id: 'tocino-salchicha', section: 'traditional', name: 'EL VORAZ', price: 115, description: 'La combinación completa de los clásicos: elote al carbón, tocino doradito, salchicha, mezcla de quesos, mayonesa, limón, chile y el antojo bien servido.', image: traditionalImages['tocino-salchicha'], hasIngredients: true, service: 'cup' },
    { id: 'tocino-queso', section: 'traditional', name: 'TOCINO + QUESO ESPECIAL', price: 95, description: 'Tocino y mezcla de queso manchego/hebra.', image: traditionalImages['tocino-queso'], hasIngredients: true, service: 'cup' },
    { id: 'salchicha-queso', section: 'traditional', name: 'SALCHICHA + QUESO ESPECIAL', price: 95, description: 'Salchicha y mezcla de queso manchego/hebra.', image: traditionalImages['salchicha-queso'], hasIngredients: true, service: 'cup' },
    { id: 'tatemado', section: 'specialty', name: 'EL TATEMADO', price: 125, description: 'Poblano tatemado, cebolla asada, jalapeño asado, chorizo dorado y queso especial.', tag: 'FUEGO', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'choriqueso', section: 'specialty', name: 'EL CHORIQUESO', price: 135, description: 'Chorizo dorado, mezcla de quesos y cebolla asada.', tag: 'FUEGO', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'norteno', section: 'specialty', name: 'EL NORTEÑO', price: 145, description: 'Carne asada, cebolla tatemada, queso fundido y chile toreado.', tag: 'AL CARBÓN', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'poblano', section: 'specialty', name: 'EL POBLANO', price: 155, description: 'Rajas de poblano tatemado, champiñones dorados, queso fundido y cebolla.', tag: 'DE LA CASA', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'alambre', section: 'specialty', name: 'EL ALAMBRE', price: 165, description: 'Carne asada, tocino, poblano tatemado, cebolla y quesos fundidos.', tag: 'CASA', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'truchita', section: 'specialty', name: 'EL TRUCHITA', price: 170, description: 'Carne asada, chorizo, tocino, poblano tatemado, cebolla asada, quesos y limón.', tag: 'ESPECIALIDAD DE LA CASA', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'elote-clasico', section: 'elotes', name: 'ELOTE CLÁSICO', price: 45, description: 'Elote entero natural, asado al carbón. Mayonesa y queso opcionales, como tú lo prefieras.', image: cornImage, hasIngredients: false, service: 'corn' },
    { id: 'elote-un-picante', section: 'elotes', name: 'ELOTE · 1 PICANTE', price: 50, description: 'Elote entero al carbón con mayonesa y queso opcionales. Elige un picante para acompañarlo.', image: cornImage, hasIngredients: false, service: 'corn' },
    { id: 'elote-dos-picantes', section: 'elotes', name: 'ELOTE · 2 PICANTES', price: 55, description: 'Elote entero al carbón con mayonesa y queso opcionales. Tú eliges exactamente dos picantes.', image: cornImage, hasIngredients: false, service: 'corn' },
    { id: 'elote-tres-picantes', section: 'elotes', name: 'ELOTE · 3 PICANTES', price: 60, description: 'Elote entero al carbón con mayonesa y queso opcionales. Tú eliges exactamente tres picantes.', image: cornImage, hasIngredients: false, service: 'corn' },
    { id: 'elote-con-todo', section: 'elotes', name: 'ELOTE CON TODO', price: 65, description: 'Elote entero al carbón con mayonesa y queso opcionales, más pepita con chiltepín, cacahuate con ajonjolí y chiltepín, Cheetos Flamin’ Hot y Doritos Fuego.', tag: 'TODOS LOS PICANTES', image: cornImage, hasIngredients: true, service: 'corn' },
    { id: 'esquite-en-bolsa', section: 'bolsa', name: 'UN GUSTITO MÁS', price: 105, description: 'Tu botana favorita abierta y rellena con el esquite clásico o especial que tú elijas.', tag: 'EL ANTOJO COMPLETO', image: bagImage, hasIngredients: true, service: 'bag' },
  ],
  extras: [
    { id: 'extra-elote', name: 'EXTRA ELOTE', price: 25, description: 'Una porción más de maíz recién asado.', imagePosition: 'elote' },
    { id: 'extra-ingrediente', name: 'EXTRA INGREDIENTE', price: 25, description: 'Más del ingrediente que ya lleva tu preparación.', imagePosition: 'ingredientes', onlyWithIngredients: true },
    { id: 'mezcla-quesos', name: 'MEZCLA DE QUESOS', price: 30, description: 'Una porción extra de quesos para cualquier esquite.', imagePosition: 'queso', onlyForServices: ['cup', 'bag'] },
    { id: 'tocino-elote', name: 'TOCINO EXTRA', price: 25, description: 'Tocino doradito para tu elote entero.', imagePosition: 'ingredientes', onlyForServices: ['corn'] },
    { id: 'salchicha-elote', name: 'SALCHICHA EXTRA', price: 25, description: 'Salchicha dorada para tu elote entero.', imagePosition: 'ingredientes', onlyForServices: ['corn'] },
    { id: 'quesos-fundidos-elote', name: 'QUESOS FUNDIDOS', price: 25, description: 'Un toque de quesos fundidos para tu elote entero.', imagePosition: 'queso', onlyForServices: ['corn'] },
  ],
};

const isString = (value: unknown): value is string => typeof value === 'string';
const isService = (value: unknown): value is ProductService => ['cup', 'corn', 'bag'].includes(String(value));
const isSection = (value: unknown): value is MenuSection => ['traditional', 'specialty', 'elotes', 'bolsa', 'muy-mexicano'].includes(String(value));

export function isMenuData(value: unknown): value is MenuData {
  if (!value || typeof value !== 'object') return false;
  const menu = value as Partial<MenuData>;
  if (!Array.isArray(menu.products) || !Array.isArray(menu.extras)) return false;

  return menu.products.every((product) => {
    if (!product || typeof product !== 'object') return false;
    const item = product as Product;
    return isString(item.id)
      && isSection(item.section)
      && isString(item.name)
      && Number.isFinite(item.price)
      && isString(item.description)
      && isString(item.image)
      && typeof item.hasIngredients === 'boolean'
      && (item.available === undefined || typeof item.available === 'boolean')
      && (item.service === undefined || isService(item.service));
  }) && menu.extras.every((extra) => {
    if (!extra || typeof extra !== 'object') return false;
    const item = extra as ExtraOption;
    return isString(item.id)
      && isString(item.name)
      && Number.isFinite(item.price)
      && isString(item.description)
      && ['mayo', 'queso', 'elote', 'ingredientes'].includes(item.imagePosition)
      && (item.onlyForServices === undefined || (Array.isArray(item.onlyForServices) && item.onlyForServices.every(isService)));
  });
}

/** Keeps saved administrator changes while applying this catalog's non-breaking upgrades. */
export function normalizeMenu(menu: MenuData): MenuData {
  const savedProducts = menu.products.filter((product) => product.id !== 'pastor' && product.id !== 'carnitas');
  const defaultsById = new Map(defaultMenu.products.map((product) => [product.id, product]));
  const products = savedProducts.map((product) => {
    const catalogProduct = defaultsById.get(product.id);
    const useTrayImage = Boolean(catalogProduct && product.service === 'cup' && legacyCupImages.has(product.image));
    const isSpecialty = product.section === 'specialty' && product.description.toLowerCase().includes('salsa');
    const isLegacyClassicCorn = product.id === 'elote-clasico' && product.description === 'Elote entero asado al carbón, con mayonesa, queso, limón y chile.';
    return {
      ...product,
      image: useTrayImage && catalogProduct ? catalogProduct.image : product.image,
      name: (product.id === 'tocino-salchicha' || product.id === 'elote-con-todo') && catalogProduct ? catalogProduct.name : product.name,
      price: (product.id === 'tocino-salchicha' || (product.id === 'elote-con-todo' && product.price === 60)) && catalogProduct ? catalogProduct.price : product.price,
      description: (isSpecialty || isLegacyClassicCorn || product.id === 'tocino-salchicha' || product.id === 'elote-con-todo') && catalogProduct ? catalogProduct.description : product.description,
      available: product.available !== false,
    };
  });
  const savedIds = new Set(products.map((product) => product.id));
  for (const product of defaultMenu.products) {
    if (!savedIds.has(product.id)) products.push(product);
  }

  const savedExtras = menu.extras.filter((extra) => extra.id !== 'sin-extra').map((extra) => {
    if ((extra.id === 'extra-elote' && extra.price === 15) || (extra.id === 'extra-ingrediente' && extra.price === 20)) {
      return { ...extra, price: 25 };
    }
    return extra;
  });
  const savedExtraIds = new Set(savedExtras.map((extra) => extra.id));
  for (const extra of defaultMenu.extras) {
    if (!savedExtraIds.has(extra.id)) savedExtras.push(extra);
  }

  return { ...menu, products, extras: savedExtras, updatedAt: menu.updatedAt || defaultMenu.updatedAt };
}
