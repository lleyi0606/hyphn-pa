import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { start, help, dashboard, deadlines, priority, whatToDo, manusAdd, manusCalendar, manusReply } from './commands';

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

const bot = new Telegraf(BOT_TOKEN);

// Register commands
bot.command('start', start());
bot.command('help', help());
bot.command('dashboard', dashboard());
bot.command('deadlines', deadlines());
bot.command('priority', priority());
bot.command('dowhat', whatToDo());
bot.command('manusadd', manusAdd());
bot.command('manuscalendar', manusCalendar());
bot.command('manusreply', manusReply());

// Handle photo messages with /manusadd or /manuscalendar caption
bot.on('photo', async (ctx) => {
  const caption = ctx.message.caption || '';
  if (caption.startsWith('/manusadd')) {
    // Call the same manusAdd handler
    return manusAdd()(ctx);
  }
  if (caption.startsWith('/manuscalendar')) {
    // Call the same manusCalendar handler
    return manusCalendar()(ctx);
  }
});

// Handle unknown commands - only respond to commands or in private chats
bot.on('text', (ctx) => {
  const text = ctx.message.text;
  const isPrivateChat = ctx.chat?.type === 'private';
  const isCommand = text.startsWith('/');
  
  // Only respond to commands or in private chats
  if (isCommand) {
    return ctx.reply(
      '❓ Unknown command. Use /help to see available commands.',
      { parse_mode: 'Markdown' }
    );
  }
  
  // In private chats, provide a helpful message
  if (isPrivateChat) {
    return ctx.reply(
      '👋 Hello! I\'m your Hyphn PA Bot. Use /help to see what I can do for you!',
      { parse_mode: 'Markdown' }
    );
  }
  
  // In groups, ignore non-command messages (don't reply)
});

// Production mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// Development mode
if (ENVIRONMENT !== 'production') {
  development(bot);
}
