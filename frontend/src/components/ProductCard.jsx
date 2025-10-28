import React from 'react'

export default function ProductCard({ p, onAdd }) {
  return (
    <div className="card product">
      <div className="title">{p.name}</div>
      <div className="desc">{p.description || 'Sin descripción'}</div>
      <div className="row">
        <span className="price">${Number(p.price).toFixed(2)}</span>
        <span className="stock">Stock: {p.stock}</span>
      </div>
      {onAdd && (
        <div className="mt-1">
          <button className="btn primary" onClick={()=>onAdd(p)}>Agregar</button>
        </div>
      )}
    </div>
  )
}
