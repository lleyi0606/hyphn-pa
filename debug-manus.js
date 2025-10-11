// Debug script for Manus integration
require('dotenv').config();

async function loadManusService() {
  // Use dynamic import for ES modules
  const { ManusService } = await import('./src/services/manus.js');
  return ManusService;
}

async function testManusIntegration() {
  console.log('🔍 Testing Manus Integration...');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('- BOT_TOKEN:', process.env.BOT_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('- MANUS_API_KEY:', process.env.MANUS_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- NOTION_DATA_SOURCE_ID:', process.env.NOTION_DATA_SOURCE_ID ? '✅ Set' : '❌ Missing');
  
  if (!process.env.MANUS_API_KEY) {
    console.log('❌ MANUS_API_KEY is required for testing');
    return;
  }
  
  try {
    console.log('\n🤖 Testing Manus Service...');
    
    // Test a simple API call first
    const fetch = (await import('node-fetch')).default;
    
    const testResponse = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'API_KEY': process.env.MANUS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: "Test prompt for YC application due next friday",
        mode: 'speed'
      })
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      throw new Error(`API Error: ${testResponse.status} - ${errorText}`);
    }
    
    const result = await testResponse.json();
    
    console.log('✅ Manus API Response:');
    console.log('- Task ID:', result.task_id);
    console.log('- Task Title:', result.task_title);
    console.log('- Task URL:', result.task_url);
    
  } catch (error) {
    console.error('❌ Manus API Error:', error.message);
    console.error('Full error:', error);
  }
}

testManusIntegration();
