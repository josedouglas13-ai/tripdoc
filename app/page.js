export default function Home() {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'sans-serif',
      background: '#0A0A0F',
      color: '#fff',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>
        Trip<span style={{ color: '#C9A84C' }}>Doc</span>
      </h1>
      <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.5)', marginBottom: '40px' }}>
        Plataforma de guias de viagem premium
      </p>
      <a href="/login" style={{
        background: '#C9A84C',
        color: '#0A0A0F',
        padding: '14px 32px',
        borderRadius: '100px',
        textDecoration: 'none',
        fontWeight: '700',
        fontSize: '15px'
      }}>
        Começar agora →
      </a>
    </main>
  )
}
