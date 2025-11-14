<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Az3bxumQr9ZZ2-yfxoNUW2eOuwKOTv-E

## Run Locally (Development)

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run with Docker (Production)

**Prerequisites:** Docker and Docker Compose

1. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your API_KEY and JWT_SECRET
   ```

2. Start the application:
   ```bash
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. Access the application at: **http://localhost:8080**

For detailed instructions, troubleshooting, and architecture information, see:
- **[ACCESSING_APPLICATION.md](ACCESSING_APPLICATION.md)** - How to access and troubleshoot the application
- **[DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md)** - Complete deployment guide
- **[MIGRATION_FIX_SUMMARY.md](MIGRATION_FIX_SUMMARY.md)** - Recent migration fix details
