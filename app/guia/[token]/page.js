import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function GuiaPublico({ params }) {
  const { data } = await supabase
    .from('guides')
    .select('*')
    .eq('share_token', params.token)
    .single()

  if (!data) return (
    <div style={{ textAlign: 'center', padding: '80px', fontFamily: 'sans-serif' }}>
      <h2>Guia não encontrado</h2>
    </div>
  )

  return (
    <div dangerouslySetInnerHTML={{ __html: data.html_content }} />
  )
}
