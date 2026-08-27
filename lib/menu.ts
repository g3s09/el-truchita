export type MenuSection = 'traditional' | 'specialty';

export type Product = {
  id: string;
  section: MenuSection;
  name: string;
  price: number;
  description: string;
  tag?: string;
  image: string;
  hasIngredients: boolean;
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

export const defaultMenu: MenuData = {
  updatedAt: '2026-08-26T00:00:00.000Z',
  products: [
    { id: 'clasico', section: 'traditional', name: 'EL CLÁSICO', price: 70, description: 'Elote asado al carbón, mayonesa, queso, limón y chile.', image: productImage, hasIngredients: false },
    { id: 'tocino', section: 'traditional', name: 'CON TOCINO', price: 80, description: 'Elote al carbón con tocino, limón y chile.', image: productImage, hasIngredients: true },
    { id: 'salchicha', section: 'traditional', name: 'CON SALCHICHA', price: 80, description: 'Elote al carbón con salchicha, limón y chile.', image: productImage, hasIngredients: true },
    { id: 'tocino-salchicha', section: 'traditional', name: 'TOCINO + SALCHICHA', price: 85, description: 'Elote al carbón con el doble antojo.', image: productImage, hasIngredients: true },
    { id: 'tocino-queso', section: 'traditional', name: 'TOCINO + QUESO ESPECIAL', price: 95, description: 'Tocino y mezcla de queso manchego/hebra.', image: productImage, hasIngredients: true },
    { id: 'salchicha-queso', section: 'traditional', name: 'SALCHICHA + QUESO ESPECIAL', price: 95, description: 'Salchicha y mezcla de queso manchego/hebra.', image: productImage, hasIngredients: true },
    { id: 'tatemado', section: 'specialty', name: 'EL TATEMADO', price: 125, description: 'Poblano tatemado, cebolla asada, jalapeño asado, chorizo dorado, queso especial y salsa Truchita.', tag: 'FUEGO', image: productImage, hasIngredients: true },
    { id: 'choriqueso', section: 'specialty', name: 'EL CHORIQUESO', price: 135, description: 'Chorizo dorado, mezcla de quesos, cebolla asada y salsa tatemada.', tag: 'FUEGO', image: productImage, hasIngredients: true },
    { id: 'pastor', section: 'specialty', name: 'EL PASTOR', price: 145, description: 'Carne al pastor, cebolla, cilantro, queso especial y salsa de la casa.', tag: 'MEXICANO', image: productImage, hasIngredients: true },
    { id: 'carnitas', section: 'specialty', name: 'EL CARNITAS', price: 155, description: 'Carnitas, cebolla, cilantro, queso especial, salsa verde o roja y limón.', tag: 'MEXICANO', image: productImage, hasIngredients: true },
    { id: 'alambre', section: 'specialty', name: 'EL ALAMBRE', price: 165, description: 'Carne asada, tocino, poblano tatemado, cebolla, quesos fundidos y salsa de la casa.', tag: 'CASA', image: productImage, hasIngredients: true },
    { id: 'truchita', section: 'specialty', name: 'EL TRUCHITA', price: 170, description: 'Carne asada, chorizo, tocino, poblano tatemado, cebolla asada, quesos, salsa Truchita y limón.', tag: 'ESPECIALIDAD DE LA CASA', image: productImage, hasIngredients: true },
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
      && (item.section === 'traditional' || item.section === 'specialty')
      && isString(item.name)
      && Number.isFinite(item.price)
      && isString(item.description)
      && isString(item.image)
      && typeof item.hasIngredients === 'boolean';
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
