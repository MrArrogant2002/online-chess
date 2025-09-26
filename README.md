# Chess Royale - Online Multiplayer Chess Game

A modern, real-time multiplayer chess game with **separated frontend and backend architecture**. Built with Next.js, Express, TypeScript, and Socket.IO for scalable, real-time gameplay.

## 🏗️ Architecture

### Frontend (Port 3000)
- **Next.js 15** with TypeScript
- **Tailwind CSS** with custom design system
- **Socket.IO Client** for real-time communication

### Backend (Port 3001)  
- **Express Server** with TypeScript
- **Socket.IO Server** for WebSocket communication
- **Modular Controllers** for game logic and room management

## 🎯 Features

### Core Functionality
- **Real-time Multiplayer**: WebSocket-powered gameplay with instant move synchronization
- **Room System**: Create or join games using unique room codes
- **Complete Chess Engine**: Full rule implementation including:
  - All piece movements and captures
  - Castling (kingside and queenside)
  - En passant captures
  - Pawn promotion
  - Check and checkmate detection
  - Stalemate detection

### User Experience
- **Clean, Modern UI**: Elegant design with a carefully crafted color palette
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Drag & Drop**: Intuitive piece movement with visual feedback
- **Real-time Updates**: Instant game state synchronization between players
- **Move History**: Track all moves with standard chess notation
- **Game Statistics**: View captured pieces, move counts, and game duration

### Technical Features
- **Separated Architecture**: Independent frontend and backend services
- **TypeScript**: Fully typed for better development experience and fewer bugs
- **Express + Next.js**: Scalable server architecture with optimal frontend performance
- **Socket.IO**: Reliable real-time bidirectional communication
- **Tailwind CSS**: Utility-first styling with custom color palette
- **Modular Architecture**: Clean, reusable components and utilities

## 🎨 Design System

### Color Palette
- **Deep Purple** (`#150016`): Primary background
- **Royal Purple** (`#29104A`): Secondary backgrounds and cards
- **Medium Purple** (`#522C5D`): Accents and borders
- **Muted Purple** (`#845162`): Text secondary and muted elements
- **Coral Pink** (`#E38681`): Primary actions and highlights
- **Cream** (`#FFE3D8`): Primary text and piece colors

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Development Setup

#### 1. Start Backend Server (Port 3001)
```bash
cd backend
pnpm install
pnpm build
pnpm start
```

#### 2. Start Frontend Server (Port 3000)
```bash
cd frontend
pnpm install
pnpm dev
```

#### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend Health Check**: http://localhost:3001/health

### Production Build

#### Backend
```bash
cd backend
pnpm build
pnpm start
```

#### Frontend
```bash 
cd frontend
pnpm build
pnpm start
```

### Environment Configuration

#### Frontend (.env.local)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

#### Backend (.env)
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

## 🎮 How to Play

### Creating a Game
1. Click "Create New Room" on the home screen
2. Share the generated room code with your friend
3. Wait for them to join using the room code
4. Both players click "Ready to Play"
5. The game starts automatically!

### Playing
- **White moves first**
- Click a piece to select it (shows valid moves)
- Click a destination square or drag to move
- The game enforces all standard chess rules
- Check and checkmate are automatically detected

## 🏗️ Architecture

### Folder Structure
```
src/
├── app/                    # Next.js app router
├── components/
│   ├── chess/             # Chess-specific components
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── server/                # Socket.IO server
├── types/                 # TypeScript definitions
└── utils/                 # Utilities and chess engine
```

### Key Components
- **ChessEngine**: Core chess logic and rule validation
- **GameServer**: Socket.IO multiplayer server
- **useSocket**: WebSocket communication hook
- **ChessBoard**: Interactive game board component

## 🔧 Technical Implementation

### Real-time Communication
- Socket.IO handles bi-directional communication
- Room management with unique codes
- State synchronization across clients
- Graceful error handling

### Chess Logic
- Complete rule implementation
- Server-side move validation
- All special moves supported
- Proper game end detection

## 📱 Responsive Design

Fully responsive design that works on:
- **Desktop**: Full-featured experience
- **Tablet**: Touch-friendly controls
- **Mobile**: Optimized layout

## 🛠️ Development

### Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

**Built with ❤️ using Next.js, TypeScript, and Socket.IO**
