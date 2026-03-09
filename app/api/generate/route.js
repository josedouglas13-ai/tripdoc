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
              text: `Você é especialista em turismo. Analise o voucher e gere um guia de viagem completo em HTML.

AGÊNCIA: ${agencyName}

GERE UM HTML COMPLETO COM:
1. Hero com destino, datas e passageiros
2. Todos os voos com horários
3. Hotel com check-in/out e amenidades
4. Roteiro diário detalhado
5. 6 restaurantes recomendados com endereço e link do Google Maps
6. 6 passeios e atrações
7. Dicas práticas de segurança e saúde
8. Contatos de emergência
9. Checklist final com checkboxes clicáveis

ESTILO:
- Fundo escuro #0D1B2A
- I
