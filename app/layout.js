import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'TripDoc — Guias de Viagem Premium',
  description: 'Transforme vouchers em guias de viagem incríveis',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: '#F7F4EE' }}>
        {children}
      </body>
    </html>
  )
}
