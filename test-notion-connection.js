const { NotionService } = require('./src/services/notion');
const { CompetitionService } = require('./src/services/competition');

async function testNotionConnection() {
    console.log('🧪 Testing Notion database connection...\n');
    
    const dataSourceId = process.env.NOTION_DATA_SOURCE_ID || '288e1f5c-21fb-8042-b9d7-000b829e8e74';
    console.log(`📊 Using Notion Data Source ID: ${dataSourceId}\n`);
    
    try {
        console.log('1️⃣ Testing NotionService directly...');
        const notionService = new NotionService(dataSourceId);
        const competitions = await notionService.loadCompetitions();
        console.log(`✅ NotionService returned ${competitions.length} competitions\n`);
        
        if (competitions.length > 0) {
            console.log('📄 Sample competition:');
            console.log(JSON.stringify(competitions[0], null, 2));
        }
        
        console.log('\n2️⃣ Testing CompetitionService...');
        const competitionService = new CompetitionService(dataSourceId);
        const allCompetitions = await competitionService.getCompetitions();
        console.log(`✅ CompetitionService returned ${allCompetitions.length} competitions\n`);
        
        console.log('3️⃣ Testing dashboard generation...');
        const dashboard = await competitionService.generateDashboard();
        console.log('✅ Dashboard generated successfully');
        console.log(`📏 Dashboard length: ${dashboard.length} characters\n`);
        
    } catch (error) {
        console.error('❌ Error testing Notion connection:', error);
        console.error('Stack trace:', error.stack);
    }
}

require('dotenv').config();
testNotionConnection();
