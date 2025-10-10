import { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf } from 'telegraf';

export const production = async (req: VercelRequest, res: VercelResponse, bot: Telegraf) => {
  try {
    if (req.method === 'POST') {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } else {
      res.status(200).json({ 
        message: 'Hyphn PA Bot is running!',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in production handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
