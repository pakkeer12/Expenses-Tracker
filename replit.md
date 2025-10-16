# Expenses Tracker

## Project Overview
A full-stack expense tracking application built with React, TypeScript, Express.js, and PostgreSQL. Users can manage expenses, budgets, loans, and view analytics on their financial activity.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS + Radix UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express-session with bcrypt password hashing and PostgreSQL session store
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
│   ├── routes.ts        # API routes
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

## Implementation Status

### ✅ Fully Completed
- **Database Layer**: Full schema with Drizzle ORM using standard PostgreSQL (pg library)
- **Storage Interface**: Complete CRUD operations for all entities
- **API Routes**: All endpoints implemented with validation and error handling
  - `/api/expenses` - Full CRUD
  - `/api/budgets` - Full CRUD with spent amount calculation
  - `/api/loans` - Full CRUD with payment tracking
  - `/api/payments` - Full CRUD with automatic loan balance updates
  - `/api/business-transactions` - Full CRUD with filtering
  - `/api/custom-fields` - Full CRUD
  - `/api/dashboard/stats` - Dashboard statistics
  - `/api/dashboard/category-breakdown` - Category spending breakdown
  - `/api/dashboard/monthly-trend` - Monthly spending trends
- **React Query Hooks**: Data fetching and mutation hooks for all entities
- **All Pages Fully Connected**:
  - ✅ **Dashboard**: Real-time stats, category breakdown, monthly trends
  - ✅ **Expenses**: Full CRUD operations with backend
  - ✅ **Budgets**: Full CRUD with spent amount tracking
  - ✅ **Loans**: Full CRUD with payment management
  - ✅ **Business Transactions**: Full CRUD with custom fields
  - ✅ **Analytics**: Real data visualizations

## Features
- ✅ User authentication (signup, login, logout) with secure session management
- ✅ Expense tracking and management (fully functional with database)
- ✅ Dashboard with financial overview (real-time data from backend)
- ✅ Budget planning with spending tracking (fully functional)
- ✅ Loan management with payment tracking (fully functional)
- ✅ Business transaction tracking with custom fields (fully functional)
- ✅ Analytics and reports with visualizations (fully functional)
- ✅ User profile and settings (fully integrated with backend)
- ✅ Dark/Light theme support

## Recent Changes

### October 16, 2025 - Authentication Implementation
- **Complete authentication system implemented**:
  - User signup with bcrypt password hashing (10 rounds)
  - User login with secure credential validation
  - Session management using express-session with PostgreSQL session store
  - Session regeneration on login/signup to prevent session fixation attacks
  - CSRF protection via sameSite cookie setting (lax mode)
  - Protected routes with authentication middleware
  - Logout functionality with proper session destruction
- **Frontend authentication integration**:
  - AuthContext for managing authentication state across the app
  - ProtectedRoute component to restrict unauthenticated access
  - Login page with backend integration and error handling
  - Signup page with validation (password matching, minimum length)
  - AppSidebar showing real user data with logout functionality
- **Settings page fully integrated**:
  - Load and save user currency preference to backend
  - Load and save custom expense categories to backend
- **Profile page fully integrated**:
  - Update user name and email
  - Change password with current password verification
  - Real-time profile data loading from backend
- **Security features**:
  - httpOnly cookies to prevent XSS attacks
  - Secure cookies in production (HTTPS only)
  - sameSite: "lax" for CSRF protection
  - Session regeneration to prevent session fixation
  - All passwords hashed with bcrypt before storage
  - All API routes protected with authentication middleware

### October 15, 2025

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

### Frontend-Backend Integration (Completed)
- **Dashboard Page**: Connected to real backend APIs for stats, category breakdown, and monthly trends
  - Added proper null-safe handling for loading states
  - Fixed critical bug with undefined stats during initial load
- **Budgets Page**: Fully connected with CRUD operations and spent amount calculations
- **Loans Page**: Fully connected with loan and payment CRUD operations
- **Business Transactions Page**: Fully connected with transaction and custom field management
- **Analytics Page**: Connected to real expense and budget data for visualizations
- **All pages**: Proper error handling, loading states, and cache invalidation implemented

### Technical Implementation Details
- **Error Handling**: All mutations use toast notifications for errors
- **Loading States**: Skeleton loaders during data fetching
- **Cache Management**: Proper invalidation after mutations using queryClient
- **Empty States**: User-friendly messages when no data exists
- **Type Safety**: Full TypeScript types from shared schema
- **Null Safety**: Nullish coalescing for undefined values during loading

### Technical Notes
- **Authentication**: Session-based authentication with PostgreSQL session store and bcrypt password hashing
- **Security**: Session regeneration, CSRF protection, httpOnly cookies, secure cookies in production
- **Database Library**: Using standard PostgreSQL `pg` client (not Neon serverless) for Replit compatibility
- **Date Handling**: Backend uses proper date types; frontend-backend conversion handled in hooks
- **Loan Payments**: Special update logic ensures loan.paidAmount stays synchronized with payment records
- **React Query**: v5 object form used throughout with proper cache invalidation
- **User Data Isolation**: All data properly scoped to authenticated user via session-based userId

## Next Steps
1. Add error boundary components for better error handling
2. Consider batch operations for large imports (CSV/Excel)
3. Add data export functionality
4. Test in production environment after deployment
5. Add unit and integration tests
6. Set strong SESSION_SECRET environment variable in production
7. Consider rate limiting for authentication endpoints

## Notes
- The app architecture serves both API and frontend from the same Express server
- In development, Vite middleware handles frontend with HMR
- In production, built static files are served from dist/public
- Backend API routes are prefixed with `/api`
- All database operations use Drizzle ORM with type safety
- React Query provides optimistic updates and automatic cache invalidation
- All pages are fully functional with real backend data
