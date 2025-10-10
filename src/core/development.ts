import { Telegraf } from 'telegraf';

export const development = (bot: Telegraf) => {
  console.log('🚀 Starting Hyphn PA Bot in development mode...');
  
  bot.launch({
    dropPendingUpdates: true
  });

  // Enable graceful stop
  process.once('SIGINT', () => {
    console.log('🛑 Stopping bot...');
    bot.stop('SIGINT');
  });
  
  process.once('SIGTERM', () => {
    console.log('🛑 Stopping bot...');
    bot.stop('SIGTERM');
  });

  console.log('✅ Hyphn PA Bot is running in development mode!');
};
