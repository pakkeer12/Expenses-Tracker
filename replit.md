# Expenses Tracker

## Project Overview
A full-stack expense tracking application built with React, TypeScript, Express.js, and PostgreSQL. Users can manage expenses, budgets, loans, and view analytics on their financial activity.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Radix UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js (configured but routes not yet implemented)
- **UI Components**: Shadcn/ui (Radix UI components)

## Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
│   └── index.html
├── server/              # Backend Express application
│   ├── index.ts         # Main server entry point
│   ├── routes.ts        # API routes (to be implemented)
│   ├── db.ts            # Database connection
│   ├── vite.ts          # Vite development server setup
│   └── storage.ts       # Database operations
├── shared/              # Shared TypeScript types and schemas
│   └── schema.ts        # Drizzle database schema
└── migrations/          # Database migrations (auto-generated)
```

## Configuration
- **Port**: 5000 (both frontend and backend on same port via Vite middleware)
- **Host**: 0.0.0.0 (required for Replit environment)
- **Database**: PostgreSQL via Replit's built-in database

## Development
- **Run**: `npm run dev` - Starts the development server with hot reload
- **Build**: `npm run build` - Builds both frontend and backend for production
- **Start**: `npm run start` - Runs the production build
- **DB Push**: `npm run db:push` - Syncs database schema changes

## Database Schema
Current schema includes:
- `users` table with username/password authentication setup

## Features (Based on UI)
- Dashboard with financial overview
- Expense tracking and management
- Budget planning
- Loan management
- Business transaction tracking
- Analytics and reports
- User profile and settings
- Dark/Light theme support

## Recent Changes (October 15, 2025)
- Configured project for Replit environment
- Set server to bind to 0.0.0.0:5000
- Configured Vite to allow all hosts (required for Replit proxy)
- Installed all dependencies
- Pushed database schema to PostgreSQL
- Set up development workflow
- Configured deployment settings (autoscale)

## Notes
- The app architecture serves both API and frontend from the same Express server
- In development, Vite middleware handles frontend with HMR
- In production, built static files are served from dist/public
- Backend API routes should be prefixed with `/api`
