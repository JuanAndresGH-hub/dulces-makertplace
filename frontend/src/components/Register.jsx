import React, { useState } from 'react'
import { api } from '../api'

export default function Register({ onDone }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const submit = async(e) => {
    e.preventDefault()
    setErr(''); setMsg('')
    try {
      await api('/auth/register', { method:'POST', body:{ email, password } })
      setMsg('Registro exitoso. Ahora inicia sesión.')
      onDone && onDone()
    } catch (e) { setErr('No se pudo registrar. ¿Ya existe el correo?') }
  }

  return (
    <div className="card" style={{maxWidth: 460, margin:'1rem auto'}}>
      <h3 className="card-title">Crear cuenta</h3>
      {msg && <div className="card" style={{background:'rgba(22,101,52,.25)', borderColor:'#166534'}}>{msg}</div>}
      {err && <div className="card" style={{background:'rgba(127,29,29,.25)', borderColor:'#7f1d1d'}}>{err}</div>}
      <form onSubmit={submit}>
        <div className="input-wrap">
          <span className="input-icon">📧</span>
          <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
        </div>
        <div className="input-wrap mt-1">
          <span className="input-icon">🔒</span>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Contraseña (≥ 6)" />
        </div>
        <div className="mt-2">
          <button className="btn primary" type="submit">Registrarme</button>
        </div>
      </form>
    </div>
  )
}
