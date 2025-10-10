# Manus AI Integration

This document explains how to use the Manus AI integration features in the Hyphn PA Bot.

## 🤖 Manus AI Commands

### `/manusadd` - Add Competition with AI Extraction

Automatically extract competition details from any text or URL and add them to your Notion database.

**Usage:**
```
/manusadd https://example.com/competition-page
```

or

```
/manusadd TechCrunch Disrupt 2024
Application deadline: December 15, 2024
Prize: $100,000
Location: San Francisco
Requirements: Early-stage startups
```

**What it does:**
1. 🧠 Uses Manus AI to extract competition details
2. 📊 Automatically populates your Notion database
3. 🔗 Provides a task URL to monitor progress
4. 💾 Stores session for follow-up replies

### `/manusreply` - Continue Conversation

Send additional information or corrections to your active Manus task.

**Usage:**
```
/manusreply Please also add the eligibility criteria and judging process
```

**Requirements:**
- Must have an active Manus task from `/manusadd`
- Session expires after 24 hours

## 🔧 Setup Requirements

### Environment Variables

Add to your Vercel environment variables:

```env
MANUS_API_KEY=your_manus_api_key_here
```

### Notion Database Structure

The bot expects your Notion database to have these properties:

| Property | Type | Description |
|----------|------|-------------|
| Competition Name | Title | Name of the competition |
| Application Deadline | Date | When applications are due |
| Prize Amount | Number | Monetary prize value |
| Competition Type | Multi-select | Type (Startup, Pitch, Hackathon, etc.) |
| Status | Select | Current status (Research, Preparing, Applied, etc.) |
| Priority Level | Select | Priority (📋 Low, 📈 Medium, 🔥 High, 🤔 Research) |
| Geographic Scope | Text | Local, National, International, etc. |
| Industry Focus | Multi-select | Technology, Healthcare, Fintech, etc. |
| Stage Requirement | Text | Early-stage, Growth-stage, Any stage, etc. |
| Estimated Effort | Text | Low, Medium, High |
| Success Probability | Text | Low, Medium, High |
| Website | URL | Application link |

## 🎯 AI Extraction Features

The Manus AI integration can extract:

- **Competition names** from titles and headers
- **Deadlines** from various date formats
- **Prize amounts** from currency mentions
- **Requirements** from eligibility sections
- **Categories** and competition types
- **Geographic scope** from location mentions
- **Industry focus** from context clues

## 📝 Example Workflows

### Adding from a Website
```
/manusadd https://techcrunch.com/startup-battlefield/
```

### Adding from Text Description
```
/manusadd MIT $100K Entrepreneurship Competition
Deadline: March 15, 2024
Prize: $100,000 grand prize
Open to: MIT students and recent alumni
Focus: Technology startups
Application: Business plan and pitch deck required
```

### Following Up
```
/manusreply Also note that teams can have up to 4 members and must include at least one MIT affiliate
```

## 🔄 Session Management

- Sessions are stored in memory (resets on bot restart)
- Each chat can have one active session
- Sessions auto-expire after 24 hours
- Use `/manusadd` to start a new session

## 🚨 Error Handling

Common issues and solutions:

**"Manus API key not configured"**
- Add `MANUS_API_KEY` to your environment variables

**"No active Manus task found"**
- Use `/manusadd` first to create a task
- Session may have expired (24 hours)

**"Error creating Manus task"**
- Check your API key is valid
- Ensure you have Manus credits available
- Verify Notion connector is enabled

## 🔗 Integration Benefits

- **Time Saving**: No manual data entry
- **Accuracy**: AI extracts precise details
- **Consistency**: Standardized database format
- **Scalability**: Process multiple competitions quickly
- **Tracking**: Monitor extraction progress
- **Flexibility**: Handle various input formats

## 🛠 Technical Details

- Uses Manus API v1 `/tasks` endpoint
- Runs in 'quality' mode for better extraction
- Enables 'notion' connector automatically
- Stores task sessions for follow-up
- Handles errors gracefully with user feedback
