'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [guide, setGuide] = useState('')
  const [guideLink, setGuideLink] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [step, setStep] = useState('upload')
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('novo')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else {
        setUser(data.user)
        loadHistory(data.user.id)
      }
    })
  }, [])

  async function loadHistory(userId) {
    const { data, error } = await supabase
      .from('guides')
      .select('*')
      .eq('agency_id', userId)
      .order('created_at', { ascending: false })
    if (data) setHistory(data)
  }

  async function generateGuide() {
    if (!file) return alert('Faça upload do voucher PDF!')
    if (!agencyName) return alert('Preencha o nome da agência!')
    setLoading(true)
    setStep('loading')

    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result.split(',')[1]
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, agencyName })
      })
      const data = await response.json()

      if (data.html) {
        setGuide(data.html)
        const token = data.shareToken
        const link = `${window.location.origin}/guia/${token}`
        setGuideLink(link)
        setStep('result')

        const { data: userData } = await supabase.auth.getUser()
        await supabase.from('guides').insert({
          agency_id: userData.user.id,
          destination: agencyName,
          client_name: file.name,
          html_content: data.html,
          share_token: token
        })
        loadHistory(userData.user.id)
      } else {
        alert('Erro ao gerar guia. Tente novamente.')
        setStep('upload')
      }
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  async function logout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function copyLink() {
    navigator.clipboard.writeText(guideLink)
    alert('✅ Link copiado! Cole no WhatsApp para compartilhar.')
  }

  function downloadGuide() {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${guide}</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guia-viagem.html'
    a.click()
  }

  function viewHistory(item) {
    setGuide(item.html_content)
    setAgencyName(item.destination)
    const link = `${window.location.origin}/guia/${item.share_token}`
    setGuideLink(link)
    setStep('result')
    setActiveTab('novo')
  }

  if (!user) return <div style={{ background: '#0A0A0F', minHeight: '100vh' }} />

  return (
    <main style={{ minHeight: '100vh', background: '#F0EDE8', fontFamily: 'sans-serif' }}>

      {/* TOPBAR */}
      <div style={{ background: '#0A0A0F', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>
          Trip<span style={{ color: '#C9A84C' }}>Doc</span>
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{user?.email}</span>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>Sair</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', padding: '0 32px', display: 'flex', gap: '4px' }}>
        {['novo', 'historico'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '14px 20px', border: 'none', background: 'none', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer',
            borderBottom: activeTab === tab ? '2px solid #C9A84C' : '2px solid transparent',
            color: activeTab === tab ? '#0A0A0F' : '#6B6B7A'
          }}>
            {tab === 'novo' ? '⚡ Novo Guia' : `📋 Histórico (${history.length})`}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ABA NOVO GUIA */}
        {activeTab === 'novo' && (
          <>
            {step === 'upload' && (
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Novo Guia</h2>
                <p style={{ color: '#6B6B7A', marginBottom: '32px' }}>Faça upload do voucher e gere um guia premium</p>

                <div style={{ background: '#fff', borderRadius: '20px', padding: '32px', marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: '#6B6B7A', display: 'block', marginBottom: '8px' }}>Nome da Agência</label>
                  <input type="text" placeholder="Ex: Sol & Mar Viagens" value={agencyName}
                    onChange={e => setAgencyName(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e0e0e0', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div onClick={() => document.getElementById('file-input').click()} style={{
                  background: '#fff', borderRadius: '20px', padding: '48px 32px', textAlign: 'center',
                  cursor: 'pointer', marginBottom: '16px',
                  border: file ? '2px solid #C9A84C' : '2px dashed #e0e0e0'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {file ? `✅ ${file.name}` : 'Clique para fazer upload do voucher PDF'}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B6B7A' }}>
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Suporta PDF de hotéis, voos e pacotes'}
                  </div>
                  <input id="file-input" type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => setFile(e.target.files[0])} />
                </div>

                <button onClick={generateGuide} style={{
                  width: '100%', padding: '18px', background: '#0A0A0F', color: '#fff',
                  border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: '700', cursor: 'pointer'
                }}>⚡ Gerar Guia Premium</button>
              </div>
            )}

            {step === 'loading' && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '24px' }}>⚡</div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Gerando seu guia...</h2>
                <p style={{ color: '#6B6B7A' }}>Nossa IA está analisando o voucher. Aguarde alguns segundos.</p>
              </div>
            )}

            {step === 'result' && (
              <div>
                <div style={{
                  background: '#fff', borderRadius: '16px', padding: '16px 24px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div>
                    <span style={{ background: 'rgba(26,107,107,0.1)', color: '#1A6B6B', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>✓ Guia gerado!</span>
                    <span style={{ fontWeight: '700', marginLeft: '12px' }}>{agencyName}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={() => { setStep('upload'); setFile(null) }} style={{
                      padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', background: '#fff', border: '1.5px solid #e0e0e0'
                    }}>+ Novo guia</button>
                    <button onClick={copyLink} style={{
                      padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', background: '#25D366', color: '#fff', border: 'none'
                    }}>🔗 Copiar Link</button>
                    <button onClick={downloadGuide} style={{
                      padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', background: '#0A0A0F', color: '#fff', border: 'none'
                    }}>📥 Download</button>
                  </div>
                </div>

                {guideLink && (
                  <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e0e0e0' }}>
                    <span style={{ fontSize: '13px', color: '#6B6B7A', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guideLink}</span>
                    <button onClick={copyLink} style={{ background: '#C9A84C', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}>Copiar</button>
                  </div>
                )}

                <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden' }}
                  dangerouslySetInnerHTML={{ __html: guide }}
                />
              </div>
            )}
          </>
        )}

        {/* ABA HISTÓRICO */}
        {activeTab === 'historico' && (
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Histórico</h2>
            <p style={{ color: '#6B6B7A', marginBottom: '32px' }}>Seus guias gerados anteriormente</p>

            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Nenhum guia gerado ainda</div>
                <div style={{ fontSize: '14px', color: '#6B6B7A', marginTop: '8px' }}>Gere seu primeiro guia na aba "Novo Guia"</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {history.map((item) => (
                  <div key={item.id} onClick={() => viewHistory(item)} style={{
                    background: '#fff', borderRadius: '16px', padding: '20px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    border: '1px solid #e0e0e0', cursor: 'pointer'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>{item.destination}</div>
                      <div style={{ fontSize: '12px', color: '#6B6B7A' }}>
                        {item.client_name} · {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span style={{ color: '#C9A84C', fontWeight: '600', fontSize: '13px' }}>Ver guia →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
