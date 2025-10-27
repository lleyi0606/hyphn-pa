import { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const TARGET_CHAT_ID = '-1002353301958'; // Mushroom 🍄 group

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify this is a cron job request from Vercel
  const userAgent = req.headers['user-agent'];
  if (!userAgent || !userAgent.includes('vercel-cron')) {
    return res.status(401).json({ error: 'Unauthorized - Not a Vercel cron job' });
  }

  if (!BOT_TOKEN) {
    return res.status(500).json({ error: 'BOT_TOKEN not configured' });
  }

  try {
    const bot = new Telegraf(BOT_TOKEN);
    
    // Send the /dowhat command to the group
    await bot.telegram.sendMessage(TARGET_CHAT_ID, '/dowhat');
    
    console.log(`Successfully sent /dowhat to chat ${TARGET_CHAT_ID} at ${new Date().toISOString()}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Daily /dowhat message sent successfully',
      chatId: TARGET_CHAT_ID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending cron message:', error);
    return res.status(500).json({ 
      error: 'Failed to send message', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

