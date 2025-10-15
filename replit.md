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
Complete schema implemented with the following tables:
- `users` - User accounts with authentication
- `expenses` - Expense records with category, date, amount, notes, etc.
- `budgets` - Monthly budgets by category with amount and period
- `loans` - Loan tracking with principal, interest rate, paid amount, etc.
- `loan_payments` - Individual loan payment records
- `business_transactions` - Business-related transactions
- `custom_fields` - Custom field definitions for business transactions

All tables include proper:
- Foreign key relationships (userId references)
- Unique constraints where needed
- Date types for temporal data
- Automatic loan payment synchronization (paidAmount updates)

## Backend Implementation Status

### ✅ Completed
- **Database Layer**: Full schema with Drizzle ORM using standard PostgreSQL (pg library)
- **Storage Interface**: Complete CRUD operations for all entities
- **API Routes**: All endpoints implemented with validation and error handling
  - `/api/expenses` - Full CRUD
  - `/api/budgets` - Full CRUD
  - `/api/loans` - Full CRUD with payment tracking
  - `/api/payments` - Full CRUD with loan sync logic
  - `/api/business-transactions` - Full CRUD
  - `/api/custom-fields` - Full CRUD
  - `/api/dashboard/stats` - Analytics endpoints
- **React Query Hooks**: Data fetching and mutation hooks created for all entities
- **Expenses Page**: Fully connected to backend with working CRUD operations

### 🔄 Pending
- **Budgets Page**: Connect to backend API (hooks already created)
- **Loans Page**: Connect to backend API (hooks already created)
- **Business Transactions Page**: Connect to backend API (hooks already created)
- **Dashboard Page**: Connect to analytics API (hooks already created)
- **Analytics Page**: Connect to analytics API (hooks already created)

## Features (Based on UI)
- ✅ Expense tracking and management (fully functional with database)
- 🔄 Dashboard with financial overview (API ready, UI connection pending)
- 🔄 Budget planning (API ready, UI connection pending)
- 🔄 Loan management (API ready, UI connection pending)
- 🔄 Business transaction tracking (API ready, UI connection pending)
- 🔄 Analytics and reports (API ready, UI connection pending)
- User profile and settings
- Dark/Light theme support

## Recent Changes (October 15, 2025)

### Initial Setup
- Configured project for Replit environment
- Set server to bind to 0.0.0.0:5000
- Configured Vite to allow all hosts (required for Replit proxy)
- Installed all dependencies
- Set up development workflow
- Configured deployment settings (autoscale)

### Backend Implementation
- Designed and implemented complete database schema for all entities
- Created comprehensive storage layer with full CRUD operations using Drizzle ORM
- Implemented all API routes with proper validation and error handling
- Added special logic for loan payment consistency (auto-updates loan.paidAmount)
- Created React Query hooks for all entities with proper cache invalidation
- **Fixed database connection**: Switched from `@neondatabase/serverless` to standard `pg` library for compatibility with Replit's PostgreSQL
- Successfully connected Expenses page to backend API with functional CRUD operations

### Technical Notes
- **Temporary User**: Using hardcoded `temp-user-123` for development (authentication not yet implemented)
- **Database Library**: Using standard PostgreSQL `pg` client (not Neon serverless) for Replit compatibility
- **Date Handling**: Backend uses proper date types; frontend-backend conversion handled in hooks
- **Loan Payments**: Special update logic ensures loan.paidAmount stays synchronized with payment records

## Next Steps
1. Connect remaining pages to their respective React Query hooks:
   - Budgets page → `use-budgets.ts` hook
   - Loans page → `use-loans.ts` hook  
   - Business Transactions page → `use-business-transactions.ts` hook
   - Dashboard page → `use-dashboard.ts` hook
   - Analytics page → analytics hooks
2. Implement user authentication (replace temp-user-123 with real auth)
3. Add error boundary components for better error handling
4. Consider batch operations for large imports
5. Test in production environment after deployment

## Notes
- The app architecture serves both API and frontend from the same Express server
- In development, Vite middleware handles frontend with HMR
- In production, built static files are served from dist/public
- Backend API routes are prefixed with `/api`
- All database operations use Drizzle ORM with type safety
- React Query provides optimistic updates and automatic cache invalidation
