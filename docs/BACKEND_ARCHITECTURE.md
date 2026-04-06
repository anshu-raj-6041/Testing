# Backend Architecture

## Overview
KaryaSetu uses a serverless backend architecture powered by Supabase (PostgreSQL) and Clerk for authentication. The backend follows a service-oriented architecture with clear separation of concerns.

## Technology Stack

### Database
- **Supabase (PostgreSQL)** - Primary database
- **Row Level Security (RLS)** - Data access control
- **Realtime (Future)** - WebSocket for live updates

### Authentication & Authorization
- **Clerk** - User authentication and session management
- **Middleware** - Route protection and session validation
- **User ID mapping** - Clerk ID → Supabase user queries

### Backend Services
- **Supabase JavaScript Client** - Database operations
- **Service Layer** - Business logic abstraction
- **API Routes (Next.js)** - Server-side endpoints (if needed)

## Database Schema

### Tables

#### 1. **boards**
Stores board information.

```sql
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT 'bg-blue-500',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_boards_created_at ON boards(created_at DESC);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `user_id`: Clerk user ID (TEXT to match Clerk's format)
- `title`: Board name
- `description`: Optional board description
- `color`: Tailwind color class for UI
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

**Relationships:**
- One user has many boards
- One board has many columns

#### 2. **columns**
Stores column (list) information for Kanban boards.

```sql
CREATE TABLE columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_columns_sort_order ON columns(board_id, sort_order);
```

**Fields:**
- `id`: Unique identifier
- `board_id`: Foreign key to boards table
- `user_id`: Owner of the column (denormalized for RLS)
- `title`: Column name (e.g., "To Do", "In Progress")
- `sort_order`: Display order (0-based index)
- `created_at`: Timestamp of creation

**Relationships:**
- Many columns belong to one board
- One column has many tasks

#### 3. **tasks**
Stores individual task/card information.

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  column_id UUID NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee TEXT,
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_sort_order ON tasks(column_id, sort_order);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
```

**Fields:**
- `id`: Unique identifier
- `column_id`: Foreign key to columns table
- `title`: Task title
- `description`: Task description (nullable)
- `assignee`: Person assigned to task (nullable)
- `due_date`: Due date for task (nullable)
- `priority`: Task priority (low/medium/high)
- `sort_order`: Display order within column
- `created_at`: Timestamp of creation

**Relationships:**
- Many tasks belong to one column

### Database Triggers

#### Auto-update timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Row Level Security (RLS)

### Security Policies

#### Boards Table
```sql
-- Enable RLS
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;

-- Users can view their own boards
CREATE POLICY "Users can view own boards"
  ON boards FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own boards
CREATE POLICY "Users can create own boards"
  ON boards FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own boards
CREATE POLICY "Users can update own boards"
  ON boards FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own boards
CREATE POLICY "Users can delete own boards"
  ON boards FOR DELETE
  USING (user_id = auth.uid());
```

#### Columns Table
```sql
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;

-- Users can view columns of their boards
CREATE POLICY "Users can view own columns"
  ON columns FOR SELECT
  USING (user_id = auth.uid());

-- Users can create columns for their boards
CREATE POLICY "Users can create own columns"
  ON columns FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their columns
CREATE POLICY "Users can update own columns"
  ON columns FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their columns
CREATE POLICY "Users can delete own columns"
  ON columns FOR DELETE
  USING (user_id = auth.uid());
```

#### Tasks Table
```sql
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Users can view tasks in their columns
CREATE POLICY "Users can view own tasks"
  ON tasks FOR SELECT
  USING (
    column_id IN (
      SELECT id FROM columns WHERE user_id = auth.uid()
    )
  );

-- Users can create tasks in their columns
CREATE POLICY "Users can create own tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    column_id IN (
      SELECT id FROM columns WHERE user_id = auth.uid()
    )
  );

-- Users can update their tasks
CREATE POLICY "Users can update own tasks"
  ON tasks FOR UPDATE
  USING (
    column_id IN (
      SELECT id FROM columns WHERE user_id = auth.uid()
    )
  );

-- Users can delete their tasks
CREATE POLICY "Users can delete own tasks"
  ON tasks FOR DELETE
  USING (
    column_id IN (
      SELECT id FROM columns WHERE user_id = auth.uid()
    )
  );
```

## Service Layer Architecture

### Service Pattern
The service layer abstracts database operations and provides a clean API.

```typescript
// lib/services.ts

export const boardService = {
  async getBoards(supabase, userId): Promise<Board[]>
  async createBoard(supabase, board): Promise<Board>
  async updateBoard(supabase, id, updates): Promise<Board>
  async deleteBoard(supabase, id): Promise<void>
}

export const columnService = {
  async getColumns(supabase, boardId): Promise<Column[]>
  async createColumn(supabase, column): Promise<Column>
  async updateColumn(supabase, id, updates): Promise<Column>
  async deleteColumn(supabase, id): Promise<void>
}

export const taskService = {
  async getTasks(supabase, columnId): Promise<Task[]>
  async createTask(supabase, task): Promise<Task>
  async updateTask(supabase, id, updates): Promise<Task>
  async moveTask(supabase, taskId, newColumnId, newOrder): Promise<void>
  async deleteTask(supabase, id): Promise<void>
}

export const boardDataService = {
  async getBoardWithColumns(supabase, boardId): Promise<BoardData>
  async createBoardWithDefaultColumns(supabase, data): Promise<Board>
}
```

### Service Layer Benefits
1. **Abstraction** - Hide Supabase implementation details
2. **Testability** - Easy to mock for unit tests
3. **Consistency** - Uniform error handling
4. **Maintainability** - Single source of truth for queries

## Data Access Patterns

### 1. Simple CRUD Operations
```typescript
// Create
const { data, error } = await supabase
  .from('boards')
  .insert({ title, user_id })
  .select()
  .single();

// Read
const { data, error } = await supabase
  .from('boards')
  .select('*')
  .eq('user_id', userId);

// Update
const { data, error } = await supabase
  .from('boards')
  .update({ title, updated_at: new Date().toISOString() })
  .eq('id', boardId)
  .select()
  .single();

// Delete
const { error } = await supabase
  .from('boards')
  .delete()
  .eq('id', boardId);
```

### 2. Complex Queries with Joins
```typescript
// Get board with all columns and tasks
const { data, error } = await supabase
  .from('boards')
  .select(`
    *,
    columns (
      *,
      tasks (*)
    )
  `)
  .eq('id', boardId)
  .single();
```

### 3. Optimistic Updates
```typescript
// Update UI immediately
setColumns(optimisticColumns);

try {
  // Sync with database
  await taskService.moveTask(taskId, newColumnId, order);
} catch (error) {
  // Rollback on error
  setColumns(previousColumns);
}
```

## Authentication Flow

### Clerk Integration

```typescript
// middleware.ts
export default clerkMiddleware((auth, req) => {
  // Protect routes
  if (isProtectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Session Management
```typescript
// Get current user
const { userId } = auth();

// Create Supabase client with user context
const supabase = createClient();
```

## API Patterns

### Client-Side Data Fetching
```typescript
// Using custom hooks
const { board, columns, loading } = useBoard(boardId);

// Direct service calls
const boards = await boardService.getBoards(supabase, userId);
```

### Server Components (Future)
```typescript
// app/boards/[id]/page.tsx
export default async function BoardPage({ params }) {
  const supabase = createServerClient();
  const board = await boardService.getBoard(supabase, params.id);
  
  return <BoardView board={board} />;
}
```

## Caching Strategy

### Client-Side Caching
- React state for active data
- No persistent cache (future: React Query)

### Server-Side Caching (Future)
- Next.js cache for static data
- Revalidation strategies

## Real-Time Sync Strategy

### Current Implementation
- **Polling**: Manual refresh
- **Optimistic Updates**: Immediate UI feedback

### Future: Supabase Realtime
```typescript
// Subscribe to board changes
const channel = supabase
  .channel('board-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `column_id=in.(${columnIds.join(',')})`
    },
    (payload) => {
      handleRealtimeUpdate(payload);
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Conflict Resolution
```typescript
// Last-write-wins strategy
if (remoteUpdate.updated_at > localUpdate.updated_at) {
  applyRemoteUpdate(remoteUpdate);
} else {
  // Keep local version
}
```

## Error Handling

### Service Layer Errors
```typescript
try {
  const board = await boardService.updateBoard(supabase, id, updates);
  return board;
} catch (error) {
  if (error.code === 'PGRST116') {
    throw new Error('Board not found');
  }
  throw new Error('Failed to update board');
}
```

### Client Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

try {
  await updateBoard(boardId, updates);
  setError(null);
} catch (err) {
  setError(err.message);
  // Show error UI
}
```

## Security Considerations

### 1. Authentication
- All routes protected by Clerk middleware
- No anonymous access to data

### 2. Authorization
- RLS policies enforce user-level access
- User can only access their own data

### 3. Input Validation
```typescript
// Validate on client and server
if (!title.trim()) {
  throw new Error('Title is required');
}

if (title.length > 255) {
  throw new Error('Title too long');
}
```

### 4. SQL Injection Prevention
- Supabase client uses parameterized queries
- No raw SQL execution from client

### 5. Rate Limiting (Future)
- Supabase built-in rate limiting
- Custom rate limiting for heavy operations

## Scalability Considerations

### Database Optimization
1. **Indexes** - Proper indexing for frequent queries
2. **Connection Pooling** - Supabase handles automatically
3. **Query Optimization** - Minimize N+1 queries

### Horizontal Scaling
- **Supabase** - Automatic scaling
- **Serverless** - Next.js scales with traffic
- **CDN** - Static assets on edge

### Performance Monitoring
```typescript
// Track query performance
const start = Date.now();
await supabase.from('boards').select('*');
const duration = Date.now() - start;
console.log(`Query took ${duration}ms`);
```

### Load Testing Recommendations
- **Target**: 100 concurrent users
- **Response Time**: <200ms for queries
- **Database**: Monitor connection pool usage

## Backup & Recovery

### Automated Backups (Supabase)
- Daily backups (Pro plan)
- Point-in-time recovery
- 30-day retention

### Data Export
```typescript
// Export user data
const boards = await boardService.getBoards(supabase, userId);
const json = JSON.stringify(boards, null, 2);
downloadFile('boards.json', json);
```

## API Versioning (Future)

### URL Versioning
```
/api/v1/boards
/api/v2/boards
```

### Header Versioning
```
Accept: application/vnd.karyasetu.v1+json
```

## Monitoring & Logging

### Current Logging
```typescript
console.log('Updating board:', { id, title });
console.error('Failed to update board:', error);
```

### Future: Structured Logging
```typescript
logger.info('board.update', {
  boardId,
  userId,
  changes: updates,
  timestamp: new Date().toISOString()
});
```

### Performance Metrics
- API response times
- Database query duration
- Error rates
- User activity

## Testing Strategy

### Unit Tests
```typescript
describe('boardService', () => {
  it('should create a board', async () => {
    const board = await boardService.createBoard(mockSupabase, data);
    expect(board.title).toBe('Test Board');
  });
});
```

### Integration Tests
```typescript
describe('Board CRUD', () => {
  it('should handle full lifecycle', async () => {
    const board = await createBoard();
    const updated = await updateBoard(board.id, { title: 'New' });
    await deleteBoard(board.id);
  });
});
```

## Future Enhancements

1. **GraphQL API** - More efficient data fetching
2. **Redis Cache** - Session and query caching
3. **Message Queue** - Background job processing
4. **Webhooks** - External integrations
5. **API Rate Limiting** - Per-user quotas
6. **Audit Logging** - Track all data changes
7. **Multi-tenancy** - Team/organization support
