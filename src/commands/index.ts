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
/dowhat - Get smart recommendations on what to focus on next
/manusadd - Add competition info to Notion using Manus AI
/manusreply - Reply to active Manus task
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
/dowhat - Get smart recommendations on what to focus on next
/manusadd - Add competition info to Notion using Manus AI
/manusreply - Reply to active Manus task
/help - Show this help message

**What I do:**
• Track competition deadlines from your Notion database
• Send alerts for urgent deadlines
• Highlight high-priority opportunities
• Provide comprehensive competition dashboards
• Extract competition details using Manus AI
• Automatically add competitions to your Notion database

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


export const whatToDo = () => async (ctx: Context) => {
  try {
    await ctx.reply('🤔 Analyzing your competitions and generating smart recommendations...', { parse_mode: 'Markdown' });
    
    const competitionService = new CompetitionService(NOTION_DATA_SOURCE_ID);
    const recommendations = await competitionService.generateWhatToDoRecommendations();
    
    return ctx.reply(recommendations, { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });
  } catch (error) {
    console.error('Error generating what-to-do recommendations:', error);
    return ctx.reply('❌ Sorry, I encountered an error generating recommendations. Please try again later.');
  }
};

export const manusAdd = () => async (ctx: Context) => {
  try {
    const message = ctx.message;
    if (!message || !('text' in message)) {
      return ctx.reply('❌ Please provide competition information after the command.\n\nExample: `/manusadd https://example.com/competition` or `/manusadd Competition details here...`');
    }

    const text = message.text;
    const commandMatch = text.match(/^\/manusadd\s+(.+)$/s);
    
    if (!commandMatch || !commandMatch[1].trim()) {
      return ctx.reply('❌ Please provide competition information after the command.\n\nExample: `/manusadd https://example.com/competition` or `/manusadd Competition details here...`');
    }

    const competitionInfo = commandMatch[1].trim();
    
    await ctx.reply('🤖 **Processing competition information with Manus AI...**\n\nI\'m extracting details and adding them to your Notion database. This may take a moment...', { parse_mode: 'Markdown' });

    const manusApiKey = process.env.MANUS_API_KEY;
    if (!manusApiKey) {
      return ctx.reply('❌ Manus API key not configured. Please contact your administrator.');
    }

    const { ManusService } = await import('../services/manus');
    const { sessionStorage } = await import('../services/session');
    
    const manusService = new ManusService(manusApiKey);
    const taskResponse = await manusService.createCompetitionExtractionTask(competitionInfo);

    // Store the session for potential replies
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    
    if (chatId && userId) {
      sessionStorage.setSession(chatId, {
        taskId: taskResponse.task_id,
        taskUrl: taskResponse.task_url,
        userId,
        createdAt: new Date()
      });
    }

    let responseMessage = `✅ **Competition extraction task created successfully!**\n\n`;
    responseMessage += `🆔 **Task ID**: \`${taskResponse.task_id}\`\n`;
    responseMessage += `📋 **Task**: ${taskResponse.task_title}\n`;
    responseMessage += `🔗 **Monitor Progress**: [View Task](${taskResponse.task_url})\n\n`;
    responseMessage += `⏳ **Status**: Processing... Manus AI is extracting competition details and adding them to your Notion database.\n\n`;
    responseMessage += `💬 **Need to add more info?** Use \`/manusreply your additional message\` to continue the conversation with this task.`;

    return ctx.reply(responseMessage, { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });

  } catch (error) {
    console.error('Error in manusAdd command:', error);
    return ctx.reply('❌ Sorry, I encountered an error while processing your request. Please try again later or contact support.');
  }
};

export const manusReply = () => async (ctx: Context) => {
  try {
    const message = ctx.message;
    if (!message || !('text' in message)) {
      return ctx.reply('❌ Please provide a message to send to your active Manus task.\n\nExample: `/manusreply Please also add the eligibility criteria`');
    }

    const text = message.text;
    const commandMatch = text.match(/^\/manusreply\s+(.+)$/s);
    
    if (!commandMatch || !commandMatch[1].trim()) {
      return ctx.reply('❌ Please provide a message to send to your active Manus task.\n\nExample: `/manusreply Please also add the eligibility criteria`');
    }

    const replyMessage = commandMatch[1].trim();
    const chatId = ctx.chat?.id;

    if (!chatId) {
      return ctx.reply('❌ Unable to identify chat context.');
    }

    const { sessionStorage } = await import('../services/session');
    const session = sessionStorage.getSession(chatId);

    if (!session) {
      return ctx.reply('❌ **No active Manus task found for this chat.**\n\nPlease use `/manusadd` first to create a new competition extraction task.');
    }

    // For now, we'll just provide the task URL since the Manus API doesn't have a direct reply endpoint
    // In the future, this could be enhanced with webhook integration
    
    let responseMessage = `💬 **Message for your active Manus task:**\n\n`;
    responseMessage += `📝 **Your message**: "${replyMessage}"\n\n`;
    responseMessage += `🔗 **Continue conversation**: [Open Task](${session.taskUrl})\n\n`;
    responseMessage += `ℹ️ **Note**: Please click the link above to continue the conversation directly with Manus AI. The task will be updated with your additional requirements.`;

    return ctx.reply(responseMessage, { 
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true }
    });

  } catch (error) {
    console.error('Error in manusReply command:', error);
    return ctx.reply('❌ Sorry, I encountered an error while processing your reply. Please try again later.');
  }
};
