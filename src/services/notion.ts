import fetch from 'node-fetch';
import { Competition } from '../types/competition';

export class NotionService {
  private dataSourceId: string;
  private manusApiKey: string;
  private baseUrl = 'https://api.manus.ai/v1';

  constructor(dataSourceId: string) {
    this.dataSourceId = dataSourceId;
    this.manusApiKey = process.env.MANUS_API_KEY || '';
    
    if (!this.manusApiKey) {
      throw new Error('MANUS_API_KEY environment variable is required');
    }
  }

  private async createManusTask(prompt: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
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

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating Manus task:', error);
      throw error;
    }
  }

  async loadCompetitions(): Promise<Competition[]> {
    try {
      console.log('📊 Loading competitions from Notion database...');
      
      // Create a simple task to get competition count and basic info
      const prompt = `Please access my Hyphn Competitions database in Notion and provide a summary of all competitions.

For each competition, provide:
1. Competition Name
2. Application Deadline (if any)
3. Status
4. Priority Level
5. Prize Amount (if any)

Please provide the information in a clear, structured format. If there are many competitions, provide at least the first 10-15 entries with their key details.

Focus on competitions that are in "Research", "Preparing", or active status.`;

      const taskResponse = await this.createManusTask(prompt);
      console.log(`📋 Created Manus task for competition data: ${taskResponse.task_id}`);
      console.log(`🔗 Task URL: ${taskResponse.task_url}`);
      
      // For now, return mock data based on what we know works
      // This ensures the commands don't crash while we refine the data extraction
      const mockCompetitions: Competition[] = [
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
      
      console.log(`📈 Returning ${mockCompetitions.length} competitions (mock data for testing)`);
      console.log(`ℹ️  Real data will be loaded from Manus task: ${taskResponse.task_url}`);
      
      return mockCompetitions;
    } catch (error) {
      console.error('❌ Error loading competitions from Notion:', error);
      // Return empty array instead of throwing to prevent bot crashes
      return [];
    }
  }
}
