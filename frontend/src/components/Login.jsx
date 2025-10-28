import React, { useState } from 'react'
import { api } from '../api'

export default function Login({ onAuth }) {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [show, setShow] = useState(false)
  const [err, setErr] = useState('')

  const submit = async(e) => {
    e.preventDefault()
    setErr('')
    try {
      const data = await api('/auth/login', { method:'POST', body:{ email, password } })
      onAuth(data.access_token, data.user)
    } catch (e) {
      setErr('Credenciales inválidas')
    }
  }

  return (
    <div className="card" style={{maxWidth: 460, margin:'1rem auto'}}>
      <h3 className="card-title">Iniciar sesión</h3>
      {err && <div className="card" style={{background:'rgba(127,29,29,.25)', borderColor:'#7f1d1d'}}>{err}</div>}
      <form onSubmit={submit}>
        <div className="input-wrap">
          <span className="input-icon">📧</span>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        </div>
        <div className="input-wrap mt-1" style={{display:'grid', gridTemplateColumns:'1fr auto', gap:'.5rem'}}>
          <div style={{position:'relative'}}>
            <span className="input-icon">🔒</span>
            <input className="input" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" />
          </div>
          <button type="button" className="btn ghost" onClick={()=>setShow(s=>!s)}>{show?'Ocultar':'Ver'}</button>
        </div>
        <div className="mt-2">
          <button className="btn primary" type="submit">Entrar</button>
        </div>
      </form>
      <div className="mt-1" style={{color:'#94a3b8'}}>Tip: admin@example.com / admin123</div>
    </div>
  )
}
