import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = '8531840601:AAHFJJUMmrleH2KPsJ7HEiPd5KegaB03MmA';
const VIP_GROUP_ID = '-1004463213854';
const SUPABASE_URL = 'https://jvbbpfxxqmachbkhozxc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YmJwZnh4cW1hY2hia2hvenhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTExNjksImV4cCI6MjEwNDYyNzE2OX0.ebegar8LAEheAbx3SxB20c5ErXus4U_eKlXEPbi9UzY';

const createInvite = async () => {
  const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createChatInviteLink`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: VIP_GROUP_ID, member_limit: 1, expire_date: Math.floor(Date.now() / 1000) + 86400 }),
  });
  const d = await r.json();
  return d.ok ? d.result.invite_link : null;
};

const sendMsg = async (chatId: number, text: string, markup?: any) => {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (markup) body.reply_markup = markup;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { event, data } = req.body;
    console.log('EscalePay:', event, data);

    if (event === 'payment.received' || event === 'payment.confirmed') {
      const { customer_name, product, amount, customer_telegram_id } = data || {};

      try {
        await fetch(`${SUPABASE_URL}/rest/v1/sales`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_name: customer_name || 'Cliente', product: product || 'VIP', amount: Number(amount) || 0, status: 'confirmada' }),
        });
      } catch (e) {}

      if (customer_telegram_id) {
        const invite = await createInvite();
        if (invite) {
          await sendMsg(Number(customer_telegram_id), '✅ Pagamento confirmado!\n\nEntra no grupo VIP:', { inline_keyboard: [[{ text: '🚀 ENTRAR NO GRUPO', url: invite }]] });
        } else {
          await sendMsg(Number(customer_telegram_id), '✅ Pagamento confirmado! Entraremos em contacto com o link do grupo.');
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Erro' });
  }
}