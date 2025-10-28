import React, { useState } from 'react'

export default function FilterPanel({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    category: 'Todas',
    maxPrice: 15000,
    veganOnly: false,
    glutenFree: false,
    sortBy: 'Relevancia'
  })

  const categories = [
    'Todas', 'Chocolates', 'Gomitas', 'Caramelos', 
    'Galletas', 'Confites', 'Colombianos', 'Bebidas'
  ]

  const sortOptions = [
    'Relevancia', 'Precio: Menor a Mayor', 'Precio: Mayor a Menor', 
    'Nombre A-Z', 'Nombre Z-A'
  ]

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  return (
    <div className="filter-panel">
      {/* Categorías */}
      <div className="filter-section">
        <h3 className="filter-title">Categorías</h3>
        <div className="category-tags">
          {categories.map(category => (
            <button
              key={category}
              className={`category-tag ${filters.category === category ? 'active' : ''}`}
              onClick={() => updateFilter('category', category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Precio máximo */}
      <div className="filter-section">
        <h3 className="filter-title">Precio máximo</h3>
        <div className="price-slider-container">
          <div className="price-slider">
            <input
              type="range"
              min="3800"
              max="15000"
              step="100"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', parseInt(e.target.value))}
              className="slider"
            />
          </div>
          <div className="price-labels">
            <span className="price-label">$ 3.800</span>
            <span className="price-label">$ {filters.maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Restricciones */}
      <div className="filter-section">
        <h3 className="filter-title">Restricciones</h3>
        <div className="restrictions">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.veganOnly}
              onChange={(e) => updateFilter('veganOnly', e.target.checked)}
              className="checkbox"
            />
            <span className="checkbox-text">Solo vegano</span>
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={filters.glutenFree}
              onChange={(e) => updateFilter('glutenFree', e.target.checked)}
              className="checkbox"
            />
            <span className="checkbox-text">Sin gluten</span>
          </label>
        </div>
      </div>

      {/* Ordenar por */}
      <div className="filter-section">
        <h3 className="filter-title">Ordenar por</h3>
        <div className="sort-dropdown">
          <select
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
