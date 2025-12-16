# Okul Meclisi Portalı

## Overview

A Turkish-language school council portal built with React, Express, and Supabase that enables students to view announcements, participate in polls, share ideas, and browse class directories. The application features role-based access control (admin, teacher, student) with moderation workflows for user-generated content.

**Purpose**: Provide a mobile-responsive platform for school communities to communicate, vote on initiatives, and share moderated ideas/blog posts in Turkish language.

**Key Features**:
- Announcements management
- Poll creation and voting
- Moderated idea/blog submission system
- Class-based student directory
- **Events & Applications system** (Katılım & Başvurular) - Dynamic form builder for event registrations
- Admin moderation panel
- Authentication with email/password

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with Vite as the build tool and development server

**Routing**: Wouter for client-side routing with protected routes based on authentication state and user roles

**State Management**: 
- React Query (TanStack Query) for server state management and caching
- React Context for authentication state (AuthContext)
- Local component state for UI interactions
- No global state management library (Redux/Zustand) - relies on server components pattern

**UI Component Library**: shadcn/ui (Radix UI primitives) with Tailwind CSS
- Consistent design system using Material Design 3 principles
- Dark-first theme with deep purple-blue aesthetic
- Turkish typography support (Inter/IBM Plex Sans fonts)
- Responsive mobile-first layout

**Form Handling**: React Hook Form with Zod validation for type-safe form schemas

**Styling Approach**:
- Tailwind CSS utility-first framework
- CSS variables for theming (defined in index.css)
- Custom design tokens for spacing, colors, shadows
- Responsive breakpoints (mobile-first)

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Design**: RESTful API pattern with `/api` prefix for all routes
- Routes defined in `server/routes.ts`
- Currently minimal implementation - storage interface prepared but routes not yet implemented
- Designed for CRUD operations on announcements, polls, ideas, profiles

**Session Management**: Supabase handles authentication and session management client-side

**Data Access Layer**: 
- Storage interface pattern (`IStorage`) allowing for multiple implementations
- In-memory storage (`MemStorage`) provided as default/fallback
- Designed to be replaced with database-backed storage

**Build Process**: 
- Client: Vite builds to `dist/public`
- Server: esbuild bundles to `dist/index.js`
- Separate development and production modes

### Authentication & Authorization

**Authentication Provider**: Supabase Auth
- Email + password authentication
- Session management with JWT tokens
- Client-side auth state via AuthContext

**Password Reset Flow**:
- User requests password reset at `/sifre-sifirla` (forgot password page)
- Supabase sends email with recovery link to `/auth/reset` route
- ResetPassword page validates recovery token and shows password update form
- User sets new password via Supabase `updateUser()` API
- Environment variable `VITE_APP_URL` controls redirect domain:
  - Development: `http://localhost:5000`
  - Production: `https://meclis.onrender.com`

**Supabase Configuration Required**:
- Add to **Allowed Redirect URLs** in Supabase Dashboard → Authentication → URL Configuration:
  - `http://localhost:5000/auth/reset` (development)
  - `https://meclis.onrender.com/auth/reset` (production)

**Authorization Pattern**:
- Role-based access control (admin, teacher, student)
- Protected routes component wrapping pages
- Row Level Security (RLS) intended for Supabase/Postgres
- Profile-based permissions stored in database

**User Flow**:
- Unauthenticated users redirected to `/giris` (login)
- Admin users see additional navigation item and admin panel
- Students can only view their own profile
- Admins can view and moderate all content

### Data Storage Solutions

**Database**: PostgreSQL via Supabase
- Connection through `@supabase/supabase-js` client library
- Neon serverless PostgreSQL as alternative option (`@neondatabase/serverless`)

**File Storage**: Supabase Storage
- Bucket: `ideas-media` for idea/announcement media uploads
- Public access for viewing, authenticated access for uploading
- File types: Images and videos (max 10MB)
- Upload endpoint: `/api/upload` using multer with memory storage
- Files stored with unique names: `{userId}-{timestamp}.{ext}`

**ORM**: Drizzle ORM
- Schema defined in `shared/schema.ts`
- Migration files in `./migrations` directory
- Type-safe database operations
- Currently minimal schema (users table only) - designed to be extended

**Expected Schema Entities** (based on code structure):
- Users (authentication)
- Profiles (user metadata, roles, class info)
- Announcements
- Polls & Poll Options & Poll Votes
- Ideas/Blogs & Comments (with moderation status)
- Classes (student groupings)

**Moderation Workflow**:
- Ideas and comments require admin approval before publication
- Status tracking: pending, approved, rejected
- Admins can approve/reject from dedicated panel

### External Dependencies

**Third-Party Services**:
- **Supabase**: Authentication, PostgreSQL database, Row Level Security
  - Required environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
  - Handles user sessions and JWT tokens
  - RLS policies enforce data access rules
  
**External Libraries**:
- **Radix UI**: Unstyled accessible component primitives (@radix-ui/*)
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state and validation
- **Zod**: Runtime type validation for forms and API
- **dayjs**: Date formatting and manipulation (Turkish locale)
- **Wouter**: Lightweight client-side routing
- **Lucide React**: Icon library

**Development Tools**:
- **Vite**: Fast development server with HMR
- **TypeScript**: Type safety across client and server
- **Tailwind CSS**: Utility-first styling
- **Drizzle Kit**: Database migrations and schema management
- **PostCSS + Autoprefixer**: CSS processing

**Deployment Environments**:

1. **Development (Replit)**:
   - Entry point: `server/index.ts`
   - Node.js 20+ runtime
   - Environment variable configuration via Replit Secrets
   - Single command: `npm run dev`
   - Always-on server on port 5000
   - Instagram auto-sync enabled

2. **Production - Render**:
   - Entry point: `server/index.ts` → `dist/index.js`
   - Always-on Node.js server
   - Build: `npm run build`
   - Start: `npm start`
   - Persistent connections and background jobs supported
   - Instagram auto-sync active

3. **Production - Vercel (Alternative)**:
   - Entry point: `api/index.ts`
   - Serverless functions architecture
   - Build: `npm run build` → `dist/public/`
   - Frontend: CDN static hosting (very fast)
   - API: Serverless functions under `/api`
   - Cold start latency (~2-3s first request)
   - Instagram auto-sync limited (runs on cold starts)
   - See `VERCEL_DEPLOYMENT_GUIDE.md` for details

**Dual Deployment Strategy**:
- **Render**: Used for backend with background jobs (Instagram sync)
- **Vercel**: Can be used for fast global frontend hosting via CDN
- Both can access same Supabase database
- Files organized to support both platforms without conflicts:
  - `server/` for Render (traditional Node.js)
  - `api/` for Vercel (serverless)
  - `client/` for both (Vite build)

**API Integrations**:
- Supabase REST API for authentication operations
- Supabase PostgreSQL connection for data operations
- Session-based API authentication (credentials included in fetch)
- Instagram Graph API for Blüten content synchronization