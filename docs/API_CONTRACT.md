# API Contract Design

## Overview
KaryaSetu uses a service-oriented architecture where the frontend communicates with Supabase through a well-defined service layer. This document outlines all API contracts, request/response formats, and error handling.

## Service Layer Architecture

### Service Files Location
```
lib/
└── services.ts    # All service implementations
```

## Board Services

### 1. Get All Boards
**Purpose**: Retrieve all boards for the authenticated user

**Method**: `boardService.getBoards()`

**Request**:
```typescript
async function getBoards(
  supabase: SupabaseClient,
  userId: string
): Promise<Board[]>
```

**Parameters**:
- `supabase`: Authenticated Supabase client
- `userId`: Clerk user identifier

**Response**:
```typescript
Array<{
  id: string;              // UUID
  user_id: string;         // Clerk user ID
  title: string;           // Board name
  description: string | null;  // Optional description
  color: string;           // Tailwind CSS class
  created_at: string;      // ISO 8601 timestamp
  updated_at: string;      // ISO 8601 timestamp
  totalTasks?: number;     // Optional computed field
}>
```

**Example**:
```typescript
const boards = await boardService.getBoards(supabase, userId);
// Returns: [{ id: "abc-123", title: "My Board", color: "bg-blue-500", ... }]
```

**Error Codes**:
- `PGRST116`: No boards found (empty array returned)
- `PGRST301`: Authentication error

---

### 2. Get Single Board
**Purpose**: Retrieve a specific board by ID

**Method**: `boardService.getBoard()`

**Request**:
```typescript
async function getBoard(
  supabase: SupabaseClient,
  boardId: string
): Promise<Board>
```

**Response**: Same as single board object from getBoards

**Error Codes**:
- `PGRST116`: Board not found
- `PGRST301`: Unauthorized access

---

### 3. Create Board
**Purpose**: Create a new board

**Method**: `boardService.createBoard()`

**Request**:
```typescript
async function createBoard(
  supabase: SupabaseClient,
  board: Omit<Board, "id" | "created_at" | "updated_at">
): Promise<Board>
```

**Input**:
```typescript
{
  title: string;              // Required, min 1 char
  description: string | null;  // Optional
  color: string;              // Tailwind class, default: "bg-blue-500"
  user_id: string;            // Required, Clerk user ID
}
```

**Response**: Created board object with generated `id` and timestamps

**Example**:
```typescript
const newBoard = await boardService.createBoard(supabase, {
  title: "New Project",
  description: "Q1 Goals",
  color: "bg-purple-500",
  user_id: userId
});
```

**Error Codes**:
- `PGRST301`: Authentication error
- `23505`: Duplicate constraint violation

---

### 4. Update Board
**Purpose**: Update an existing board

**Method**: `boardService.updateBoard()`

**Request**:
```typescript
async function updateBoard(
  supabase: SupabaseClient,
  boardId: string,
  updates: Partial<Board>
): Promise<Board>
```

**Input** (all fields optional):
```typescript
{
  title?: string;
  description?: string | null;
  color?: string;
}
```

**Response**: Updated board object

**Example**:
```typescript
const updated = await boardService.updateBoard(supabase, boardId, {
  title: "Updated Title",
  color: "bg-red-500"
});
```

**Error Codes**:
- `PGRST116`: Board not found
- `PGRST301`: Unauthorized

---

### 5. Delete Board
**Purpose**: Delete a board (cascades to columns and tasks)

**Method**: `boardService.deleteBoard()`

**Request**:
```typescript
async function deleteBoard(
  supabase: SupabaseClient,
  boardId: string
): Promise<void>
```

**Response**: `void` (no return value on success)

**Error Codes**:
- `PGRST116`: Board not found
- `PGRST301`: Unauthorized

---

## Column Services

### 1. Get Columns
**Purpose**: Get all columns for a board

**Method**: `columnService.getColumns()`

**Request**:
```typescript
async function getColumns(
  supabase: SupabaseClient,
  boardId: string
): Promise<Column[]>
```

**Response**:
```typescript
Array<{
  id: string;              // UUID
  board_id: string;        // Foreign key to board
  user_id: string;         // Clerk user ID
  title: string;           // Column name (e.g., "To Do")
  sort_order: number;      // Display order (0-based)
  created_at: string;      // ISO 8601 timestamp
}>
```

**Example**:
```typescript
const columns = await columnService.getColumns(supabase, boardId);
// Returns: [{ id: "col-1", title: "To Do", sort_order: 0, ... }]
```

---

### 2. Create Column
**Purpose**: Add a new column to a board

**Method**: `columnService.createColumn()`

**Request**:
```typescript
async function createColumn(
  supabase: SupabaseClient,
  column: Omit<Column, "id" | "created_at">
): Promise<Column>
```

**Input**:
```typescript
{
  board_id: string;    // Required
  user_id: string;     // Required
  title: string;       // Required
  sort_order: number;  // Required
}
```

**Example**:
```typescript
const column = await columnService.createColumn(supabase, {
  board_id: boardId,
  user_id: userId,
  title: "In Progress",
  sort_order: 1
});
```

---

### 3. Update Column
**Purpose**: Update column properties

**Method**: `columnService.updateColumn()`

**Request**:
```typescript
async function updateColumn(
  supabase: SupabaseClient,
  columnId: string,
  updates: Partial<Column>
): Promise<Column>
```

**Input**:
```typescript
{
  title?: string;
  sort_order?: number;
}
```

---

### 4. Delete Column
**Purpose**: Delete a column (cascades to tasks)

**Method**: `columnService.deleteColumn()`

**Request**:
```typescript
async function deleteColumn(
  supabase: SupabaseClient,
  columnId: string
): Promise<void>
```

---

## Task Services

### 1. Get Tasks
**Purpose**: Get all tasks in a column

**Method**: `taskService.getTasks()`

**Request**:
```typescript
async function getTasks(
  supabase: SupabaseClient,
  columnId: string
): Promise<Task[]>
```

**Response**:
```typescript
Array<{
  id: string;                  // UUID
  column_id: string;           // Foreign key to column
  title: string;               // Task title
  description: string | null;  // Task description
  assignee: string | null;     // Assigned user
  due_date: string | null;     // ISO date (YYYY-MM-DD)
  priority: "low" | "medium" | "high";
  sort_order: number;          // Display order
  created_at: string;          // ISO 8601 timestamp
}>
```

---

### 2. Create Task
**Purpose**: Add a new task to a column

**Method**: `taskService.createTask()`

**Request**:
```typescript
async function createTask(
  supabase: SupabaseClient,
  task: Omit<Task, "id" | "created_at">
): Promise<Task>
```

**Input**:
```typescript
{
  column_id: string;                    // Required
  title: string;                        // Required
  description: string | null;           // Optional
  assignee: string | null;              // Optional
  due_date: string | null;              // Optional (YYYY-MM-DD)
  priority: "low" | "medium" | "high";  // Default: "medium"
  sort_order: number;                   // Required
}
```

**Example**:
```typescript
const task = await taskService.createTask(supabase, {
  column_id: "col-123",
  title: "Fix navbar bug",
  description: "Color not updating on save",
  assignee: "@johndoe",
  due_date: "2026-07-20",
  priority: "high",
  sort_order: 0
});
```

**Validation**:
- `title`: Min 1 character
- `priority`: Must be "low", "medium", or "high"
- `due_date`: Must be valid ISO date format

---

### 3. Update Task
**Purpose**: Update task properties

**Method**: `taskService.updateTask()`

**Request**:
```typescript
async function updateTask(
  supabase: SupabaseClient,
  taskId: string,
  updates: Partial<Task>
): Promise<Task>
```

**Input** (all optional):
```typescript
{
  title?: string;
  description?: string | null;
  assignee?: string | null;
  due_date?: string | null;
  priority?: "low" | "medium" | "high";
  sort_order?: number;
}
```

---

### 4. Move Task
**Purpose**: Move a task to a different column and/or position

**Method**: `taskService.moveTask()`

**Request**:
```typescript
async function moveTask(
  supabase: SupabaseClient,
  taskId: string,
  newColumnId: string,
  newSortOrder: number
): Promise<void>
```

**Parameters**:
- `taskId`: Task to move
- `newColumnId`: Target column
- `newSortOrder`: New position (0-based)

**Example**:
```typescript
// Move task to "In Progress" column at position 2
await taskService.moveTask(supabase, taskId, inProgressColumnId, 2);
```

**Business Logic**:
1. Update task's `column_id` to new column
2. Update task's `sort_order` to new position
3. Reorder other tasks in both source and target columns (handled by client)

---

### 5. Delete Task
**Purpose**: Delete a task

**Method**: `taskService.deleteTask()`

**Request**:
```typescript
async function deleteTask(
  supabase: SupabaseClient,
  taskId: string
): Promise<void>
```

---

## Composite Services

### 1. Get Board with Columns
**Purpose**: Get a board with all its columns in one query

**Method**: `boardDataService.getBoardWithColumns()`

**Request**:
```typescript
async function getBoardWithColumns(
  supabase: SupabaseClient,
  boardId: string
): Promise<{
  board: Board;
  columnsWithTasks: ColumnWithTasks[];
}>
```

**Response**:
```typescript
{
  board: {
    id: string;
    title: string;
    description: string | null;
    color: string;
    user_id: string;
    created_at: string;
    updated_at: string;
  },
  columnsWithTasks: Array<{
    id: string;
    board_id: string;
    user_id: string;
    title: string;
    sort_order: number;
    created_at: string;
    tasks: Task[];  // Array of tasks in this column
  }>
}
```

**Example**:
```typescript
const { board, columnsWithTasks } = await boardDataService.getBoardWithColumns(
  supabase,
  boardId
);

// Access board: board.title
// Access columns: columnsWithTasks[0].title
// Access tasks: columnsWithTasks[0].tasks[0].title
```

---

### 2. Create Board with Default Columns
**Purpose**: Create a board pre-populated with standard columns

**Method**: `boardDataService.createBoardWithDefaultColumns()`

**Request**:
```typescript
async function createBoardWithDefaultColumns(
  supabase: SupabaseClient,
  boardData: {
    title: string;
    description?: string;
    color?: string;
    userId: string;
  }
): Promise<Board>
```

**Default Columns Created**:
1. "To Do" (sort_order: 0)
2. "In Progress" (sort_order: 1)
3. "Review" (sort_order: 2)
4. "Done" (sort_order: 3)

**Example**:
```typescript
const board = await boardDataService.createBoardWithDefaultColumns(supabase, {
  title: "New Project",
  description: "Q1 goals",
  color: "bg-purple-500",
  userId: userId
});
// Creates board + 4 default columns
```

---

## Error Handling

### Standard Error Response
```typescript
{
  error: {
    code: string;      // Error code (e.g., "PGRST116")
    message: string;   // Human-readable message
    details: string;   // Technical details
    hint: string;      // Suggestion for fixing
  }
}
```

### Common Error Codes

| Code      | Meaning                  | HTTP Status | Action                    |
|-----------|--------------------------|-------------|---------------------------|
| PGRST116  | Not found                | 404         | Show "not found" message  |
| PGRST301  | Unauthorized             | 401         | Redirect to login         |
| 23503     | Foreign key violation    | 409         | Show validation error     |
| 23505     | Unique violation         | 409         | Show "already exists"     |
| 23502     | Not null violation       | 400         | Show required field error |
| PGRST000  | Generic database error   | 500         | Show retry option         |

### Error Handling Pattern

```typescript
try {
  const board = await boardService.updateBoard(supabase, id, updates);
  return board;
} catch (error) {
  if (error.code === 'PGRST116') {
    throw new Error('Board not found');
  } else if (error.code === 'PGRST301') {
    throw new Error('Unauthorized access');
  } else {
    throw new Error('Failed to update board. Please try again.');
  }
}
```

---

## Request/Response Examples

### Complete Board CRUD Workflow

```typescript
// 1. Create board
const board = await boardService.createBoard(supabase, {
  title: "Website Redesign",
  description: "Q1 2026 project",
  color: "bg-purple-500",
  user_id: userId
});
// Response: { id: "abc-123", title: "Website Redesign", ... }

// 2. Add columns
const column1 = await columnService.createColumn(supabase, {
  board_id: board.id,
  user_id: userId,
  title: "To Do",
  sort_order: 0
});

// 3. Add task
const task = await taskService.createTask(supabase, {
  column_id: column1.id,
  title: "Create homepage mockup",
  description: "Design in Figma",
  assignee: "@designer",
  due_date: "2026-08-01",
  priority: "high",
  sort_order: 0
});

// 4. Move task to different column
await taskService.moveTask(supabase, task.id, column2.id, 0);

// 5. Update task
const updated = await taskService.updateTask(supabase, task.id, {
  priority: "medium",
  assignee: "@developer"
});

// 6. Get full board data
const { board, columnsWithTasks } = await boardDataService.getBoardWithColumns(
  supabase,
  board.id
);

// 7. Delete task
await taskService.deleteTask(supabase, task.id);

// 8. Delete board (cascades to columns and tasks)
await boardService.deleteBoard(supabase, board.id);
```

---

## Request Validation

### Client-Side Validation
```typescript
function validateTaskCreate(data: TaskInput): ValidationResult {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Title is required");
  }
  
  if (data.title && data.title.length > 255) {
    errors.push("Title must be less than 255 characters");
  }
  
  if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push("Invalid priority value");
  }
  
  if (data.due_date && !isValidDate(data.due_date)) {
    errors.push("Invalid date format");
  }
  
  return { valid: errors.length === 0, errors };
}
```

### Server-Side Validation
Database constraints automatically enforce:
- NOT NULL constraints
- CHECK constraints (priority values, string lengths)
- Foreign key integrity
- Unique constraints

---

## Rate Limiting

### Supabase Limits (Default)
- **Requests per second**: ~100 (varies by plan)
- **Connection pool**: 15 connections (Free tier)
- **Row limit**: 10,000 rows per query

### Recommended Client-Side Throttling
```typescript
// Debounce rapid updates
const debouncedUpdate = debounce(
  (id, updates) => taskService.updateTask(supabase, id, updates),
  500
);

// Rate limit API calls
const rateLimitedFetch = rateLimit(
  () => boardService.getBoards(supabase, userId),
  1000 // Max 1 call per second
);
```

---

## Caching Strategy

### Client-Side Caching
```typescript
// Cache boards list
const useBoards = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const fetchBoards = async () => {
    const now = Date.now();
    const cacheAge = now - lastFetch;
    
    // Cache for 5 minutes
    if (cacheAge < 300000 && boards.length > 0) {
      return boards;
    }
    
    const data = await boardService.getBoards(supabase, userId);
    setBoards(data);
    setLastFetch(now);
    return data;
  };
  
  return { boards, fetchBoards };
};
```

---

## Real-Time Sync (Future Implementation)

### WebSocket Events

**Event Format**:
```typescript
{
  event: "INSERT" | "UPDATE" | "DELETE";
  table: "boards" | "columns" | "tasks";
  record: any;
  old_record?: any;
}
```

**Subscription Example**:
```typescript
const subscription = supabase
  .channel('board-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'tasks'
    },
    (payload) => {
      console.log('Change received!', payload);
      handleRealtimeUpdate(payload);
    }
  )
  .subscribe();
```

**Event Handlers**:
```typescript
function handleRealtimeUpdate(payload) {
  switch (payload.eventType) {
    case 'INSERT':
      addTaskToUI(payload.new);
      break;
    case 'UPDATE':
      updateTaskInUI(payload.new);
      break;
    case 'DELETE':
      removeTaskFromUI(payload.old.id);
      break;
  }
}
```

---

## API Versioning (Future)

### Version Strategy
- **URL versioning**: `/api/v1/boards`, `/api/v2/boards`
- **Header versioning**: `Accept: application/vnd.karyasetu.v1+json`

### Backward Compatibility
- Maintain old versions for 6 months after deprecation
- Clear migration guides for breaking changes
- Deprecation warnings in responses

---

## Security Headers

### Required Headers
```typescript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <supabase-anon-key>",
  "apikey": "<supabase-anon-key>"
}
```

### Supabase Client Setup
```typescript
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## Performance Benchmarks

### Target Response Times
| Operation          | Target    | Acceptable |
|--------------------|-----------|------------|
| Get Boards         | < 100ms   | < 300ms    |
| Get Board + Columns| < 150ms   | < 500ms    |
| Create Task        | < 200ms   | < 600ms    |
| Update Task        | < 150ms   | < 400ms    |
| Move Task (DnD)    | < 200ms   | < 500ms    |

### Query Optimization
- Use indexed columns in WHERE clauses
- Limit result sets with pagination
- Batch operations when possible
- Use select() to fetch only needed fields

```typescript
// ✅ Good: Select specific fields
const boards = await supabase
  .from('boards')
  .select('id, title, color')
  .eq('user_id', userId);

// ❌ Bad: Select all fields when not needed
const boards = await supabase
  .from('boards')
  .select('*')
  .eq('user_id', userId);
```
