import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function AdminPanel({ token }) {
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [counts, setCounts] = useState({ users: 0, products: 0 })

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: ''
  })

  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true); setErr('')
    try {
      // 🔐 Obtiene todo el panel en una sola llamada
      const ov = await api('/admin/overview', { token })
      setProducts(ov?.products ?? [])
      setUsers(ov?.latestUsers ?? ov?.users ?? [])
      setCounts(ov?.counts ?? { users: 0, products: 0 })
    } catch (e) {
      let msg = 'No se pudo cargar panel admin'
      if (e?.status === 401) msg = 'Sesión expirada. Inicia sesión de nuevo.'
      if (e?.status === 403) msg = 'Acceso denegado: requiere rol ADMIN.'
      setErr(msg + (e?.body ? ` · Detalle: ${e.body}` : ''))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createProduct = async () => {
    setErr('')
    // Validaciones rápidas
    if (!form.name.trim()) return setErr('El nombre es obligatorio')
    const price = Number(form.price) || 0
    const stock = Number.isFinite(Number(form.stock)) ? parseInt(form.stock) : 0

    try {
      await api('/products', {
        method: 'POST',
        token,
        body: { ...form, price, stock }
      })
      setForm({ name: '', description: '', price: 0, stock: 0, image_url: '' })
      await load()
    } catch (e) {
      setErr('Error creando producto' + (e?.body ? ` · ${e.body}` : ''))
    }
  }

  const del = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await api(`/products/${id}`, { method: 'DELETE', token })
      await load()
    } catch (e) {
      setErr('No se pudo eliminar' + (e?.body ? ` · ${e.body}` : ''))
    }
  }

  return (
    <div className="grid">
      <div className="col-span-12 col-span-6">
        <div className="card">
          <h3 className="card-title">Crear producto</h3>
          <div className="grid">
            <div className="col-span-12 col-span-6">
              <input
                className="input"
                placeholder="Nombre"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="col-span-12">
              <input
                className="input"
                placeholder="Descripción"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="col-span-12 col-span-6">
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="Precio"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="col-span-12 col-span-6">
              <input
                className="input"
                type="number"
                placeholder="Stock"
                value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
              />
            </div>
            <div className="col-span-12">
              <input
                className="input"
                placeholder="Imagen URL (opcional)"
                value={form.image_url}
                onChange={e => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
          </div>
          <div className="mt-2">
            <button className="btn primary" onClick={createProduct}>Guardar</button>
          </div>
        </div>
      </div>

      <div className="col-span-12 col-span-6">
        <div className="card">
          <h3 className="card-title">Usuarios</h3>
          <div style={{ marginBottom: '.5rem', opacity: .8 }}>
            Total usuarios: <b>{counts.users}</b>
          </div>
          {users.length === 0
            ? <div className="empty">No hay usuarios aún</div>
            : <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                {users.map(u => (
                  <li key={u.id}>
                    {u.email || u.username} — <span className="badge">{u.role || 'USER'}</span>
                  </li>
                ))}
              </ul>}
        </div>
      </div>

      <div className="col-span-12">
        <div className="card">
          <h3 className="card-title">Productos</h3>
          <div style={{ marginBottom: '.5rem', opacity: .8 }}>
            Total productos: <b>{counts.products}</b>
          </div>

          {loading
            ? <div className="skel"/>
            : products.length === 0
              ? <div className="empty">Sin productos</div>
              : <div className="grid">
                  {products.map(p => (
                    <div key={p.id} className="col-span-12 col-span-3">
                      <div className="card product">
                        <div className="title">{p.name}</div>
                        <div className="row">
                          <span className="price">
                            ${Number(p.price ?? 0).toFixed(2)}
                          </span>
                          <span className="stock">Stock {p.stock ?? 0}</span>
                        </div>
                        <div className="mt-1">
                          <button className="btn ghost" onClick={() => del(p.id)}>Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>}
        </div>
      </div>

      {err && (
        <div className="col-span-12">
          <div className="card" style={{ background: 'rgba(127,29,29,.25)', borderColor: '#7f1d1d' }}>
            {err}
          </div>
        </div>
      )}
    </div>
  )
}
