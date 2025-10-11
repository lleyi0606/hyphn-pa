import fetch from 'node-fetch';

export interface ManusTaskResponse {
  task_id: string;
  task_title: string;
  task_url: string;
  shareURL?: string;
}

export interface ManusTaskRequest {
  prompt: string;
  mode: 'speed' | 'quality';
  connectors: string[];
  hide_in_task_list?: boolean;
  create_shareable_link?: boolean;
}

export class ManusService {
  private apiKey: string;
  private baseUrl = 'https://api.manus.ai/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createTask(request: ManusTaskRequest): Promise<ManusTaskResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'API_KEY': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Manus API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json() as ManusTaskResponse;
      return result;
    } catch (error) {
      console.error('Error creating Manus task:', error);
      throw error;
    }
  }

  async createCompetitionExtractionTask(competitionInfo: string): Promise<ManusTaskResponse> {
    const prompt = `For the following competitionInfo: ${competitionInfo}

I want you to extract the necessary details and populate my Hyphn Competitions database table in Notion.

Please extract and add the following information to the database:
- Competition Name (title)
- Application Deadline (date)
- Prize Amount (number)
- Competition Type (multi-select: Startup Competition, Pitch Competition, Hackathon, Innovation Challenge, etc.)
- Status (select: Research - should be the default for new entries)
- Priority Level (select: 📋 Low, 📈 Medium, 🔥 High, 🤔 Research)
- Geographic Scope (text: Local, National, International, etc.)
- Industry Focus (multi-select: Technology, Healthcare, Fintech, etc.)
- Stage Requirement (text: Early-stage, Growth-stage, Any stage, etc.)
- Estimated Effort (text: Low, Medium, High)
- Success Probability (text: Low, Medium, High)
- Website (URL)

If any information is not available in the provided text, please mark it as "Not specified" or leave it empty for optional fields. Set the Status to "Research" by default for new competitions.

After adding the competition to the database, please provide a summary of what was added.`;

    return await this.createTask({
      prompt,
      mode: 'quality',
      connectors: [], // Will be configured later when Notion connector is properly set up
      hide_in_task_list: false,
      create_shareable_link: false
    });
  }
}
