import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = '8531840601:AAHFJJUMmrleH2KPsJ7HEiPd5KegaB03MmA';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const d = await r.json();
    return res.status(200).json({ status: d.ok ? 'online' : 'offline', bot: d.result });
  } catch (e) {
    return res.status(200).json({ status: 'offline' });
  }
}