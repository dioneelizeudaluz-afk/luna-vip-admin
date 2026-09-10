import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = '8531840601:AAHFJJUMmrleH2KPsJ7HEiPd5KegaB03MmA';
const SUPABASE_URL = 'https://jvbbpfxxqmachbkhozxc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2YmJwZnh4cW1hY2hia2hvenhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwNTExNjksImV4cCI6MjEwNDYyNzE2OX0.ebegar8LAEheAbx3SxB20c5ErXus4U_eKlXEPbi9UzY';

const sendMessage = async (chatId: number, text: string, markup?: any) => {
  const body: any = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (markup) body.reply_markup = markup;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
};

const sendPhoto = async (chatId: number, photo: string, caption: string, markup?: any) => {
  const body: any = { chat_id: chatId, photo, caption, parse_mode: 'HTML' };
  if (markup) body.reply_markup = markup;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
};

const saveUser = async (userId: number, firstName: string, username: string) => {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/bot_users`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' },
      body: JSON.stringify({ telegram_id: userId, first_name: firstName, username, last_activity: new Date().toISOString() }),
    });
    await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ telegram_id: userId, name: firstName, username, status: 'novo' }),
    });
  } catch (e) {}
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, callback_query } = req.body;

    let flow: any = null;
    try {
      const flowRes = await fetch(`${SUPABASE_URL}/rest/v1/bot_settings?id=eq.1&select=flow_data`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
      });
      const flowData = await flowRes.json();
      if (flowData?.[0]?.flow_data) flow = JSON.parse(flowData[0].flow_data);
    } catch (e) {}

    if (callback_query) {
      const chatId = callback_query.message.chat.id;
      const data = callback_query.data;

      if (data === 'ver_planos' && flow?.plans?.length) {
        const active = flow.plans.filter((p: any) => p.active);
        if (active.length === 0) { await sendMessage(chatId, 'Nenhum plano disponível.'); return res.status(200).json({ ok: true }); }
        const kb = active.map((p: any) => [{ text: `${p.name} - R$ ${p.price.toFixed(2)}`, callback_data: `plano_${p.id}` }]);
        await sendMessage(chatId, 'Escolhe o teu plano:', { inline_keyboard: kb });
      } else if (data === 'suporte') {
        await sendMessage(chatId, flow?.supportMessage || 'Suporte Luna VIP.');
      } else if (data.startsWith('plano_')) {
        const id = parseInt(data.replace('plano_', ''));
        const plan = flow?.plans?.find((p: any) => p.id === id);
        if (plan) {
          await sendMessage(chatId, `💎 <b>${plan.name}</b>\n💰 R$ ${plan.price.toFixed(2)}\n\nClica para pagar:`, { inline_keyboard: [[{ text: '💳 PAGAR AGORA', url: plan.link }]] });
        }
      }
      return res.status(200).json({ ok: true });
    }

    if (!message?.text) return res.status(200).json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text;
    const userId = message.from?.id;
    const firstName = message.from?.first_name || '';
    const username = message.from?.username || '';

    if (userId) saveUser(userId, firstName, username);

    if (text === '/start') {
      const msg = flow?.startMessage || 'Bem-vindo à Luna VIP! 🌙';
      const kb = {
        inline_keyboard: [
          [{ text: '💎 VER PLANOS', callback_data: 'ver_planos' }],
          [{ text: '💬 SUPORTE', callback_data: 'suporte' }],
        ],
      };
      if (flow?.startImage) await sendPhoto(chatId, flow.startImage, msg, kb);
      else await sendMessage(chatId, msg, kb);
    } else if (text === '/planos' || text === '/vip') {
      if (flow?.plans?.length) {
        const active = flow.plans.filter((p: any) => p.active);
        const kb = active.map((p: any) => [{ text: `${p.name} - R$ ${p.price.toFixed(2)}`, callback_data: `plano_${p.id}` }]);
        await sendMessage(chatId, 'Escolhe o teu plano:', { inline_keyboard: kb });
      }
    } else if (text === '/suporte') {
      await sendMessage(chatId, flow?.supportMessage || 'Suporte Luna VIP.');
    } else {
      await sendMessage(chatId, 'Comando não reconhecido. Usa /start');
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(200).json({ ok: true });
  }
}