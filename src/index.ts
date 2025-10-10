import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { start, help, dashboard, deadlines, priority, whatToDo } from './commands';

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

// Handle unknown commands
bot.on('text', (ctx) => {
  const text = ctx.message.text;
  
  if (text.startsWith('/')) {
    return ctx.reply(
      '❓ Unknown command. Use /help to see available commands.',
      { parse_mode: 'Markdown' }
    );
  }
  
  // Handle general messages
  return ctx.reply(
    '👋 Hello! I\'m your Hyphn PA Bot. Use /help to see what I can do for you!',
    { parse_mode: 'Markdown' }
  );
});

// Production mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// Development mode
if (ENVIRONMENT !== 'production') {
  development(bot);
}
