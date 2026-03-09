export async function POST(request) {
  try {
    const { pdfBase64, agencyName } = await request.json()

    const prompt = "Você é especialista em turismo. Analise o voucher e gere um guia de viagem completo em HTML.\n\nAGÊNCIA: " + agencyName + "\n\nGERE UM HTML COMPLETO COM:\n1. Hero com destino, datas e passageiros\n2. Todos os voos com horários\n3. Hotel com check-in/out e amenidades\n4. Roteiro diário detalhado\n5. 6 restaurantes recomendados com endereço e link do Google Maps\n6. 6 passeios e atrações\n7. Dicas práticas de segurança e saúde\n8. Contatos de emergência\n9. Checklist final com checkboxes clicáveis\n\nESTILO:\n- Fundo escuro #0D1B2A\n- Importar Playfair Display e Josefin Sans do Google Fonts\n- Cor dourada #C9A84C para destaques\n- Todo texto de conteúdo deve ser BRANCO #FFFFFF\n- Cards com bordas arredondadas\n- Badge com nome " + agencyName + " no topo e rodapé\n- Responsivo para mobile\n\nRESTAURANTES: Para cada restaurante inclua endereco e link clicavel para Google Maps.\n\nCHECKBOXES: Use input type checkbox com label clicavel.\n\nIMPORTANTE: Retorne APENAS o HTML puro, sem markdown, sem blocos de codigo."

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
              text: prompt
            }
          ]
        }]
      })
    })

    const data = await response.json()

    if (!data.content || data.content.length === 0) {
      return Response.json({ error: 'Sem resposta da IA', details: data }, { status: 500 })
    }

    const html = data.content[0].text
      .replace(/^```html\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()

    const shareToken = crypto.randomUUID()

    return Response.json({ html, shareToken })

  } catch (err) {
    console.error('Erro na API:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
