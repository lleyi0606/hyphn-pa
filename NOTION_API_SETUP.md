# Notion API Integration Setup

This document explains how to set up the Notion API integration for the Hyphn PA Bot.

## Environment Variables

The bot requires the following environment variables to be set:

### NOTION_INTEGRATION_TOKEN

Your Notion integration token (starts with `ntn_`).

**Note:** This token should be kept secret and stored in environment variables only.

This token allows the bot to access your Notion workspace and read from the Hyphn Competitions database.

### NOTION_DATA_SOURCE_ID

The ID of the Hyphn Competitions data source:
```
291a59e7-892d-8096-b67e-000b4078788e
```

This is the data source ID extracted from the collection URL: `collection://291a59e7-892d-8096-b67e-000b4078788e`

**Important:** In Notion API v2025-09-03, databases and data sources are separate concepts. This bot uses the data source ID to query the actual competition entries.

## Vercel Environment Variables

To deploy this bot on Vercel, add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

| Name | Value |
|------|-------|
| `NOTION_INTEGRATION_TOKEN` | Your Notion integration token (starts with `ntn_`) |
| `NOTION_DATA_SOURCE_ID` | `291a59e7-892d-8096-b67e-000b4078788e` |
| `BOT_TOKEN` | Your Telegram bot token |
| `MANUS_API_KEY` | Your Manus API key (for /manusadd command) |

## Granting Integration Access

**Critical Step:** Before the bot can read from your database, you must grant the integration access:

1. Open your Hyphn Competitions database in Notion
2. Click the "..." menu at the top right of the database
3. Scroll down to "Connections" or "Add connections"
4. Find and select your integration from the list
5. Click "Confirm" to grant access

Without this step, the API will return 0 results even if the integration token is valid.

## Database Schema

The Hyphn Competitions database includes the following properties:

- **Competition Name** (Title) - Name of the competition
- **Application Deadline** (Date) - Deadline for application submission
- **Competition Type** (Multi-select) - Type(s) of competition (Startup Competition, Pitch Competition, Hackathon, Innovation Challenge)
- **Deliverables** (Text) - Required deliverables for the competition
- **Estimated Effort** (Text) - Estimated effort required
- **Geographic Scope** (Text) - Geographic scope of the competition
- **Industry Focus** (Multi-select) - Industry focus areas (Technology, Healthcare, Fintech)
- **Participation requirements** (Text) - Requirements for participation
- **Priority Level** (Select) - Priority level (📋 Low, 📈 Medium, 🔥 High, 🤔 Research)
- **Prize Amount** (Number) - Prize amount in USD
- **Stage Requirement** (Text) - Required startup stage
- **Status** (Select) - Current status (Research, Preparing, Applied, etc.)
- **Success Probability** (Text) - Probability of success
- **Website** (URL) - Competition website URL

## Bot Commands

The following commands are available and work with the Notion database:

- `/dashboard` - Complete competition dashboard with overview and statistics
- `/deadlines` - Upcoming deadlines in the next 7 days
- `/priority` - High-priority competitions (🔥 High priority level)
- `/dowhat` - Smart recommendations on what to focus on next

## Implementation Details

The bot uses the official `@notionhq/client` package (v5.3.0) to interact with the Notion API. The integration:

1. Connects to Notion using the integration token
2. Queries the data source using `dataSources.query()` method (new API v2025-09-03)
3. Parses the database properties into a structured Competition object
4. Provides filtering and analysis capabilities for the Telegram bot commands

## Testing

To test the integration locally:

1. Create a `.env` file with the required environment variables
2. Ensure the integration has been granted access to the database in Notion
3. Run `npm run dev` to start the development server
4. Send commands to your Telegram bot

## Troubleshooting

If you encounter issues:

1. **0 competitions returned**: Verify that the Notion integration has access to the Hyphn Competitions database (see "Granting Integration Access" above)
2. **Invalid request URL**: Check that the data source ID is correct and properly formatted
3. **Authentication error**: Ensure the NOTION_INTEGRATION_TOKEN is valid and not expired
4. **No results**: Make sure there are actual entries in the database
5. Review the bot logs for any error messages

## API Version Notes

This implementation uses Notion API v2025-09-03, which introduced the separation of databases and data sources:

- **Database**: The container that defines the schema and views
- **Data Source**: The actual collection of pages/entries within a database

The bot queries the data source directly using `dataSources.query()` instead of the deprecated `databases.query()` method.

