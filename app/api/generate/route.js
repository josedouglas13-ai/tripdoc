export async function POST(request) {
  try {
    console.log('API chamada')
    const body = await request.json()
    console.log('Body recebido, agencyName:', body.agencyName)
    
    const { pdfBase64, agencyName } = body

    if (!pdfBase64) {
      return Response.json({ error: 'PDF não recebido' }, { status: 400 })
    }

    console.log('Chamando Anthropic...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBase64
              }
            },
            {
              type: 'text',
              text: 'Analise o voucher e gere um guia de viagem completo em HTML para a agencia ' + agencyName + '. Retorne APENAS HTML puro.'
            }
          ]
        }]
      })
    })

    console.log('Anthropic status:', response.status)
    const data = await response.json()
    console.log('Anthropic resposta:', JSON.stringify(data).slice(0, 300))

    if (!data.content || data.content.length === 0) {
      return Response.json({ error: 'Sem conteudo', details: data }, { status: 500 })
    }

    const html = data.content[0].text
      .replace(/^```html\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()

    const shareToken = crypto.randomUUID()
    return Response.json({ html, shareToken })

  } catch (err) {
    console.error('ERRO:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
