import { Competition } from '../types/competition';
import { NotionService } from './notion';

export class CompetitionService {
  private notionService: NotionService;

  constructor(notionDatabaseId: string) {
    this.notionService = new NotionService(notionDatabaseId);
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

  private formatPrize(amount: number | undefined): string {
    if (!amount || amount === 0) return "No prize";
    return `$${amount.toLocaleString()}`;
  }

  async generateWhatToDoRecommendations(): Promise<string> {
    const competitions = await this.getCompetitions();
    const today = new Date();
    
    // Categorize competitions for analysis
    const urgentDeadlines = competitions.filter(comp => {
      if (!comp.application_deadline) return false;
      const deadline = new Date(comp.application_deadline);
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const status = comp.status.toLowerCase();
      return daysUntil <= 3 && daysUntil >= 0 && 
             ['research', 'preparing'].some(keyword => status.includes(keyword));
    });

    const thisWeekDeadlines = competitions.filter(comp => {
      if (!comp.application_deadline) return false;
      const deadline = new Date(comp.application_deadline);
      const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const status = comp.status.toLowerCase();
      return daysUntil <= 7 && daysUntil > 3 && 
             ['research', 'preparing'].some(keyword => status.includes(keyword));
    });

    const highPriorityResearch = competitions.filter(comp => {
      const priority = comp.priority_level.toLowerCase();
      const status = comp.status.toLowerCase();
      return priority.includes('🔥 high') && status.includes('research');
    });

    const readyToApply = competitions.filter(comp => {
      const status = comp.status.toLowerCase();
      return status.includes('preparing');
    });

    const highValueOpportunities = competitions.filter(comp => {
      const status = comp.status.toLowerCase();
      return comp.prize_amount >= 50000 && 
             ['research', 'preparing'].some(keyword => status.includes(keyword));
    });

    // Generate smart recommendations
    let message = "🎯 **WHAT TO DO NEXT** 🎯\n\n";
    message += `📊 Analyzed ${competitions.length} competitions in your pipeline\n\n`;

    // Priority 1: Urgent deadlines
    if (urgentDeadlines.length > 0) {
      message += "🚨 **URGENT - DO TODAY/TOMORROW**\n";
      urgentDeadlines.sort((a, b) => {
        const deadlineA = new Date(a.application_deadline!);
        const deadlineB = new Date(b.application_deadline!);
        return deadlineA.getTime() - deadlineB.getTime();
      });

      for (const comp of urgentDeadlines.slice(0, 3)) {
        const deadline = new Date(comp.application_deadline!);
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const urgencyText = daysUntil === 0 ? "DUE TODAY!" : 
                           daysUntil === 1 ? "DUE TOMORROW!" : 
                           `${daysUntil} days left`;
        
        message += `🔥 **${comp.name}**\n`;
        message += `   ⏰ ${urgencyText} | 💰 ${this.formatPrize(comp.prize_amount)}\n`;
        message += `   📋 Status: ${comp.status}\n\n`;
      }
    }

    // Priority 2: This week deadlines
    if (thisWeekDeadlines.length > 0) {
      message += "⏰ **THIS WEEK'S FOCUS**\n";
      thisWeekDeadlines.sort((a, b) => {
        const deadlineA = new Date(a.application_deadline!);
        const deadlineB = new Date(b.application_deadline!);
        return deadlineA.getTime() - deadlineB.getTime();
      });

      for (const comp of thisWeekDeadlines.slice(0, 3)) {
        const deadline = new Date(comp.application_deadline!);
        const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        message += `📅 **${comp.name}** - ${daysUntil} days left\n`;
        message += `   💰 ${this.formatPrize(comp.prize_amount)} | 📊 ${comp.status}\n\n`;
      }
    }

    // Priority 3: High-priority research opportunities
    if (highPriorityResearch.length > 0) {
      message += "🔍 **HIGH-PRIORITY RESEARCH**\n";
      message += `${highPriorityResearch.length} high-priority competitions need investigation:\n\n`;
      
      for (const comp of highPriorityResearch.slice(0, 3)) {
        message += `🎯 **${comp.name}**\n`;
        message += `   💰 ${this.formatPrize(comp.prize_amount)}`;
        
        if (comp.application_deadline) {
          const deadline = new Date(comp.application_deadline);
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          message += ` | ⏰ ${daysUntil} days until deadline`;
        }
        message += `\n\n`;
      }
    }

    // Priority 4: Ready to apply
    if (readyToApply.length > 0) {
      message += "✅ **READY TO APPLY**\n";
      message += `${readyToApply.length} competitions are in "Preparing" status:\n\n`;
      
      for (const comp of readyToApply.slice(0, 3)) {
        message += `📝 **${comp.name}**\n`;
        message += `   💰 ${this.formatPrize(comp.prize_amount)}`;
        
        if (comp.application_deadline) {
          const deadline = new Date(comp.application_deadline);
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          message += ` | ⏰ ${daysUntil} days until deadline`;
        }
        message += `\n\n`;
      }
    }

    // Priority 5: High-value opportunities
    if (highValueOpportunities.length > 0) {
      message += "💎 **HIGH-VALUE OPPORTUNITIES**\n";
      message += `${highValueOpportunities.length} competitions with prizes ≥ $50,000:\n\n`;
      
      for (const comp of highValueOpportunities.slice(0, 3)) {
        message += `💰 **${comp.name}** - ${this.formatPrize(comp.prize_amount)}\n`;
        message += `   📊 ${comp.status}`;
        
        if (comp.application_deadline) {
          const deadline = new Date(comp.application_deadline);
          const daysUntil = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          message += ` | ⏰ ${daysUntil} days until deadline`;
        }
        message += `\n\n`;
      }
    }

    // Summary and recommendations
    message += "📝 **RECOMMENDED ACTIONS**\n";
    
    if (urgentDeadlines.length > 0) {
      message += `1. 🚨 **IMMEDIATE**: Complete ${urgentDeadlines.length} urgent application(s)\n`;
    }
    
    if (thisWeekDeadlines.length > 0) {
      message += `2. ⏰ **THIS WEEK**: Prepare ${thisWeekDeadlines.length} upcoming submission(s)\n`;
    }
    
    if (highPriorityResearch.length > 0) {
      message += `3. 🔍 **RESEARCH**: Investigate ${highPriorityResearch.length} high-priority opportunity(ies)\n`;
    }
    
    if (readyToApply.length > 0) {
      message += `4. ✅ **FINALIZE**: Submit ${readyToApply.length} prepared application(s)\n`;
    }

    if (urgentDeadlines.length === 0 && thisWeekDeadlines.length === 0 && 
        highPriorityResearch.length === 0 && readyToApply.length === 0) {
      message += "✨ **Great job!** No urgent actions required at the moment.\n";
      message += "Consider exploring new competition opportunities or refining existing applications.\n";
    }

    message += "\n💡 **Pro tip**: Focus on high-priority and high-value competitions first to maximize your ROI!\n";
    message += "\n_Powered by Hyphn PA Bot_";

    return message;
  }
}

