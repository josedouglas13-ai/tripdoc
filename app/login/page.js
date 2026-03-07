'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignup, setIsSignup] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setMessage('')

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage('Erro: ' + error.message)
      else setMessage('✅ Verifique seu email para confirmar o cadastro!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage('Erro: ' + error.message)
      else window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  return (
    <main style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0A0A0F', fontFamily: 'sans-serif'
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px',
        padding: '48px 40px', width: '100%', maxWidth: '420px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
          Trip<span style={{ color: '#C9A84C' }}>Doc</span>
        </h1>
        <p style={{ color: '#6B6B7A', marginBottom: '32px', fontSize: '14px' }}>
          {isSignup ? 'Crie sua conta grátis' : 'Entre na sua conta'}
        </p>

        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '10px',
            border: '1px solid #e0e0e0', fontSize: '14px',
            marginBottom: '12px', outline: 'none', boxSizing: 'border-box'
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: '10px',
            border: '1px solid #e0e0e0', fontSize: '14px',
            marginBottom: '20px', outline: 'none', boxSizing: 'border-box'
          }}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', background: '#0A0A0F',
            color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          {loading ? 'Aguarde...' : isSignup ? 'Criar conta' : 'Entrar'}
        </button>

        {message && (
          <p style={{ fontSize: '13px', color: message.includes('Erro') ? 'red' : 'green', marginBottom: '16px' }}>
            {message}
          </p>
        )}

        <p style={{ fontSize: '13px', color: '#6B6B7A' }}>
          {isSignup ? 'Já tem conta? ' : 'Não tem conta? '}
          <span
            onClick={() => setIsSignup(!isSignup)}
            style={{ color: '#C9A84C', cursor: 'pointer', fontWeight: '600' }}
          >
            {isSignup ? 'Entrar' : 'Cadastrar grátis'}
          </span>
        </p>
      </div>
    </main>
  )
}
