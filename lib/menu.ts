export type MenuSection = 'traditional' | 'specialty' | 'elotes' | 'bolsa';
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
};

export type ExtraOption = {
  id: string;
  name: string;
  price: number;
  description: string;
  imagePosition: 'mayo' | 'queso' | 'elote' | 'ingredientes';
  onlyWithIngredients?: boolean;
};

export type MenuData = {
  products: Product[];
  extras: ExtraOption[];
  updatedAt: string;
};

const productImage = '/esquite-callejero.png';
const cornImage = '/hero-corn.png';
const bagImage = '/botanas-en-bolsa.png';

export const defaultMenu: MenuData = {
  updatedAt: '2026-08-26T00:00:00.000Z',
  products: [
    { id: 'clasico', section: 'traditional', name: 'EL CLÁSICO', price: 70, description: 'Elote asado al carbón, mayonesa, queso, limón y chile.', image: productImage, hasIngredients: false, service: 'cup' },
    { id: 'tocino', section: 'traditional', name: 'CON TOCINO', price: 80, description: 'Elote al carbón con tocino, limón y chile.', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'salchicha', section: 'traditional', name: 'CON SALCHICHA', price: 80, description: 'Elote al carbón con salchicha, limón y chile.', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'tocino-salchicha', section: 'traditional', name: 'TOCINO + SALCHICHA', price: 85, description: 'Elote al carbón con el doble antojo.', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'tocino-queso', section: 'traditional', name: 'TOCINO + QUESO ESPECIAL', price: 95, description: 'Tocino y mezcla de queso manchego/hebra.', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'salchicha-queso', section: 'traditional', name: 'SALCHICHA + QUESO ESPECIAL', price: 95, description: 'Salchicha y mezcla de queso manchego/hebra.', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'tatemado', section: 'specialty', name: 'EL TATEMADO', price: 125, description: 'Poblano tatemado, cebolla asada, jalapeño asado, chorizo dorado, queso especial y salsa Truchita.', tag: 'FUEGO', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'choriqueso', section: 'specialty', name: 'EL CHORIQUESO', price: 135, description: 'Chorizo dorado, mezcla de quesos, cebolla asada y salsa tatemada.', tag: 'FUEGO', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'pastor', section: 'specialty', name: 'EL PASTOR', price: 145, description: 'Carne al pastor, cebolla, cilantro, queso especial y salsa de la casa.', tag: 'MEXICANO', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'carnitas', section: 'specialty', name: 'EL CARNITAS', price: 155, description: 'Carnitas, cebolla, cilantro, queso especial, salsa verde o roja y limón.', tag: 'MEXICANO', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'alambre', section: 'specialty', name: 'EL ALAMBRE', price: 165, description: 'Carne asada, tocino, poblano tatemado, cebolla, quesos fundidos y salsa de la casa.', tag: 'CASA', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'truchita', section: 'specialty', name: 'EL TRUCHITA', price: 170, description: 'Carne asada, chorizo, tocino, poblano tatemado, cebolla asada, quesos, salsa Truchita y limón.', tag: 'ESPECIALIDAD DE LA CASA', image: productImage, hasIngredients: true, service: 'cup' },
    { id: 'elote-clasico', section: 'elotes', name: 'ELOTE CLÁSICO', price: 45, description: 'Elote entero asado al carbón, con mayonesa, queso, limón y chile.', image: cornImage, hasIngredients: false, service: 'corn' },
    { id: 'elote-con-todo', section: 'elotes', name: 'ELOTE CON TODO', price: 60, description: 'Elote entero al carbón con queso, mayonesa, limón, chile y un toque de la casa.', tag: 'AL CARBÓN', image: cornImage, hasIngredients: true, service: 'corn' },
    { id: 'esquite-en-bolsa', section: 'bolsa', name: 'ESQUITE EN BOLSA', price: 105, description: 'Tu botana favorita abierta y rellena de granos de elote, queso, mayonesa, limón y chile.', tag: 'EL ANTOJO COMPLETO', image: bagImage, hasIngredients: true, service: 'bag' },
  ],
  extras: [
    { id: 'sin-extra', name: 'SIN EXTRA', price: 0, description: 'Así mero, recién salido de la brasa.', imagePosition: 'elote' },
    { id: 'extra-elote', name: 'EXTRA ELOTE', price: 15, description: 'Una cucharada más de maíz recién asado.', imagePosition: 'elote' },
    { id: 'extra-ingrediente', name: 'EXTRA INGREDIENTE', price: 20, description: 'Más del ingrediente que ya eligió tu vaso.', imagePosition: 'ingredientes', onlyWithIngredients: true },
  ],
};

const isString = (value: unknown): value is string => typeof value === 'string';

export function isMenuData(value: unknown): value is MenuData {
  if (!value || typeof value !== 'object') return false;
  const menu = value as Partial<MenuData>;
  if (!Array.isArray(menu.products) || !Array.isArray(menu.extras)) return false;

  return menu.products.every((product) => {
    if (!product || typeof product !== 'object') return false;
    const item = product as Product;
    return isString(item.id)
      && ['traditional', 'specialty', 'elotes', 'bolsa'].includes(item.section)
      && isString(item.name)
      && Number.isFinite(item.price)
      && isString(item.description)
      && isString(item.image)
      && typeof item.hasIngredients === 'boolean'
      && (item.service === undefined || ['cup', 'corn', 'bag'].includes(item.service));
  }) && menu.extras.every((extra) => {
    if (!extra || typeof extra !== 'object') return false;
    const item = extra as ExtraOption;
    return isString(item.id)
      && isString(item.name)
      && Number.isFinite(item.price)
      && isString(item.description)
      && ['mayo', 'queso', 'elote', 'ingredientes'].includes(item.imagePosition);
  });
}
