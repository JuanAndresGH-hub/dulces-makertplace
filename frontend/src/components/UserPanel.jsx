import React, { useEffect, useState, useMemo } from 'react'
import { api } from '../api'
import ProductCard from './ProductCard'

export default function UserPanel({ token }) {
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [err, setErr] = useState('')

  const load = async()=>{
    try {
      const [p, o] = await Promise.all([ api('/products'), api('/orders/my', { token }) ])
      setProducts(p); setOrders(o)
    } catch (e) { setErr('No se pudo cargar tus datos') }
  }
  useEffect(()=>{ load() },[])

  const add = (p)=>{
    const i = cart.findIndex(x=>x.product_id===p.id)
    if (i>=0) {
      const copy=[...cart]; copy[i].quantity+=1; setCart(copy)
    } else setCart([...cart, { product_id:p.id, quantity:1, name:p.name, price: Number(p.price) }])
  }

  const total = useMemo(()=> cart.reduce((s,i)=>s + i.price*i.quantity, 0), [cart])

  const createOrder = async()=>{
    try {
      await api('/orders', { method:'POST', body:{ items: cart.map(c=>({product_id:c.product_id, quantity:c.quantity})) }, token })
      setCart([]); load()
    } catch(e){ setErr('No se pudo crear la orden') }
  }

  return (
    <>
      <div className="grid">
        <div className="col-span-12 col-span-6">
          <div className="card">
            <h3 className="card-title">Carrito</h3>
            {cart.length===0 ? <div className="empty">Vacío</div> :
              <>
                {cart.map(c=>(<div key={c.product_id} className="row">
                  <div>{c.name} <span className="badge">x{c.quantity}</span></div>
                  <div className="row" style={{gap:'.3rem'}}>
                    <button className="btn ghost" onClick={()=>setCart(cs=>cs.map(x=>x.product_id===c.product_id?{...x, quantity:Math.max(1,x.quantity-1)}:x))}>-</button>
                    <button className="btn ghost" onClick={()=>setCart(cs=>cs.map(x=>x.product_id===c.product_id?{...x, quantity:x.quantity+1}:x))}>+</button>
                    <button className="btn warn" onClick={()=>setCart(cs=>cs.filter(x=>x.product_id!==c.product_id))}>Quitar</button>
                  </div>
                </div>))}
                <div className="hr"></div>
                <div className="row">
                  <strong>Total</strong><strong>${total.toFixed(2)}</strong>
                </div>
                <div className="mt-1"><button disabled={!cart.length} className="btn primary" onClick={createOrder}>Crear Orden</button></div>
              </>
            }
          </div>
        </div>

        <div className="col-span-12 col-span-6">
          <div className="card">
            <h3 className="card-title">Mis Órdenes</h3>
            {orders.length===0 ? <div className="empty">Aún no tienes órdenes</div> :
              orders.map(o=>(
                <div key={o.id} className="card" style={{marginTop:'.6rem'}}>
                  <div className="row">
                    <div>Orden #{o.id}</div>
                    <div className="badge">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <ul>
                    {o.items.map(i=>(
                      <li key={`${o.id}-${i.product_id}`}>{i.product_name} x {i.quantity} — ${Number(i.unit_price).toFixed(2)}</li>
                    ))}
                  </ul>
                </div>
              ))
            }
          </div>
        </div>

        {err && <div className="col-span-12"><div className="card" style={{background:'rgba(127,29,29,.25)', borderColor:'#7f1d1d'}}>{err}</div></div>}
      </div>

      <div className="card mt-2">
        <h3 className="card-title">Productos</h3>
        <div className="grid mt-1">
          {products.map(p => (
            <div key={p.id} className="col-span-12 col-span-3">
              <ProductCard p={p} onAdd={add} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
