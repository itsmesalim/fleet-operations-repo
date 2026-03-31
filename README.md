# Fleet Management Dashboard

A production-level, enterprise-grade Operations & Fleet Management Dashboard built with React, TypeScript, and Supabase.

## Features

### Core Features

- **Authentication System**
  - Email/password authentication with Supabase Auth
  - Role-based access control (Admin, Manager, Operator)
  - Protected routes and session management
  - User profile management

- **Fleet & Route Management**
  - Comprehensive route listing with expandable rows
  - Nested vehicle details view
  - Advanced filtering and search
  - Real-time status tracking
  - Route assignment to managers

- **Team Assignment (Drag & Drop)**
  - Intuitive drag-and-drop interface
  - Assign teams to routes
  - Real-time team status updates
  - Team member management
  - Optimistic UI updates

- **Orders Management (Drag & Drop)**
  - Drag-and-drop order assignment
  - Priority tagging (High, Medium, Low)
  - Bulk actions (delete multiple orders)
  - Order status tracking
  - Delivery date management

- **Analytics Dashboard**
  - Real-time KPI cards
  - Interactive charts (Line, Bar, Pie)
  - Delivery trend analysis
  - Revenue tracking
  - Resource utilization metrics

- **Notifications System**
  - Toast notifications for user actions
  - Auto-dismiss functionality
  - Multiple notification types (success, error, warning, info)
  - Real-time updates

### Advanced Features

- **Undo/Redo Functionality**
  - Activity logging for all major actions
  - Undo/Redo buttons in navbar
  - Persistent action history
  - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

- **Dark/Light Mode**
  - Toggle between themes
  - System preference detection
  - Persistent theme selection
  - Smooth transitions

- **Offline Support**
  - React Query caching
  - Optimistic updates
  - Background synchronization

- **Loading States**
  - Skeleton loaders for better UX
  - Progressive loading
  - Shimmer effects

- **Error Handling**
  - Error boundary component
  - Graceful error recovery
  - User-friendly error messages

- **Code Splitting**
  - Lazy loading for routes
  - Optimized bundle size
  - Fast initial load time

- **Responsive Design**
  - Mobile-first approach
  - Tablet and desktop optimized
  - Collapsible sidebar
  - Touch-friendly interactions

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Drag & Drop**: React DnD
- **Charts**: Recharts
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth)
- **HTTP Client**: Axios

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Sidebar, Navbar)
│   ├── orders/          # Order-specific components
│   ├── teams/           # Team-specific components
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   ├── ErrorBoundary.tsx
│   └── ProtectedRoute.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── hooks/               # Custom hooks
│   ├── useAnalytics.ts
│   ├── useOrders.ts
│   ├── useRoutes.ts
│   └── useTeams.ts
├── lib/                 # Third-party library configurations
│   └── supabase.ts
├── pages/               # Page components
│   ├── Analytics.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   ├── Orders.tsx
│   ├── Register.tsx
│   ├── Routes.tsx
│   ├── Settings.tsx
│   └── Teams.tsx
├── store/               # Global state management
│   └── useStore.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── helpers.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles

```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fleet-management-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To get your Supabase credentials:**

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Project Settings > API
3. Copy the Project URL and anon/public key
4. Paste them into your `.env` file

### 4. Set Up Database

The database schema is already included in the project. To apply it:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file from `supabase/migrations/` (if provided)

   Or use the Supabase CLI to apply migrations automatically.

### 5. Create Sample Users

You can create users through the registration page, or directly in Supabase:

```sql
-- Example: Create an admin user
-- First, sign up through the app or Supabase Auth
-- Then add a profile record:
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'user-id-from-auth-users',
  'admin@fleet.com',
  'Admin User',
  'Admin'
);
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 7. Build for Production

```bash
npm run build
npm run preview  # Preview the production build
```

## Demo Credentials

For testing purposes, create these users:

- **Admin**: admin@fleet.com / password123
- **Manager**: manager@fleet.com / password123
- **Operator**: operator@fleet.com / password123

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Key Features Explained

### Drag and Drop

The application uses React DnD for intuitive drag-and-drop functionality:

- **Teams**: Drag teams between routes or to the unassigned zone
- **Orders**: Drag orders to assign them to routes or unassign them
- **Visual Feedback**: Drop zones highlight when dragging
- **Undo Support**: All drag operations can be undone

### State Management

- **Global State**: Zustand for theme, auth, notifications, and undo/redo
- **Server State**: React Query for API data with caching
- **Local State**: React useState for component-specific state

### API Integration

All API calls go through Supabase:
- Real-time subscriptions available
- Row Level Security (RLS) enforced
- Automatic error handling
- Optimistic updates for better UX

### Performance Optimizations

- React Query caching reduces API calls
- Code splitting for faster initial load
- Debounced search inputs
- Memoized expensive computations
- Lazy loading for routes

## Database Schema

### Main Tables

- **profiles** - User profiles with roles
- **routes** - Delivery routes
- **vehicles** - Fleet vehicles
- **teams** - Work teams
- **team_members** - Team membership
- **orders** - Customer orders
- **activity_logs** - Action history for undo/redo
- **notifications** - User notifications
- **analytics_daily** - Daily performance metrics

### Security

Row Level Security (RLS) is enabled on all tables with policies based on user roles:

- **Admin**: Full access to all data
- **Manager**: Can view and edit assigned routes
- **Operator**: Read-only access to assigned routes

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for your portfolio or commercial applications.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation
- Review the code comments

## Acknowledgments

- Built with modern React best practices
- Follows enterprise-grade architecture patterns
- Optimized for performance and scalability
- Production-ready code quality

---

**Ready to showcase in your professional portfolio!**
