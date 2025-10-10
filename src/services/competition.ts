import { Competition } from '../types/competition';
import { NotionService } from './notion';

export class CompetitionService {
  private notionService: NotionService;

  constructor(notionDataSourceId: string) {
    this.notionService = new NotionService(notionDataSourceId);
  }

  async getCompetitions(): Promise<Competition[]> {
    return await this.notionService.loadCompetitions();
  }

  async getUpcomingDeadlines(daysAhead: number = 7): Promise<Competition[]> {
    const competitions = await this.getCompetitions();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    return competitions.filter(comp => {
      if (!comp.application_deadline) return false;
      
      const deadline = new Date(comp.application_deadline);
      const status = comp.status.toLowerCase();
      
      return deadline <= cutoffDate && 
             ['research', 'preparing', 'not applicable'].some(keyword => status.includes(keyword));
    });
  }

  async getHighPriorityCompetitions(): Promise<Competition[]> {
    const competitions = await this.getCompetitions();
    
    return competitions.filter(comp => {
      const priority = comp.priority_level.toLowerCase();
      const status = comp.status.toLowerCase();
      
      return priority.includes('🔥 high') && 
             ['research', 'preparing'].some(keyword => status.includes(keyword));
    });
  }

  formatCompetitionSummary(competition: Competition): string {
    const name = competition.name || 'Unknown Competition';
    const deadline = competition.application_deadline;
    const status = competition.status || 'Unknown';
    const priority = competition.priority_level || '';
    const prize = competition.prize_amount || 0;
    const website = competition.website || '';

    // Format deadline
    let deadlineStr = "No deadline set";
    if (deadline) {
      const deadlineDate = new Date(deadline);
      deadlineStr = deadlineDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      const today = new Date();
      const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil < 0) {
        deadlineStr += ` (OVERDUE by ${Math.abs(daysUntil)} days)`;
      } else if (daysUntil === 0) {
        deadlineStr += " (DUE TODAY!)";
      } else if (daysUntil <= 7) {
        deadlineStr += ` (${daysUntil} days left)`;
      }
    }

    // Format prize
    const prizeStr = prize > 0 ? `$${prize.toLocaleString()}` : "No monetary prize";

    // Build message
    let message = `**${name}**\n`;
    message += `📅 Deadline: ${deadlineStr}\n`;
    message += `📊 Status: ${status}\n`;
    message += `🎯 Priority: ${priority}\n`;
    message += `💰 Prize: ${prizeStr}\n`;

    if (website) {
      message += `🔗 [Apply Here](${website})\n`;
    }

    return message;
  }

  async generateDashboard(): Promise<string> {
    const competitions = await this.getCompetitions();
    const highPriority = await this.getHighPriorityCompetitions();
    const upcomingDeadlines = await this.getUpcomingDeadlines(30);

    let message = "🏆 **HYPHN COMPETITIONS DASHBOARD** 🏆\n\n";
    message += `📊 **Total Competitions**: ${competitions.length}\n`;
    message += `📅 **Last Updated**: ${new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}\n\n`;

    // High Priority Section
    if (highPriority.length > 0) {
      message += `🔥 **HIGH PRIORITY (${highPriority.length} competitions)**\n`;
      for (const comp of highPriority.slice(0, 3)) {
        const name = comp.name || 'Unknown';
        const deadline = comp.application_deadline;
        const prize = comp.prize_amount || 0;
        const status = comp.status || '';

        let deadlineStr = "No deadline";
        if (deadline) {
          const deadlineDate = new Date(deadline);
          const today = new Date();
          const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysLeft < 0) {
            deadlineStr = `OVERDUE by ${Math.abs(daysLeft)} days`;
          } else if (daysLeft === 0) {
            deadlineStr = "DUE TODAY!";
          } else {
            deadlineStr = `${daysLeft} days left`;
          }
        }

        const prizeStr = prize > 0 ? `$${prize.toLocaleString()}` : "No monetary prize";

        message += `• **${name}**\n`;
        message += `  ⏰ ${deadlineStr} | 💰 ${prizeStr} | 📊 ${status}\n\n`;
      }
    }

    // Upcoming Deadlines Section
    if (upcomingDeadlines.length > 0) {
      message += `⏰ **UPCOMING DEADLINES (${upcomingDeadlines.length} competitions)**\n`;
      
      // Sort by deadline
      const sortedDeadlines = upcomingDeadlines.sort((a, b) => {
        if (!a.application_deadline) return 1;
        if (!b.application_deadline) return -1;
        return new Date(a.application_deadline).getTime() - new Date(b.application_deadline).getTime();
      });

      for (const comp of sortedDeadlines.slice(0, 4)) {
        const name = comp.name || 'Unknown';
        const deadline = comp.application_deadline;
        const prize = comp.prize_amount || 0;

        let deadlineStr = "No deadline";
        if (deadline) {
          const deadlineDate = new Date(deadline);
          const today = new Date();
          const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          deadlineStr = deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (daysLeft <= 7) {
            deadlineStr += ` (${daysLeft} days!)`;
          }
        }

        const prizeStr = prize > 0 ? `$${prize.toLocaleString()}` : "No prize";

        message += `• **${name}** - ${deadlineStr} - ${prizeStr}\n`;
      }
      message += "\n";
    }

    // Status Summary
    message += "📈 **STATUS BREAKDOWN**\n";
    const statusCounts: { [key: string]: number } = {};
    let totalPrizeMoney = 0;

    for (const comp of competitions) {
      const status = comp.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
      if (comp.prize_amount) {
        totalPrizeMoney += comp.prize_amount;
      }
    }

    for (const [status, count] of Object.entries(statusCounts).sort()) {
      message += `• ${status}: ${count}\n`;
    }

    message += `\n💰 **Total Prize Pool**: $${totalPrizeMoney.toLocaleString()}\n\n`;

    // Quick Stats
    const inProgress = competitions.filter(comp => 
      ['preparing', 'applied', 'under review'].some(keyword => 
        comp.status.toLowerCase().includes(keyword)
      )
    );
    
    const researchPhase = competitions.filter(comp => 
      comp.status.toLowerCase().includes('research')
    );

    message += "🎯 **QUICK STATS**\n";
    message += `• High Priority: ${highPriority.length} competitions\n`;
    message += `• Deadlines < 30 days: ${upcomingDeadlines.length} competitions\n`;
    message += `• In Progress: ${inProgress.length} competitions\n`;
    message += `• Research Phase: ${researchPhase.length} competitions\n\n`;

    message += "🚀 **Stay competitive and never miss an opportunity!**\n";
    message += "_Powered by Hyphn PA Bot_";

    return message;
  }
}
