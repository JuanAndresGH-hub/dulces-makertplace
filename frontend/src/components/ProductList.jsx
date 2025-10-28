 import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import ProductCard from './ProductCard'
import FilterPanel from './FilterPanel'

export default function ProductList({ token, user }) {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [filters, setFilters] = useState({
    category: 'Todas',
    maxPrice: 15000,
    veganOnly: false,
    glutenFree: false,
    sortBy: 'Relevancia'
  })

  const fetchProducts = async (query='', filterParams={}) => {
    setLoading(true); setErr('')
    try {
      let url = '/products'
      const params = new URLSearchParams()
      
      if (query) params.append('q', query)
      if (filterParams.category && filterParams.category !== 'Todas') params.append('category', filterParams.category)
      if (filterParams.maxPrice) params.append('max_price', filterParams.maxPrice)
      if (filterParams.veganOnly) params.append('vegan_only', 'true')
      if (filterParams.glutenFree) params.append('gluten_free', 'true')
      if (filterParams.sortBy) params.append('sort_by', filterParams.sortBy)
      
      if (params.toString()) url += `?${params.toString()}`
      
      const data = await api(url)
      setProducts(data)
    } catch (e) { setErr('No se pudo cargar el catálogo') }
    finally { setLoading(false) }
  }

  // Debounce de búsqueda
  useEffect(() => {
    const t = setTimeout(() => fetchProducts(q.trim(), filters), 280)
    return () => clearTimeout(t)
  }, [q, filters])

  useEffect(() => { fetchProducts('', filters) }, [])

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
    fetchProducts(q.trim(), newFilters)
  }

  return (
    <>
      <FilterPanel onFiltersChange={handleFiltersChange} />
      
      <div className="card">
        <div style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'.6rem'}}>
          <div className="input-wrap">
            <span className="input-icon">🔎</span>
            <input className="input" placeholder="Buscar producto..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
          <button className="btn ghost" onClick={()=>fetchProducts(q.trim(), filters)}>Buscar</button>
        </div>
      </div>

      {err && <div className="card" style={{borderColor:'#7f1d1d', background:'rgba(127,29,29,.2)'}}>{err}</div>}

      {loading ? (
        <div className="grid mt-2">
          <div className="col-span-12 col-span-4"><div className="card"><div className="skel"/></div></div>
          <div className="col-span-12 col-span-4"><div className="card"><div className="skel"/></div></div>
          <div className="col-span-12 col-span-4"><div className="card"><div className="skel"/></div></div>
        </div>
      ) : products.length === 0 ? (
        <div className="empty mt-2">No se encontraron productos.</div>
      ) : (
        <div className="grid mt-2">
          {products.map(p => (
            <div key={p.id} className="col-span-12 col-span-4">
              <ProductCard p={p} onAdd={user ? ()=>{} : null} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}
