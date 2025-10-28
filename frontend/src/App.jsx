// frontend/src/App.jsx
import React, { useState } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import ProductList from './components/ProductList'
import AdminPanel from './components/AdminPanel'
import UserPanel from './components/UserPanel'
import Footer from './components/Footer'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(() =>
    token ? JSON.parse(localStorage.getItem('user') || 'null') : null
  )
  const [tab, setTab] = useState('home')
  const [selectedCategory, setSelectedCategory] = useState('Todas')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken('')
    setUser(null)
    setTab('home')
  }

  const goFooter = () => {
    const el = document.getElementById('sobre-nosotros')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const categories = [
    'Todas', 'Chocolates', 'Gomitas', 'Caramelos', 'Galletas', 'Confites', 'Colombianos', 'Bebidas'
  ]

  return (
    // ⬇️ Contenedor de página que empuja el footer al fondo (ver CSS .page)
    <div className="page">
      {/* 🧭 NAVBAR SUPERIOR */}
      <div className="navbar">
        <div className="container nav">
          <div className="brand">
            <div className="logo">🍬</div>
            <span>Candy Marketplace</span>
          </div>

          <button
            className={`btn ghost ${tab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
          >
            Productos
          </button>

          {user?.role === 'ADMIN' && (
            <button
              className={`btn ghost ${tab === 'admin' ? 'active' : ''}`}
              onClick={() => setTab('admin')}
            >
              Panel Admin
            </button>
          )}

          {user && (
            <button
              className={`btn ghost ${tab === 'user' ? 'active' : ''}`}
              onClick={() => setTab('user')}
            >
              Mis Órdenes
            </button>
          )}

          <button className="btn ghost" onClick={goFooter}>
            Sobre nosotros
          </button>

          <div className="spacer" />

          {!user && (
            <>
              <button className="btn primary" onClick={() => setTab('login')}>
                Login
              </button>
              <button className="btn ghost" onClick={() => setTab('register')}>
                Registro
              </button>
            </>
          )}

          {user && <span className="badge">{user.email} · {user.role}</span>}

          {user && (
            <button className="btn warn" onClick={logout}>
              Salir
            </button>
          )}
        </div>
      </div>

      {/* 💡 CONTENIDO PRINCIPAL */}
      <div className="main-layout">
        {/* 🧁 PANEL LATERAL */}
        {tab === 'home' && (
          <aside className="sidebar">
            <section className="filter-section">
              <h3>Categorías</h3>
              <div className="categories">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={selectedCategory === cat ? 'active' : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            <section className="filter-section">
              <h3>Precio máximo</h3>
              <input type="range" min="1000" max="15000" defaultValue="3800" />
              <div className="price-labels">
                <span>$ 3.800</span>
                <span>$ 15.000</span>
              </div>
            </section>

            <section className="filter-section">
              <h3>Restricciones</h3>
              <label><input type="checkbox" /> Solo vegano</label><br />
              <label><input type="checkbox" /> Sin gluten</label>
            </section>

            <section className="filter-section">
              <h3>Ordenar por</h3>
              <select>
                <option>Relevancia</option>
                <option>Precio: menor a mayor</option>
                <option>Precio: mayor a menor</option>
              </select>
            </section>
          </aside>
        )}

        {/* 🛍️ CONTENIDO CENTRAL */}
        <div className="content">
          {tab === 'home' && (
            <ProductList
              token={token}
              user={user}
              selectedCategory={selectedCategory}
            />
          )}

          {tab === 'login' && (
            <Login
              onAuth={(t, u) => {
                setToken(t)
                setUser(u)
                localStorage.setItem('token', t)
                localStorage.setItem('user', JSON.stringify(u))
                setTab('home')
              }}
            />
          )}

          {tab === 'register' && <Register onDone={() => setTab('login')} />}

          {tab === 'admin' && user?.role === 'ADMIN' && (
            <AdminPanel token={token} />
          )}

          {tab === 'user' && user && <UserPanel token={token} />}
        </div>
      </div>

      {/* 🔖 Ancla para scroll "Sobre nosotros" (evita que el navbar tape el inicio) */}
      <div id="sobre-nosotros" />

      {/* 📌 FOOTER */}
      <Footer />
    </div>
  )
}
