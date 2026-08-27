'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { defaultMenu, ExtraOption, MenuData, MenuSection, Product } from '@/lib/menu';

const usernameDefault = 'truchita-admin';

function copyMenu(menu: MenuData): MenuData {
  return JSON.parse(JSON.stringify(menu)) as MenuData;
}

function headerFor(username: string, password: string) {
  return { Authorization: `Basic ${btoa(`${username}:${password}`)}` };
}

export default function AdminTruchita() {
  const [username, setUsername] = useState(usernameDefault);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [draft, setDraft] = useState<MenuData>(() => copyMenu(defaultMenu));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const traditional = useMemo(() => draft.products.filter((product) => product.section === 'traditional'), [draft.products]);
  const specialties = useMemo(() => draft.products.filter((product) => product.section === 'specialty'), [draft.products]);
  const elotes = useMemo(() => draft.products.filter((product) => product.section === 'elotes'), [draft.products]);
  const bags = useMemo(() => draft.products.filter((product) => product.section === 'bolsa'), [draft.products]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('Revisando acceso…');
    const response = await fetch('/api/admin/menu', { headers: headerFor(username, password), cache: 'no-store' });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok || !payload || typeof payload !== 'object' || !('products' in payload)) {
      setMessage(payload && typeof payload === 'object' && 'message' in payload ? String(payload.message) : 'No fue posible abrir el panel.');
      return;
    }
    setDraft(copyMenu(payload as MenuData));
    setAuthenticated(true);
    setMessage('');
  };

  const updateProduct = (id: string, changes: Partial<Product>) => {
    setDraft((current) => ({ ...current, products: current.products.map((product) => product.id === id ? { ...product, ...changes } : product) }));
  };

  const updateExtra = (id: string, changes: Partial<ExtraOption>) => {
    setDraft((current) => ({ ...current, extras: current.extras.map((extra) => extra.id === id ? { ...extra, ...changes } : extra) }));
  };

  const addProduct = (section: MenuSection) => {
    const id = `nuevo-${Date.now()}`;
    const defaults: Record<MenuSection, Pick<Product, 'name' | 'description' | 'image' | 'hasIngredients' | 'service'>> = {
      traditional: { name: 'NUEVO ESQUITE', description: 'Describe aquí lo que lleva.', image: '/esquite-callejero.png', hasIngredients: false, service: 'cup' },
      specialty: { name: 'NUEVO ESPECIAL', description: 'Describe aquí lo que lleva.', image: '/esquite-callejero.png', hasIngredients: true, service: 'cup' },
      elotes: { name: 'NUEVO ELOTE', description: 'Elote entero preparado al carbón.', image: '/hero-corn.png', hasIngredients: false, service: 'corn' },
      bolsa: { name: 'NUEVO ESQUITE EN BOLSA', description: 'Botana abierta y preparada con granos de elote.', image: '/botanas-en-bolsa.png', hasIngredients: true, service: 'bag' },
    };
    setDraft((current) => ({ ...current, products: [...current.products, { id, section, price: 0, ...defaults[section] }] }));
  };

  const addExtra = () => {
    const id = `extra-${Date.now()}`;
    setDraft((current) => ({ ...current, extras: [...current.extras, { id, name: 'NUEVO EXTRA', price: 0, description: 'Describe este extra.', imagePosition: 'elote' }] }));
  };

  const uploadImage = async (productId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage('Subiendo imagen…');
    const formData = new FormData();
    formData.set('file', file);
    const response = await fetch('/api/admin/upload', { method: 'POST', headers: headerFor(username, password), body: formData });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok || !payload || typeof payload !== 'object' || !('url' in payload)) {
      setMessage(payload && typeof payload === 'object' && 'message' in payload ? String(payload.message) : 'No se pudo subir la imagen.');
      return;
    }
    updateProduct(productId, { image: String(payload.url) });
    setMessage('Imagen lista. Pulsa “Guardar cambios” para publicar el menú.');
    event.target.value = '';
  };

  const save = async () => {
    setSaving(true);
    setMessage('Guardando el menú…');
    const response = await fetch('/api/admin/menu', {
      method: 'PUT',
      headers: { ...headerFor(username, password), 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    setSaving(false);
    setMessage(response.ok ? 'Listo: el menú público ya fue actualizado.' : payload && typeof payload === 'object' && 'message' in payload ? String(payload.message) : 'No se pudieron guardar los cambios.');
  };

  if (!authenticated) {
    return <main className="admin-shell"><div className="admin-wrap admin-login"><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><div className="admin-card"><p className="modal-kicker">ACCESO PRIVADO</p><h2>ADMINISTRACIÓN</h2><p className="checkout-note">Este panel no aparece en la página pública.</p><form className="admin-form-grid" onSubmit={login}><label className="admin-field"><span>USUARIO</span><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} /></label><label className="admin-field"><span>CONTRASEÑA</span><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>{message && <p className="admin-message">{message}</p>}<button className="admin-button" type="submit">ENTRAR AL PANEL →</button></form></div></div></main>;
  }

  return <main className="admin-shell"><div className="admin-wrap"><header className="admin-brand"><div className="mini-logo"><span>ESQUITES</span><strong>EL TRUCHITA</strong></div><p>PANEL PRIVADO · MENÚ Y PRODUCTOS</p></header><div className="admin-intro"><div><p className="modal-kicker">TODO LO QUE VE TU CLIENTE</p><h1>CONTROL<br />DE LA BRASA.</h1></div><p>Edita nombres, precios, ingredientes e imágenes. Nada de esto se muestra como enlace en la página pública.</p></div><div className="admin-toolbar"><p>{message || 'Haz tus cambios y publícalos cuando estés lista.'}</p><div><a className="admin-button ghost" href="/" target="_blank" rel="noreferrer">VER SITIO ↗</a>{' '}<button className="admin-button" type="button" onClick={save} disabled={saving}>{saving ? 'GUARDANDO…' : 'GUARDAR CAMBIOS'}</button></div></div>
    <AdminProductSection title="LOS TRADICIONALES" products={traditional} section="traditional" onAdd={addProduct} onRemove={(id) => setDraft((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }))} onUpdate={updateProduct} onUpload={uploadImage} />
    <AdminProductSection title="ESPECIALES DE LA CASA" products={specialties} section="specialty" onAdd={addProduct} onRemove={(id) => setDraft((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }))} onUpdate={updateProduct} onUpload={uploadImage} />
    <AdminProductSection title="ELOTES AL CARBÓN" products={elotes} section="elotes" onAdd={addProduct} onRemove={(id) => setDraft((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }))} onUpdate={updateProduct} onUpload={uploadImage} />
    <AdminProductSection title="ESQUITES EN BOLSA" products={bags} section="bolsa" onAdd={addProduct} onRemove={(id) => setDraft((current) => ({ ...current, products: current.products.filter((product) => product.id !== id) }))} onUpdate={updateProduct} onUpload={uploadImage} />
    <section className="admin-section"><div className="admin-section-head"><div><span>PERSONALIZACIÓN</span><h2>EXTRAS</h2></div><button className="admin-button alt" type="button" onClick={addExtra}>+ AGREGAR EXTRA</button></div><div className="admin-extras">{draft.extras.map((extra) => <article className="admin-extra" key={extra.id}><label className="admin-field"><span>NOMBRE</span><input value={extra.name} onChange={(event) => updateExtra(extra.id, { name: event.target.value })} /></label><label className="admin-field"><span>PRECIO</span><input min="0" type="number" value={extra.price} onChange={(event) => updateExtra(extra.id, { price: Number(event.target.value) || 0 })} /></label><label className="admin-field"><span>DETALLE</span><textarea value={extra.description} onChange={(event) => updateExtra(extra.id, { description: event.target.value })} /></label><label className="admin-checkbox"><input type="checkbox" checked={Boolean(extra.onlyWithIngredients)} onChange={(event) => updateExtra(extra.id, { onlyWithIngredients: event.target.checked })} />SOLO PARA VASOS CON INGREDIENTES</label><button className="admin-button ghost" type="button" onClick={() => setDraft((current) => ({ ...current, extras: current.extras.filter((item) => item.id !== extra.id) }))}>ELIMINAR</button></article>)}</div></section>
  </div></main>;
}

function AdminProductSection({ title, products, section, onAdd, onRemove, onUpdate, onUpload }: { title: string; products: Product[]; section: MenuSection; onAdd: (section: MenuSection) => void; onRemove: (id: string) => void; onUpdate: (id: string, changes: Partial<Product>) => void; onUpload: (id: string, event: ChangeEvent<HTMLInputElement>) => void }) {
  return <section className="admin-section"><div className="admin-section-head"><div><span>MENÚ</span><h2>{title}</h2></div><button className="admin-button alt" type="button" onClick={() => onAdd(section)}>+ AGREGAR PRODUCTO</button></div><div className="admin-products">{products.map((product) => <article className="admin-product" key={product.id}><div className="admin-product-top"><h3>{product.name || 'SIN NOMBRE'}</h3><button className="admin-button ghost" type="button" onClick={() => onRemove(product.id)}>ELIMINAR</button></div><div className="admin-product-grid"><label className="admin-field"><span>NOMBRE</span><input value={product.name} onChange={(event) => onUpdate(product.id, { name: event.target.value })} /></label><label className="admin-field"><span>PRECIO</span><input min="0" type="number" value={product.price} onChange={(event) => onUpdate(product.id, { price: Number(event.target.value) || 0 })} /></label><label className="admin-field wide"><span>DETALLE / INGREDIENTES</span><textarea value={product.description} onChange={(event) => onUpdate(product.id, { description: event.target.value })} /></label><label className="admin-field"><span>ETIQUETA (OPCIONAL)</span><input value={product.tag ?? ''} onChange={(event) => onUpdate(product.id, { tag: event.target.value || undefined })} /></label><label className="admin-field"><span>FORMATO</span><select value={product.service ?? 'cup'} onChange={(event) => onUpdate(product.id, { service: event.target.value as Product['service'] })}><option value="cup">Vaso de esquites</option><option value="corn">Elote entero</option><option value="bag">Esquite en bolsa</option></select></label><label className="admin-checkbox"><input type="checkbox" checked={product.hasIngredients} onChange={(event) => onUpdate(product.id, { hasIngredients: event.target.checked })} />LLEVA INGREDIENTES</label><label className="admin-field wide"><span>URL DE IMAGEN</span><div className="admin-image-row"><input value={product.image} onChange={(event) => onUpdate(product.id, { image: event.target.value })} /><label className="admin-image-upload" aria-label={`Subir imagen para ${product.name}`}><input accept="image/*" type="file" onChange={(event) => onUpload(product.id, event)} /></label></div></label><figure className="admin-image-preview wide"><img src={product.image || '/esquite-callejero.png'} alt="Vista previa del producto" /></figure></div></article>)}</div></section>;
}
