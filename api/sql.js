// ciclodev · ponte com o banco.
// A chave fica no cofre da Vercel (variavel de ambiente) e nunca chega ao navegador.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'metodo' });

  const chave = process.env.SUPABASE_TOKEN;
  const projeto = process.env.SUPABASE_PROJETO;
  if (!chave || !projeto) return res.status(500).json({ erro: 'sem_chave' });

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = null; } }
  const consulta = corpo && corpo.query;
  if (typeof consulta !== 'string' || !consulta.trim()) return res.status(400).json({ erro: 'consulta_vazia' });

  let r;
  try {
    r = await fetch('https://api.supabase.com/v1/projects/' + projeto + '/database/query', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + chave, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: consulta })
    });
  } catch (e) {
    return res.status(502).json({ erro: 'banco_fora', detalhe: 'O banco nao respondeu.' });
  }

  const texto = await r.text();
  if (!r.ok) return res.status(502).json({ erro: 'banco', detalhe: texto.slice(0, 600) });

  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(texto);
}
