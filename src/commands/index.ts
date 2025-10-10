import { Context } from 'telegraf';
import { CompetitionService } from '../services/competition';

const NOTION_DATA_SOURCE_ID = process.env.NOTION_DATA_SOURCE_ID || '';

export const start = () => (ctx: Context) => {
  const welcomeMessage = `
🏆 **Welcome to Hyphn PA Bot!**

Your personal assistant for competition tracking and opportunities.

**Available Commands:**
/dashboard - View complete competition dashboard
/deadlines - Check upcoming deadlines
/priority - Show high-priority competitions
/help - Show this help message

I'll help you stay on top of all your competition opportunities! 🚀
  `;
  
  return ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
};

export const help = () => (ctx: Context) => {
  const helpMessage = `
🤖 **Hyphn PA Bot Commands**

/start - Welcome message and overview
/dashboard - Complete competition dashboard
/deadlines - Upcoming deadlines (next 7 days)
/priority - High-priority competitions
/help - Show this help message

**What I do:**
• Track competition deadlines from your Notion database
• Send alerts for urgent deadlines
• Highlight high-priority opportunities
• Provide comprehensive competition dashboards

**Need help?** Contact your administrator.
  `;
  
  return ctx.reply(helpMessage, { parse_mode: 'Markdown' });
};

export const dashboard = () => async (ctx: Context) => {
  try {
    await ctx.reply('📊 Generating competition dashboard...', { parse_mode: 'Markdown' });
    
    const competitionService = new CompetitionService(NOTION_DATA_SOURCE_ID);
    const dashboardMessage = await competitionService.generateDashboard();
    
    return ctx.reply(dashboardMessage, { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  } catch (error) {
    console.error('Error generating dashboard:', error);
    return ctx.reply('❌ Sorry, I encountered an error generating the dashboard. Please try again later.');
  }
};

export const deadlines = () => async (ctx: Context) => {
  try {
    await ctx.reply('⏰ Checking upcoming deadlines...', { parse_mode: 'Markdown' });
    
    const competitionService = new CompetitionService(NOTION_DATA_SOURCE_ID);
    const upcomingCompetitions = await competitionService.getUpcomingDeadlines(7);
    
    if (upcomingCompetitions.length === 0) {
      return ctx.reply('✅ No urgent deadlines in the next 7 days. You\'re all caught up!');
    }
    
    let message = `⏰ **UPCOMING DEADLINES (${upcomingCompetitions.length} competitions)**\n\n`;
    
    for (const comp of upcomingCompetitions.slice(0, 5)) {
      message += competitionService.formatCompetitionSummary(comp) + '\n';
    }
    
    if (upcomingCompetitions.length > 5) {
      message += `\n... and ${upcomingCompetitions.length - 5} more competitions`;
    }
    
    return ctx.reply(message, { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  } catch (error) {
    console.error('Error checking deadlines:', error);
    return ctx.reply('❌ Sorry, I encountered an error checking deadlines. Please try again later.');
  }
};

export const priority = () => async (ctx: Context) => {
  try {
    await ctx.reply('🔥 Checking high-priority competitions...', { parse_mode: 'Markdown' });
    
    const competitionService = new CompetitionService(NOTION_DATA_SOURCE_ID);
    const highPriorityCompetitions = await competitionService.getHighPriorityCompetitions();
    
    if (highPriorityCompetitions.length === 0) {
      return ctx.reply('📋 No high-priority competitions requiring immediate attention.');
    }
    
    let message = `🔥 **HIGH PRIORITY COMPETITIONS (${highPriorityCompetitions.length} competitions)**\n\n`;
    
    for (const comp of highPriorityCompetitions.slice(0, 5)) {
      message += competitionService.formatCompetitionSummary(comp) + '\n';
    }
    
    if (highPriorityCompetitions.length > 5) {
      message += `\n... and ${highPriorityCompetitions.length - 5} more competitions`;
    }
    
    return ctx.reply(message, { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  } catch (error) {
    console.error('Error checking priority competitions:', error);
    return ctx.reply('❌ Sorry, I encountered an error checking priority competitions. Please try again later.');
  }
};
