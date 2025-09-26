/**
 * Deployment Configuration
 * Instructions and configurations for deploying the chess application
 */

# Deployment Guide

## Local Development
The application is currently set up for local development. To run:

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