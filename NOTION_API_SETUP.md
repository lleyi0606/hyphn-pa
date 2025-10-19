# Notion API Integration Setup

This document explains how to set up the Notion API integration for the Hyphn PA Bot.

## Environment Variables

The bot requires the following environment variables to be set:

### NOTION_INTEGRATION_TOKEN

Your Notion integration token (starts with `ntn_`).

**Note:** This token should be kept secret and stored in environment variables only.

This token allows the bot to access your Notion workspace and read from the Hyphn Competitions database.

### NOTION_DATABASE_ID

The ID of the Hyphn Competitions database:
```
291a59e7892d802c829bcf5ecc0675dc
```

This is extracted from the database URL: `https://www.notion.so/291a59e7892d802c829bcf5ecc0675dc`

## Vercel Environment Variables

To deploy this bot on Vercel, add these environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:

| Name | Value |
|------|-------|
| `NOTION_INTEGRATION_TOKEN` | Your Notion integration token (starts with `ntn_`) |
| `NOTION_DATABASE_ID` | `291a59e7892d802c829bcf5ecc0675dc` |
| `BOT_TOKEN` | Your Telegram bot token |
| `MANUS_API_KEY` | Your Manus API key (for /manusadd command) |

## Database Schema

The Hyphn Competitions database has the following properties:

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

The bot uses the official `@notionhq/client` package to interact with the Notion API. The integration:

1. Connects to Notion using the integration token
2. Queries the database to retrieve all competition entries
3. Parses the database properties into a structured Competition object
4. Provides filtering and analysis capabilities for the Telegram bot commands

## Testing

To test the integration locally:

1. Create a `.env` file with the required environment variables
2. Run `npm run dev` to start the development server
3. Send commands to your Telegram bot

## Troubleshooting

If you encounter issues:

1. Verify that the Notion integration has access to the Hyphn Competitions database
2. Check that the environment variables are correctly set
3. Ensure the database ID matches the actual database in your Notion workspace
4. Review the bot logs for any error messages

