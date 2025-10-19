// Test script for new Manus API configuration
require('dotenv').config();
const fetch = require('node-fetch');

async function testNewManusAPI() {
  console.log('🔍 Testing New Manus API Configuration...');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('- MANUS_API_KEY:', process.env.MANUS_API_KEY ? '✅ Set' : '❌ Missing');
  
  if (!process.env.MANUS_API_KEY) {
    console.log('❌ MANUS_API_KEY is required for testing');
    return;
  }
  
  try {
    console.log('\n🤖 Testing New Manus API Configuration...');
    

    
    const requestBody = {
      prompt: "Test competition: YC application due next friday, $500K prize",
      taskMode: "agent",
      connectors: ["9c27c684-2f4f-4d33-8fcf-51664ea15c00"], // notion
      hideInTaskList: true,
      createShareableLink: true,
      agentProfile: "speed"
    };
    
    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));
    
    const testResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': process.env.MANUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      throw new Error(`API Error: ${testResponse.status} - ${errorText}`);
    }
    
    const result = await testResponse.json();
    
    console.log('✅ New Manus API Response:');
    console.log('- Task ID:', result.task_id);
    console.log('- Task Title:', result.task_title);
    console.log('- Task URL:', result.task_url);
    console.log('- Share URL:', result.share_url || 'Not provided');
    
    console.log('\n🔗 URLs to test:');
    console.log('Task URL:', result.task_url);
    if (result.share_url) {
      console.log('Share URL:', result.share_url);
    }
    
  } catch (error) {
    console.error('❌ Manus API Error:', error.message);
    console.error('Full error:', error);
  }
}

testNewManusAPI();
