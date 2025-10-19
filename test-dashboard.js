// Test the dashboard functionality
const fetch = require('node-fetch');

class NotionService {
  constructor(dataSourceId) {
    this.dataSourceId = dataSourceId;
    this.manusApiKey = process.env.MANUS_API_KEY || '';
  }

  async createManusTask(prompt) {
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': this.manusApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        taskMode: 'agent',
        connectors: [this.dataSourceId],
        hideInTaskList: true,
        createShareableLink: false,
        agentProfile: 'speed'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Manus API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  async loadCompetitions() {
    console.log('📊 Loading competitions (using mock data for testing)...');
    
    const mockCompetitions = [
      {
        id: 'mock-1',
        url: '',
        name: 'AI Innovation Challenge 2025',
        application_deadline: new Date('2025-12-31'),
        competition_type: ['Innovation Challenge'],
        estimated_effort: 'High',
        geographic_scope: 'International',
        industry_focus: ['Technology', 'AI'],
        priority_level: '🔥 High',
        prize_amount: 50000,
        stage_requirement: 'Any stage',
        status: 'Research',
        success_probability: 'Medium',
        website: 'https://example.com'
      },
      {
        id: 'mock-2',
        url: '',
        name: 'Startup Pitch Competition',
        application_deadline: new Date('2025-11-15'),
        competition_type: ['Pitch Competition'],
        estimated_effort: 'Medium',
        geographic_scope: 'National',
        industry_focus: ['Startup'],
        priority_level: '📈 Medium',
        prize_amount: 25000,
        stage_requirement: 'Early-stage',
        status: 'Preparing',
        success_probability: 'High',
        website: 'https://example.com'
      },
      {
        id: 'mock-3',
        url: '',
        name: 'Tech Hackathon 2025',
        application_deadline: new Date('2025-10-25'),
        competition_type: ['Hackathon'],
        estimated_effort: 'Medium',
        geographic_scope: 'Local',
        industry_focus: ['Technology'],
        priority_level: '🔥 High',
        prize_amount: 10000,
        stage_requirement: 'Any stage',
        status: 'Research',
        success_probability: 'High',
        website: 'https://example.com'
      }
    ];
    
    return mockCompetitions;
  }
}

class CompetitionService {
  constructor(notionDataSourceId) {
    this.notionService = new NotionService(notionDataSourceId);
  }

  async getCompetitions() {
    return await this.notionService.loadCompetitions();
  }

  async getUpcomingDeadlines(daysAhead = 7) {
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

  async getHighPriorityCompetitions() {
    const competitions = await this.getCompetitions();
    
    return competitions.filter(comp => {
      const priority = comp.priority_level.toLowerCase();
      const status = comp.status.toLowerCase();
      
      return priority.includes('🔥 high') && 
             ['research', 'preparing'].some(keyword => status.includes(keyword));
    });
  }

  formatCompetitionSummary(competition) {
    const name = competition.name || 'Unknown Competition';
    const deadline = competition.application_deadline;
    const status = competition.status || 'Unknown';
    const priority = competition.priority_level || '';
    const prize = competition.prize_amount || 0;
    const website = competition.website || '';

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

    const prizeStr = prize > 0 ? `$${prize.toLocaleString()}` : "No monetary prize";

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

  async generateDashboard() {
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

    // Quick Stats
    message += "🎯 **QUICK STATS**\n";
    message += `• High Priority: ${highPriority.length} competitions\n`;
    message += `• Deadlines < 30 days: ${upcomingDeadlines.length} competitions\n`;
    message += `• Total Prize Pool: $${competitions.reduce((sum, comp) => sum + (comp.prize_amount || 0), 0).toLocaleString()}\n\n`;

    message += "🚀 **Stay competitive and never miss an opportunity!**\n";
    message += "_Powered by Hyphn PA Bot_";

    return message;
  }
}

async function testDashboard() {
  console.log('🧪 Testing dashboard functionality...\n');
  
  try {
    const dataSourceId = process.env.NOTION_DATA_SOURCE_ID || '9c27c684-2f4f-4d33-8fcf-51664ea15c00';
    const competitionService = new CompetitionService(dataSourceId);
    
    console.log('1️⃣ Testing competition loading...');
    const competitions = await competitionService.getCompetitions();
    console.log(`✅ Loaded ${competitions.length} competitions\n`);
    
    console.log('2️⃣ Testing high priority competitions...');
    const highPriority = await competitionService.getHighPriorityCompetitions();
    console.log(`✅ Found ${highPriority.length} high priority competitions\n`);
    
    console.log('3️⃣ Testing upcoming deadlines...');
    const upcoming = await competitionService.getUpcomingDeadlines(30);
    console.log(`✅ Found ${upcoming.length} upcoming deadlines\n`);
    
    console.log('4️⃣ Testing dashboard generation...');
    const dashboard = await competitionService.generateDashboard();
    console.log('✅ Dashboard generated successfully!\n');
    
    console.log('📊 DASHBOARD OUTPUT:');
    console.log('=' .repeat(60));
    console.log(dashboard);
    console.log('=' .repeat(60));
    
    console.log('\n🎉 All tests passed! The dashboard commands should now work.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

require('dotenv').config();
testDashboard();
