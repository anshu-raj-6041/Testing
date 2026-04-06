# Frontend Architecture

## Overview
KaryaSetu is a modern Trello clone built with Next.js 15, featuring a component-based architecture with TypeScript for type safety and React 19 for optimal performance.

## Technology Stack

### Core Framework
- **Next.js 15.5.2** - React framework with App Router
- **React 19.1.0** - UI library with React Server Components
- **TypeScript** - Static type checking
- **Turbopack** - Next-generation bundler for faster builds

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Icon library
- **class-variance-authority** - Type-safe component variants
- **clsx & tailwind-merge** - Dynamic className handling

### State Management & Data Fetching
- **React Hooks** - useState, useEffect, custom hooks
- **Client-side State** - Component-level state management
- **Server Components** - Data fetching at component level

### Drag & Drop
- **@dnd-kit/core** - Modern drag and drop toolkit
- **@dnd-kit/sortable** - Sortable components
- **@dnd-kit/utilities** - Utility functions for DnD

### Authentication
- **Clerk** - Complete user authentication and management

## Directory Structure

```
app/
├── (auth)/              # Authentication routes
│   ├── sign-in/         # Sign-in page
│   └── sign-up/         # Sign-up page
├── boards/[id]/         # Dynamic board pages
├── dashboard/           # Dashboard layout & page
├── pricing/             # Pricing page
├── layout.tsx           # Root layout
├── page.tsx             # Home page
├── not-found.tsx        # 404 page
└── globals.css          # Global styles

components/
├── common/              # Shared components
│   ├── BaseDialog.tsx   # Reusable dialog wrapper
│   └── Error.tsx        # Error state component
├── layout/              # Layout components
│   ├── Footer.tsx       # Site footer
│   └── Navbar.tsx       # Navigation bar
├── page-partial/        # Page-specific components
│   ├── home/            # Homepage sections
│   └── not-found/       # 404 page content
├── skeletons/           # Loading skeletons
│   ├── BoardColumns.tsx
│   ├── BoardHeader.tsx
│   ├── Boards.tsx
│   ├── DashboardHeader.tsx
│   └── Stats.tsx
└── ui/                  # UI primitives (Radix UI based)
    ├── badge.tsx
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── input.tsx
    ├── label.tsx
    ├── select.tsx
    └── textarea.tsx

features/
├── auth/                # Authentication feature
│   └── components/
├── boards/              # Board management feature
│   ├── components/      # Board-specific components
│   │   ├── Board.tsx                # Main board container
│   │   ├── BoardColumns.tsx         # Columns grid
│   │   ├── BoardHeader.tsx          # Board header
│   │   ├── CreateColumnDialog.tsx   # Add column modal
│   │   ├── CreateTaskDialog.tsx     # Add task modal
│   │   ├── DeleteColumnDialog.tsx   # Delete column confirmation
│   │   ├── DeleteTaskDialog.tsx     # Delete task confirmation
│   │   ├── DroppableColumn.tsx      # Drag & drop column
│   │   ├── EditBoardDialog.tsx      # Edit board modal
│   │   ├── EditColumnDialog.tsx     # Edit column modal
│   │   ├── FilterDialog.tsx         # Filter tasks modal
│   │   ├── SortableTask.tsx         # Draggable task card
│   │   └── TaskOverlay.tsx          # Drag overlay
│   ├── constants/       # Constants & configs
│   ├── hooks/           # Custom hooks
│   │   └── useBoard.ts  # Board state management
│   └── utils/           # Utility functions
├── dashboard/           # Dashboard feature
│   ├── components/      # Dashboard components
│   │   ├── BoardsSection.tsx        # Boards grid
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── DashboardHeader.tsx      # Dashboard header
│   │   ├── FilterDialog.tsx         # Filter boards
│   │   ├── StatsSection.tsx         # Statistics display
│   │   └── UpgradeDialog.tsx        # Upgrade prompt
│   ├── contexts/        # Context providers
│   │   └── PlanContext.tsx          # User plan context
│   └── hooks/           # Dashboard hooks
│       ├── useBoards.ts # Boards management
│       └── usePlan.ts   # Plan management
└── pricing/             # Pricing feature
    └── components/

lib/
├── contexts/            # Global contexts (deprecated)
├── hooks/               # Global hooks
├── supabase/            # Supabase integration
│   ├── client.ts        # Client-side Supabase
│   ├── server.ts        # Server-side Supabase
│   ├── models.ts        # TypeScript interfaces
│   └── SupabaseProvider.tsx  # Context provider
├── services.ts          # API service layer
└── utils.ts             # Utility functions
```

## Architecture Patterns

### 1. Feature-Based Organization
The codebase is organized by features (boards, dashboard, auth) rather than technical layers, enabling:
- **Better scalability** - Easy to add new features
- **Code colocation** - Related code stays together
- **Team collaboration** - Teams can work on isolated features

### 2. Component Hierarchy

```
Page Component (Server Component)
  └── Feature Container (Client Component)
      ├── Layout Components
      ├── Feature-specific Components
      │   ├── Presentational Components
      │   └── Container Components
      └── UI Primitives (Radix UI)
```

### 3. Server vs Client Components

**Server Components** (default):
- Page layouts (`layout.tsx`)
- Static pages (`page.tsx` without client interaction)
- Data fetching at page level

**Client Components** (`"use client"`):
- Interactive components (boards, tasks)
- Components using hooks (useState, useEffect)
- Event handlers and user interactions
- Drag and drop functionality

### 4. Custom Hooks Pattern

**useBoard Hook** - Manages board state and operations:
```typescript
export function useBoard(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  
  // CRUD operations
  async function updateBoard() { }
  async function createColumn() { }
  async function moveTask() { }
  
  return { 
    board, 
    columns, 
    loading, 
    updateBoard, 
    createColumn, 
    moveTask 
  };
}
```

**useBoards Hook** - Manages multiple boards:
```typescript
export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([]);
  
  async function createBoard() { }
  async function refetch() { }
  
  return { boards, createBoard, refetch };
}
```

## Data Flow

### 1. Authentication Flow
```
User Action → Clerk Auth → Middleware Check → Protected Route
                                ↓
                          Supabase User ID
                                ↓
                          Data Queries
```

### 2. Board Data Flow
```
Page Load → useBoard Hook → Supabase Query → State Update
                                                  ↓
User Action → Service Layer → Supabase API → Hook Update → UI Re-render
```

### 3. Real-time Updates (Future Enhancement)
```
Supabase Realtime → WebSocket Connection → Event Handler → State Update → UI
```

## Component Communication

### Props Down, Events Up
- Parent components pass data via props
- Child components emit events via callbacks
- State is lifted to appropriate parent level

### Dialog Pattern
All dialogs follow a consistent pattern:
```typescript
interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  // ... specific props
}
```

## Styling Strategy

### Tailwind CSS Utility-First
- Responsive design with mobile-first approach
- Custom design tokens in `globals.css`
- Component variants using `class-variance-authority`

### Responsive Breakpoints
- `sm:` - 640px (tablets)
- `md:` - 768px (small laptops)
- `lg:` - 1024px (desktops)
- `xl:` - 1280px (large screens)

## Performance Optimizations

### 1. Code Splitting
- Automatic code splitting by Next.js
- Dynamic imports for heavy components
- Route-based code splitting

### 2. Image Optimization
- Next.js Image component (when used)
- Lazy loading
- Responsive images

### 3. Bundle Optimization
- Turbopack for faster builds
- Tree shaking of unused code
- Minification in production

### 4. Rendering Strategies
- **Server Components** for static content
- **Client Components** only when needed
- Streaming with Suspense boundaries

## State Management Strategy

### Local State (useState)
- Component-specific UI state
- Form inputs
- Toggle states

### Custom Hooks
- Feature-level state (useBoard, useBoards)
- Shared logic across components
- Side effects management

### Context API
- Authentication state (Clerk)
- Supabase client provider
- Theme/plan context

## Error Handling

### Error Boundaries
```typescript
<ErrorState
  title="Error loading board"
  message={error}
  onRetry={() => reload()}
  retryText="Reload board"
/>
```

### Loading States
- Skeleton components for smooth UX
- Loading spinners for actions
- Optimistic UI updates

## Accessibility

### Radix UI Primitives
- ARIA attributes built-in
- Keyboard navigation
- Focus management
- Screen reader support

### Best Practices
- Semantic HTML
- Alt text for images
- Form labels
- Color contrast compliance

## Type Safety

### TypeScript Interfaces
```typescript
interface Board {
  id: string;
  title: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  // ...
}
```

### Strict Mode
- Type checking enabled
- No implicit any
- Strict null checks

## Build & Deployment

### Development
```bash
npm run dev    # Development server with Turbopack
```

### Production
```bash
npm run build  # Production build
npm start      # Start production server
```

### Environment Variables
- `.env.local` for local development
- Clerk API keys
- Supabase URL and anon key

## Future Enhancements

1. **State Management Library**
   - Consider Zustand or Jotai for complex state
   
2. **Real-time Collaboration**
   - Supabase Realtime subscriptions
   - Optimistic updates with conflict resolution
   
3. **Offline Support**
   - Service workers
   - IndexedDB for local storage
   
4. **Testing**
   - Jest for unit tests
   - React Testing Library
   - Playwright for E2E tests

5. **Performance Monitoring**
   - Web Vitals tracking
   - Error tracking (Sentry)
   - Analytics integration
