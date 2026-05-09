# PathVision OS: Neural Backend Architecture

Professional production-grade backend for the PathVision AI Operating System. Powered by Node.js, Supabase, and Groq LPU Core.

## 🧬 Architecture Overview

The backend is organized into a modular "Service-Controller" pattern for maximum scalability and real-time performance.

- **src/controllers**: Handles HTTP request logic and response formatting.
- **src/services**: Core business logic and Supabase CRUD operations.
- **src/ai**: Groq LPU integration and natural language command parsing.
- **src/realtime**: Real-time event orchestration and broadcast logic.
- **src/config**: Centralized configuration for Supabase and environment variables.

## 🚀 Deployment

This backend is designed for instant deployment on **Render**, **Railway**, or **AWS App Runner**.

### 1. Environment Setup
Copy `.env.example` to `.env` and fill in your Supabase and Groq credentials.

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Production Server
```bash
npm start
```

## 🧠 Core Features
- **Real-time Sync**: Bi-directional data streaming via Supabase.
- **AI Command Engine**: Natural language parsing for system actions.
- **Automated Triggers**: Project health and risk detection logic.
- **Production Logging**: Integrated middleware for monitoring.

## 🛡️ Security
- Environment-driven secrets.
- JWT-based authentication.
- Supabase Row Level Security (RLS) support.
