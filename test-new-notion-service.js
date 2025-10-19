const fetch = require('node-fetch');

// Replicate the new NotionService for testing
class NotionService {
  constructor(dataSourceId) {
    this.dataSourceId = dataSourceId;
    this.manusApiKey = process.env.MANUS_API_KEY || '';
    this.baseUrl = 'https://api.manus.ai/v1';
    
    if (!this.manusApiKey) {
      throw new Error('MANUS_API_KEY environment variable is required');
    }
  }

  async createManusTask(prompt) {
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

  async waitForTaskCompletion(taskId, maxWaitTime = 30000) {
    const startTime = Date.now();
    const pollInterval = 2000;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'API_KEY': this.manusApiKey,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const taskData = await response.json();
          
          if (taskData.status === 'completed' && taskData.result) {
            return taskData.result;
          }
          
          if (taskData.status === 'failed') {
            throw new Error(`Task failed: ${taskData.error || 'Unknown error'}`);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('Error polling task status:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error('Task completion timeout');
  }

  async loadCompetitions() {
    try {
      console.log('📊 Loading competitions from Notion database...');
      
      const prompt = `Please retrieve all competitions from my Hyphn Competitions database in Notion. 

For each competition, provide the following information in JSON format:
- Competition Name
- Application Deadline
- Prize Amount
- Competition Type
- Status
- Priority Level
- Geographic Scope
- Industry Focus
- Stage Requirement
- Estimated Effort
- Success Probability
- Website

Return the data as a JSON array of competition objects. If there are no competitions, return an empty array.

Please access the Notion database and provide all current competition entries.`;

      const taskResponse = await this.createManusTask(prompt);
      console.log(`📋 Created Manus task: ${taskResponse.task_id}`);
      console.log(`🔗 Task URL: ${taskResponse.task_url}`);
      
      console.log('⏳ Waiting for task completion (up to 30 seconds)...');
      const result = await this.waitForTaskCompletion(taskResponse.task_id);
      console.log('✅ Task completed!');
      
      console.log('\n📄 Raw result from Manus:');
      console.log('=' .repeat(50));
      console.log(result);
      console.log('=' .repeat(50));
      
      return result;
    } catch (error) {
      console.error('❌ Error loading competitions from Notion:', error);
      return null;
    }
  }
}

async function testNewNotionService() {
  console.log('🧪 Testing new Notion service with Manus API...\n');
  
  const dataSourceId = process.env.NOTION_DATA_SOURCE_ID || '9c27c684-2f4f-4d33-8fcf-51664ea15c00';
  console.log(`📊 Using Notion Connector ID: ${dataSourceId}\n`);
  
  try {
    const notionService = new NotionService(dataSourceId);
    const result = await notionService.loadCompetitions();
    
    if (result) {
      console.log('\n🎉 Test completed successfully!');
      console.log('The new Notion service can communicate with your database via Manus API.');
    } else {
      console.log('\n⚠️ Test completed but no data returned.');
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
  }
}

require('dotenv').config();
testNewNotionService();
