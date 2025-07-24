# Training and Placement Portal

## Overview

This is a full-stack Training and Placement Portal for colleges built with a modern tech stack. The application provides a comprehensive platform for managing placement activities, student information, events, and alumni data. It features a public homepage for students and visitors, along with a secure admin dashboard for Training and Placement Officers (TPOs).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and express-session
- **File Upload**: Multer for handling multipart/form-data
- **Session Storage**: PostgreSQL-backed session store

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Centralized schema definition in `shared/schema.ts`

## Key Components

### Authentication System
- JWT-based authentication using Passport.js local strategy
- Session management with PostgreSQL session store
- Protected routes with role-based access control
- Hardcoded admin credentials (no user registration)

### Data Models
- **Users**: TPO admin accounts with username/password
- **News**: Latest announcements and updates
- **Events**: Placement events with status tracking (ongoing, upcoming, past)
- **Students**: Student profiles with placement status and company details
- **Alumni**: Alumni registration data with contact information
- **Attendance**: Event attendance tracking system

### File Management
- Multer-based file upload system
- Support for student photos, ID cards, and offer letters
- Files served from `/uploads` directory with access control

### Export Functionality
- Excel export using XLSX library
- Support for exporting students, alumni, and attendance data
- Admin dashboard integration for data export

## Data Flow

### Public Access Flow
1. Users visit the homepage to view news, events, and announcements
2. Students can mark attendance for ongoing events
3. Alumni can register through the public registration form

### Admin Flow
1. TPO logs in through `/auth` endpoint
2. Access to admin dashboard at `/admin` (protected route)
3. CRUD operations for news, events, and student data
4. File uploads for student photos and documents
5. Data export functionality for reporting

### API Flow
- RESTful API endpoints under `/api` prefix
- Authentication middleware protects admin endpoints
- File upload endpoints handle multipart data
- Export endpoints generate downloadable files

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **class-variance-authority**: Utility for creating component variants

### Data and State Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities

### Backend Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Express Session**: Session management
- **Multer**: File upload handling
- **XLSX**: Excel file generation

### Development Tools
- **Vite**: Build tool and dev server
- **ESBuild**: Production bundling for server
- **Replit specific**: Runtime error overlay and cartographer plugins

## Deployment Strategy

### Development
- Vite dev server for frontend development
- Node.js with tsx for TypeScript execution
- Hot module replacement and error overlays
- Replit integration with specialized plugins

### Production Build
- Vite builds the React frontend to `dist/public`
- ESBuild bundles the Express server to `dist/index.js`
- Server serves static files from the built frontend
- Environment-based configuration for database connections

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `SESSION_SECRET`: Session encryption key (required)
- `NODE_ENV`: Environment mode (development/production)

### File Structure
- `client/`: React frontend application
- `server/`: Express backend with API routes
- `shared/`: Common TypeScript types and schemas
- `migrations/`: Database migration files (Drizzle)
- `uploads/`: User-uploaded files (photos, documents)

The application is designed to run as a single Node.js process that serves both the API and static frontend files, making it suitable for deployment on platforms like Replit, Heroku, or similar Node.js hosting services.