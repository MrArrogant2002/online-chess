# 🚀 Vercel + Render Integration Guide

This guide will help you deploy your online chess application with **Vercel** (frontend) and **Render** (backend) and integrate them properly.

## 📋 Prerequisites

- GitHub repository with your code
- Vercel account (free tier available)
- Render account (free tier available)
- Your application code pushed to GitHub

## 🖥️ Backend Deployment on Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

### Step 2: Deploy Backend Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:
   ```
   Name: chess-backend (or your preferred name)
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: pnpm install && pnpm run build
   Start Command: pnpm start
   ```

### Step 3: Configure Environment Variables
In Render dashboard, add these environment variables:
```bash
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Step 4: Get Your Backend URL
After deployment, Render will provide a URL like:
`https://your-backend-name.onrender.com`

**Save this URL - you'll need it for frontend configuration!**

## 🌐 Frontend Deployment on Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up
2. Install Vercel CLI: `npm i -g vercel`

### Step 2: Deploy Frontend
1. Go to Vercel dashboard
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure the project:
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: pnpm run build
   Output Directory: .next
   Install Command: pnpm install
   ```

### Step 3: Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:
```bash
NEXT_PUBLIC_BACKEND_URL=https://your-backend-name.onrender.com
NEXT_PUBLIC_WS_URL=https://your-backend-name.onrender.com
```

## 🔗 Integration Steps

### Step 1: Update Backend CORS Configuration
Your backend is already configured to accept the frontend URL from environment variables. Just make sure the `FRONTEND_URL` in Render matches your Vercel URL.

### Step 2: Update Frontend Environment Variables
1. In your local `.env.local`, update:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://your-backend-name.onrender.com
   NEXT_PUBLIC_WS_URL=https://your-backend-name.onrender.com
   ```

2. In Vercel dashboard, update the environment variables with your Render backend URL.

### Step 3: Redeploy Both Services
1. **Backend**: Push changes to trigger Render redeploy
2. **Frontend**: Push changes to trigger Vercel redeploy

## ⚙️ Configuration Verification

### Backend Health Check
Visit: `https://your-backend-name.onrender.com/health`
Should return:
```json
{
  "status": "healthy",
  "timestamp": "2025-09-27T...",
  "service": "chess-royale-backend"
}
```

### Frontend Connection
1. Open your Vercel app: `https://your-app.vercel.app`
2. Check browser console for WebSocket connection
3. Try creating a room to test backend integration

## 🐛 Common Issues & Solutions

### Issue 1: CORS Errors
**Problem**: Frontend can't connect to backend
**Solution**: 
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check both HTTP and HTTPS protocols match

### Issue 2: WebSocket Connection Fails
**Problem**: Real-time features not working
**Solution**:
- Ensure `NEXT_PUBLIC_WS_URL` matches your backend URL
- Check that Render service is running (not sleeping)

### Issue 3: 503 Service Unavailable
**Problem**: Backend not responding
**Solution**:
- Render free tier spins down after inactivity
- First request might take 30+ seconds to wake up
- Consider upgrading to paid tier for always-on service

### Issue 4: Build Failures
**Problem**: Deployment fails during build
**Solution**:
- Check build logs in respective platforms
- Ensure all dependencies are in package.json
- Verify Node.js versions match

## 📱 Testing the Integration

### Local Testing with Production Backend
```bash
# In frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=https://your-backend-name.onrender.com
NEXT_PUBLIC_WS_URL=https://your-backend-name.onrender.com

# Run frontend locally
cd frontend
pnpm dev
```

### Full Production Testing
1. Open your Vercel app
2. Create a room
3. Share room code with another browser/device
4. Test chess gameplay
5. Verify real-time updates

## 🚀 Deployment Commands

### Quick Redeploy Commands
```bash
# Push changes to trigger both deployments
git add .
git commit -m "Update: deployment configuration"
git push origin main

# Manual Vercel redeploy (if needed)
cd frontend
vercel --prod
```

## 📊 Monitoring

### Backend Monitoring (Render)
- Check logs in Render dashboard
- Monitor service health at `/health` endpoint
- Set up uptime monitoring (like UptimeRobot)

### Frontend Monitoring (Vercel)
- Check deployment logs in Vercel dashboard
- Monitor Core Web Vitals
- Use Vercel Analytics for usage insights

## 💡 Pro Tips

1. **Free Tier Limitations**:
   - Render spins down after 15 minutes of inactivity
   - First connection may take 30+ seconds
   - Consider paid tier for production use

2. **Environment Management**:
   - Use different URLs for staging/production
   - Keep sensitive data in environment variables
   - Never commit `.env` files to git

3. **Performance Optimization**:
   - Enable Vercel Edge Functions for better global performance
   - Use Render's CDN for static assets
   - Implement WebSocket connection retry logic

## 🔧 Troubleshooting Commands

```bash
# Check backend health
curl https://your-backend-name.onrender.com/health

# Test WebSocket connection
wscat -c wss://your-backend-name.onrender.com

# Check frontend build locally
cd frontend
pnpm build
pnpm start
```

---

## 📝 Local Development Setup

```bash
pnpm dev
```

Access at: http://localhost:3000

## Socket.IO Integration

For full multiplayer functionality with Socket.IO, you have several deployment options:

### Option 1: Custom Server (Recommended for Production)

1. **Create a custom server file** (`server.mjs`):
```javascript
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(server, {
    cors: {
      origin: dev ? "http://localhost:3000" : false,
      methods: ["GET", "POST"]
    }
  })

  // Socket.IO logic here
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id)
    // Add your game logic
  })

  const PORT = process.env.PORT || 3000
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
```

2. **Update package.json**:
```json
{
  "scripts": {
    "dev": "node server.mjs",
    "build": "next build",
    "start": "NODE_ENV=production node server.mjs"
  }
}
```

### Option 2: Vercel with External WebSocket Service

1. Deploy the Next.js app to Vercel
2. Use a separate WebSocket service (Railway, Render, etc.) for Socket.IO
3. Update the WebSocket connection URL in the client

### Option 3: Full-Stack Platforms

Deploy to platforms that support WebSockets:
- **Railway**: Supports both Next.js and Socket.IO
- **Render**: Full-stack deployment
- **DigitalOcean App Platform**
- **AWS with EC2/ECS**

## Environment Variables

Create `.env.local` for development:
```env
NODE_ENV=development
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

For production:
```env
NODE_ENV=production
NEXT_PUBLIC_WS_URL=wss://your-domain.com
```

## Build and Deploy

1. **Build the application**:
```bash
pnpm build
```

2. **Start production server**:
```bash
pnpm start
```

## Performance Considerations

- **CDN**: Use a CDN for static assets
- **Caching**: Implement proper caching strategies
- **Load Balancing**: For high traffic, use load balancers
- **Database**: Consider adding persistent storage for game history
- **Monitoring**: Implement logging and monitoring

## Security

- **CORS**: Configure appropriate CORS settings
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Input Validation**: Validate all user inputs
- **Authentication**: Add user authentication if needed

## Scaling

For high-traffic scenarios:
- Use Redis for session management
- Implement horizontal scaling
- Consider microservices architecture
- Use WebSocket clustering