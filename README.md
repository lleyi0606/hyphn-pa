# Hyphn PA - Personal Assistant Telegram Bot 🏆

A powerful Telegram bot that integrates with Notion to track competition opportunities, deadlines, and priorities. Built for deployment on Vercel with serverless architecture.

## ✨ Features

- **📊 Competition Dashboard**: Complete overview of all competitions from your Notion database
- **⏰ Deadline Tracking**: Smart alerts for upcoming application deadlines
- **🔥 Priority Management**: Focus on high-priority opportunities
- **🚀 Serverless Deployment**: Optimized for Vercel with zero-config deployment
- **🔗 Notion Integration**: Direct integration with your competition database

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lleyi0606/hyphn-pa)

## 📋 Commands

- `/start` - Welcome message and bot overview
- `/dashboard` - Complete competition dashboard
- `/deadlines` - Upcoming deadlines (next 7 days)
- `/priority` - High-priority competitions
- `/help` - Show available commands

## ⚙️ Environment Variables

Set these in your Vercel deployment or `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token
NOTION_DATA_SOURCE_ID=your_notion_data_source_id
NODE_ENV=production
```

## 🏗️ Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/lleyi0606/hyphn-pa.git
   cd hyphn-pa
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env-sample .env
   # Edit .env with your values
   ```

4. **Run in development mode**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 📊 Notion Database Structure

Your Notion database should have these properties:

| Property | Type | Description |
|----------|------|-------------|
| Competition Name | Title | Name of the competition |
| Application Deadline | Date | When applications are due |
| Status | Select | Current status (Research, Preparing, Applied, etc.) |
| Priority Level | Select | Priority level (🔥 High, 📈 Medium, 📋 Low, 🤔 Research) |
| Prize Amount | Number | Monetary prize value |
| Competition Type | Multi-select | Type of competition |
| Website | URL | Application link |

## 🚀 Deployment

### Vercel (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Vercel**: Import your forked repository
3. **Set environment variables** in Vercel dashboard
4. **Deploy**: Vercel will automatically deploy your bot

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform** (Heroku, Railway, etc.)

## 🔧 Configuration

### Webhook Setup

After deployment, set your bot's webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-vercel-app.vercel.app/api"}'
```

### Notion Integration

1. **Get your Notion Data Source ID** from your database URL
2. **Set the environment variable** `NOTION_DATA_SOURCE_ID`
3. **Ensure MCP integration** is properly configured

## 📱 Usage Examples

**Dashboard Command:**
```
/dashboard
```
Returns a comprehensive overview of all competitions with deadlines, priorities, and status breakdown.

**Deadline Check:**
```
/deadlines
```
Shows competitions with deadlines in the next 7 days.

**Priority Check:**
```
/priority
```
Lists high-priority competitions that need attention.

## 🛠️ Development

### Project Structure

```
hyphn-pa/
├── api/
│   └── index.ts          # Vercel API endpoint
├── src/
│   ├── commands/         # Bot command handlers
│   ├── core/            # Core bot logic
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── index.ts         # Main bot entry point
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

### Adding New Commands

1. **Create command handler** in `src/commands/index.ts`
2. **Register command** in `src/index.ts`
3. **Update help text** if needed

### Extending Functionality

- **Add new services** in `src/services/`
- **Define types** in `src/types/`
- **Add utilities** in `src/utils/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/lleyi0606/hyphn-pa/issues)
- **Documentation**: This README and inline code comments
- **Community**: GitHub Discussions

---

**Built with ❤️ by Manus AI** - Making competition tracking effortless!
