export async function POST(request) {
  try {
    const { pdfBase64, agencyName } = await request.json()

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 32000,
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
              text: `Você é especialista em turismo. Analise o voucher e gere um guia de viagem completo em HTML.

AGÊNCIA: ${agencyName}

GERE UM HTML COMPLETO COM:
1. Hero com destino, datas e passageiros
2. Todos os voos com horários
3. Hotel com check-in/out e amenidades
4. Roteiro diário detalhado
5. 6 restaurantes recomendados
6. 6 passeios e atrações
7. Dicas práticas de segurança e saúde
8. Contatos de emergência
9. Checklist final com checkboxes clicáveis

ESTILO:
- Fundo escuro #0D1B2A
- Importar Playfair Display e Josefin Sans do Google Fonts
- Cor dourada #C9A84C para destaques
- Todo texto de conteúdo deve ser BRANCO #FFFFFF ou no mínimo rgba(255,255,255,0.85) — NUNCA cinza escuro
- Cards com bordas arredondadas
- Badge com nome "${agencyName}" no topo e rodapé
- Responsivo para mobile
- Checkboxes funcionais com JavaScript assim:
  <input type="checkbox" onclick="this.parentElement.style.textDecoration=this.checked?'line-through':'none'" style="cursor:pointer;width:16px;height:16px;margin-right:8px;">

RESTAURANTES:
- Para cada restaurante inclua o endereço completo
- Crie um link clicável assim: <a href="https://www.google.com/maps/search/NOME+DO+RESTAURANTE+CIDADE" target="_blank" style="color:#C9A84C;">📍 Ver no Google Maps</a>
- Substitua espaços por + na URL do Maps

IMPORTANTE: Retorne APENAS o HTML puro, sem markdown, sem blocos de código, sem explicações.`
            }
          ]
        }]
      })
    })

    const data = await response.json()
    
    console.log('Anthropic response status:', response.status)
    console.log('Anthropic data:', JSON.stringify(data).slice(0, 200))

    if (!data.content || data.content.length === 0) {
      return Response.json({ error: 'Sem resposta da IA', details: data }, { status: 500 })
    }

    const html = data.content[0].text
      .replace(/^```html\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim()

    return Response.json({ html })

  } catch (err) {
    console.error('Erro na API:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
