#!/usr/bin/env node

/**
 * Webhook Health Check Script
 * 
 * This script checks if the Telegram webhook is properly configured
 * and automatically restores it if it's been cleared.
 * 
 * Usage: node scripts/webhook-health.js
 */

const https = require('https');

const BOT_TOKEN = process.env.BOT_TOKEN || '8415767215:AAGSIcRJ3aqe7dlhRZf-B00IIZx5spuoC1Y';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://hyphn-pa.vercel.app/api';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.method === 'POST' && options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function checkWebhookHealth() {
  try {
    console.log('🔍 Checking webhook health...');
    
    // Check current webhook status
    const webhookInfo = await makeRequest(
      `https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`
    );
    
    if (!webhookInfo.ok) {
      console.error('❌ Failed to get webhook info:', webhookInfo);
      return false;
    }
    
    const currentUrl = webhookInfo.result.url;
    const pendingUpdates = webhookInfo.result.pending_update_count;
    
    console.log(`📡 Current webhook URL: ${currentUrl || '(none)'}`);
    console.log(`📬 Pending updates: ${pendingUpdates}`);
    
    // Check if webhook needs to be restored
    if (!currentUrl || currentUrl !== WEBHOOK_URL) {
      console.log('🔧 Webhook needs to be restored...');
      
      const setWebhookResult = await makeRequest(
        `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: WEBHOOK_URL
          })
        }
      );
      
      if (setWebhookResult.ok) {
        console.log('✅ Webhook restored successfully!');
        console.log(`🔗 New webhook URL: ${WEBHOOK_URL}`);
        return true;
      } else {
        console.error('❌ Failed to restore webhook:', setWebhookResult);
        return false;
      }
    } else {
      console.log('✅ Webhook is healthy!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error checking webhook health:', error);
    return false;
  }
}

async function testEndpoint() {
  try {
    console.log('🧪 Testing Vercel endpoint...');
    
    const response = await makeRequest(WEBHOOK_URL);
    
    if (response.message && response.message.includes('Hyphn PA Bot')) {
      console.log('✅ Vercel endpoint is responding correctly');
      return true;
    } else {
      console.log('⚠️ Vercel endpoint response:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ Vercel endpoint test failed:', error);
    return false;
  }
}

async function main() {
  console.log('🤖 Hyphn PA Bot - Webhook Health Check');
  console.log('=====================================');
  
  // Test Vercel endpoint first
  const endpointHealthy = await testEndpoint();
  
  if (!endpointHealthy) {
    console.log('❌ Vercel endpoint is not responding properly');
    process.exit(1);
  }
  
  // Check and restore webhook if needed
  const webhookHealthy = await checkWebhookHealth();
  
  if (webhookHealthy) {
    console.log('🎉 All systems operational!');
    process.exit(0);
  } else {
    console.log('💥 Webhook health check failed');
    process.exit(1);
  }
}

// Run the health check
if (require.main === module) {
  main();
}

module.exports = { checkWebhookHealth, testEndpoint };
