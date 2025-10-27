import { VercelRequest, VercelResponse } from '@vercel/node';
import { Telegraf } from 'telegraf';
import { CompetitionService } from '../src/services/competition';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID || '291a59e7-892d-8096-b67e-000b4078788e';
const TARGET_CHAT_ID = '-1002353301958'; // Mushroom 🍄 group
const TARGET_THREAD_ID = 24839; // Fake PA topic

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
    
    // Send initial message to the specific topic
    await bot.telegram.sendMessage(
      TARGET_CHAT_ID, 
      '🤔 Analyzing your competitions and generating smart recommendations...',
      { 
        parse_mode: 'Markdown',
        message_thread_id: TARGET_THREAD_ID
      }
    );
    
    // Generate the recommendations using the same logic as the /dowhat command
    const competitionService = new CompetitionService(NOTION_DATA_SOURCE_ID);
    const recommendations = await competitionService.generateWhatToDoRecommendations();
    
    // Send the recommendations to the specific topic
    await bot.telegram.sendMessage(
      TARGET_CHAT_ID,
      recommendations,
      { 
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
        message_thread_id: TARGET_THREAD_ID
      }
    );
    
    console.log(`Successfully sent daily recommendations to chat ${TARGET_CHAT_ID}, thread ${TARGET_THREAD_ID} at ${new Date().toISOString()}`);
    
    return res.status(200).json({ 
      success: true, 
      message: 'Daily recommendations sent successfully',
      chatId: TARGET_CHAT_ID,
      threadId: TARGET_THREAD_ID,
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

