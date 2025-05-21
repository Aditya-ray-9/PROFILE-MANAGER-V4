# NeonProfiles Application Guide

## Overview
NeonProfiles is a profile management system built with React, Express, Drizzle ORM, and PostgreSQL. It allows users to create, manage, and organize profiles with document attachments, favorites, and archive functionality.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application follows a modern full-stack architecture:

1. **Frontend**: React SPA with Tailwind CSS and shadcn/ui component library
2. **Backend**: Express.js API server
3. **Database**: PostgreSQL with Drizzle ORM
4. **File Storage**: Local file system storage for document uploads

The application uses a monorepo structure with client and server code separated:
- `/client`: React frontend
- `/server`: Express backend
- `/shared`: Shared types, schemas, and utilities
- `/uploads`: Document storage directory

## Key Components

### Database Schema
The database includes several key tables:
- `profiles`: Stores user profile information
- `documents`: Stores metadata about uploaded files
- `custom_fields`: Supports extensible profile fields
- `settings`: Stores application settings

### Frontend
- **UI Library**: Uses shadcn/ui components with Tailwind CSS
- **State Management**: React Query for server state
- **Routing**: Wouter for lightweight routing
- **Forms**: React Hook Form with Zod validation

### Backend
- **REST API**: Express.js server with JSON endpoints
- **Database Access**: Drizzle ORM for type-safe database queries
- **File Uploads**: Multer for handling document uploads
- **Error Handling**: Structured error responses

## Data Flow

1. **Profile Management Flow**:
   - User creates/edits profiles through the form interface
   - API requests update the database
   - UI reflects changes via React Query cache updates

2. **Document Upload Flow**:
   - User uploads documents for specific profiles
   - Files are stored in the `/uploads` directory
   - Document metadata is saved in the database
   - Document list updates in real-time

3. **Profile Organization Flow**:
   - Profiles can be marked as favorites or archived
   - Dedicated views for all profiles, favorites, and archived profiles

## External Dependencies

### Frontend Dependencies
- `@tanstack/react-query`: Data fetching and caching
- `react-hook-form`: Form handling with validation
- Multiple `@radix-ui` components as the base for shadcn/ui
- `tailwindcss`: Utility-first CSS framework
- `zod`: Schema validation

### Backend Dependencies
- `express`: Web server framework
- `drizzle-orm`: TypeScript ORM
- `multer`: File upload handling
- `@neondatabase/serverless`: PostgreSQL connection

## Deployment Strategy
The application is configured for deployment on Replit with:

1. **Build Process**:
   - Frontend: Vite builds the React app to static assets
   - Backend: esbuild bundles the server code

2. **Database**:
   - Uses environment variable `DATABASE_URL` for connection
   - Drizzle ORM manages the schema and migrations

3. **Environment Configuration**:
   - Development mode: HMR and development features enabled
   - Production mode: Optimized bundles with minimal logging

## Getting Started

To set up the application:

1. Ensure PostgreSQL is provisioned and `DATABASE_URL` is set
2. Run `npm install` to install dependencies
3. Run `npm run db:push` to initialize the database schema
4. Run `npm run dev` to start the development server

To make database schema changes:
1. Modify the schema in `shared/schema.ts`
2. Run `npm run db:push` to update the database

## Troubleshooting

Common issues:
1. **Database Connection**: Ensure PostgreSQL is running and `DATABASE_URL` is correct
2. **File Uploads**: Verify the `uploads` directory exists and has write permissions
3. **Build Errors**: Check for TypeScript errors with `npm run check`