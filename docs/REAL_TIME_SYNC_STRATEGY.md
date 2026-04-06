# Real-Time Sync Strategy

## Overview

This document outlines the real-time synchronization strategy for KaryaSetu, covering current optimistic update implementation and future WebSocket-based real-time collaboration features.

---

## Table of Contents
1. [Current Implementation](#current-implementation)
2. [Optimistic Updates](#optimistic-updates)
3. [Future: Real-Time Collaboration](#future-real-time-collaboration)
4. [WebSocket Integration](#websocket-integration)
5. [Conflict Resolution](#conflict-resolution)
6. [Performance Optimization](#performance-optimization)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Current Implementation

### Architecture
KaryaSetu currently uses **optimistic updates** for instant UI feedback combined with server-side state reconciliation.

```
User Action (Client)
        ↓
Immediate UI Update (Optimistic)
        ↓
API Call to Supabase
        ↓
Server Validation & Persistence
        ↓
Response → UI Reconciliation
```

### Use Cases
1. **Drag-and-drop tasks**: Immediate visual feedback
2. **Create/Update/Delete operations**: Instant UI changes
3. **Board navigation**: Fast page transitions
4. **Filter application**: Immediate result showing

---

## Optimistic Updates

### Pattern Implementation

```typescript
// Example: Moving a task optimistically
const handleMoveTask = async (taskId: string, targetColumnId: string) => {
  // 1. Store current state for rollback
  const previousState = [...tasks];
  
  try {
    // 2. Optimistically update UI
    setTasks(prevTasks => {
      return prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, column_id: targetColumnId }
          : task
      );
    });
    
    // 3. Make API call
    await taskService.moveTask(supabase, taskId, targetColumnId, newOrder);
    
    // 4. Success - state already updated optimistically
    
  } catch (error) {
    // 5. Rollback on error
    setTasks(previousState);
    toast.error('Failed to move task. Please try again.');
  }
};
```

### Benefits
✅ **Instant feedback**: Users see changes immediately  
✅ **Better UX**: No waiting for server responses  
✅ **Offline resilience**: Works even with slow connections  
✅ **Reduced perceived latency**: Feels faster than it is

### Limitations
❌ **No multi-user sync**: Changes from other users not reflected  
❌ **Potential conflicts**: Two users editing same data  
❌ **Manual refresh needed**: To see others' changes  
❌ **Rollback complexity**: Undoing optimistic updates

---

## Future: Real-Time Collaboration

### Vision
Enable multiple users to collaborate on the same board simultaneously with live updates.

### Target Features
1. **Live cursor tracking**: See where team members are working
2. **Instant updates**: Changes appear in real-time
3. **Presence indicators**: Who's viewing the board
4. **Collaborative editing**: Multiple users editing at once
5. **Activity feed**: Real-time activity log

### User Experience Flow

```
User A drags task
        ↓
Server receives update
        ↓
WebSocket broadcast to all clients
        ↓
User B sees task move in real-time
```

---

## WebSocket Integration

### Supabase Realtime

Supabase provides built-in real-time capabilities using WebSocket connections.

#### Implementation Plan

```typescript
// 1. Subscribe to table changes
const setupRealtimeSubscription = (boardId: string) => {
  const channel = supabase
    .channel(`board:${boardId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'tasks',
        filter: `board_id=eq.${boardId}`
      },
      (payload) => handleRealtimeUpdate(payload)
    )
    .subscribe();
    
  return () => supabase.removeChannel(channel);
};

// 2. Handle incoming changes
const handleRealtimeUpdate = (payload: RealtimePayload) => {
  const { eventType, new: newRecord, old: oldRecord } = payload;
  
  switch (eventType) {
    case 'INSERT':
      addTaskToBoard(newRecord);
      showNotification(`${newRecord.created_by} added a task`);
      break;
      
    case 'UPDATE':
      updateTaskInBoard(newRecord);
      if (newRecord.column_id !== oldRecord.column_id) {
        showNotification(`Task moved to ${getColumnName(newRecord.column_id)}`);
      }
      break;
      
    case 'DELETE':
      removeTaskFromBoard(oldRecord.id);
      break;
  }
};
```

### Event Types

| Event | Description | Payload |
|-------|-------------|---------|
| INSERT | New record created | `{ new: Record }` |
| UPDATE | Record modified | `{ new: Record, old: Record }` |
| DELETE | Record deleted | `{ old: Record }` |
| * | All events | All payloads |

---

## Conflict Resolution

### Potential Conflicts

1. **Concurrent edits**: Two users edit same task
2. **Delete while editing**: User A deletes task User B is editing
3. **Move conflicts**: Two users move same task
4. **State staleness**: UI out of sync with server

### Resolution Strategies

#### 1. Last Write Wins (LWW)
```typescript
// Simple but potentially data-losing
const resolveConflict = (local: Task, remote: Task) => {
  // Compare timestamps
  return remote.updated_at > local.updated_at ? remote : local;
};
```

**Pros**: Simple, predictable  
**Cons**: Can lose data, no user control

#### 2. Operational Transformation (OT)
```typescript
// Complex but preserves all edits
const transformOperation = (op1: Operation, op2: Operation) => {
  // Transform op1 to account for op2
  // Example: adjust positions after insert
  if (op1.type === 'move' && op2.type === 'insert') {
    if (op1.position >= op2.position) {
      return { ...op1, position: op1.position + 1 };
    }
  }
  return op1;
};
```

**Pros**: Preserves intent, no data loss  
**Cons**: Complex implementation, order matters

#### 3. Version Vectors
```typescript
// Track version per user
interface TaskVersion {
  id: string;
  data: Task;
  version: {
    user_a: number;
    user_b: number;
  };
}

const mergeVersions = (local: TaskVersion, remote: TaskVersion) => {
  // Merge based on version vectors
  // Can detect concurrent edits
};
```

**Pros**: Detects true conflicts  
**Cons**: Storage overhead, complex merging

### Recommended Approach: Hybrid

```typescript
// Combine LWW with user notification
const handleConflict = (local: Task, remote: Task) => {
  // 1. Apply remote changes (LWW)
  updateTask(remote);
  
  // 2. If local has unsaved changes, notify user
  if (hasLocalChanges(local, remote)) {
    showConflictDialog({
      message: 'This task was updated by another user',
      options: [
        { label: 'Keep their changes', action: () => acceptRemote(remote) },
        { label: 'Keep my changes', action: () => overwrite(local) },
        { label: 'Merge both', action: () => mergeChanges(local, remote) }
      ]
    });
  }
};
```

---

## Performance Optimization

### 1. Debouncing Updates

```typescript
import { debounce } from 'lodash';

// Avoid sending too many updates
const debouncedUpdate = debounce(
  (taskId, updates) => taskService.updateTask(supabase, taskId, updates),
  300 // Wait 300ms after last change
);

// Usage: User types in task description
const handleDescriptionChange = (value: string) => {
  setDescription(value); // Immediate UI update
  debouncedUpdate(taskId, { description: value }); // Delayed sync
};
```

### 2. Batching Operations

```typescript
// Collect multiple changes and send as batch
class UpdateBatcher {
  private queue: Update[] = [];
  private timer: NodeJS.Timeout | null = null;
  
  add(update: Update) {
    this.queue.push(update);
    
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 1000);
    }
  }
  
  async flush() {
    if (this.queue.length === 0) return;
    
    const batch = [...this.queue];
    this.queue = [];
    this.timer = null;
    
    await supabase.from('tasks').upsert(batch);
  }
}
```

### 3. Selective Subscriptions

```typescript
// Only subscribe to relevant data
const useRealtimeBoard = (boardId: string, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return; // Don't subscribe if board not active
    
    const subscription = setupRealtimeSubscription(boardId);
    return () => subscription(); // Cleanup on unmount
  }, [boardId, enabled]);
};

// Usage: Only sync active board
<Board boardId={id} realtimeEnabled={isActiveTab} />
```

### 4. Delta Updates

```typescript
// Send only changed fields, not entire object
const optimizedUpdate = (taskId: string, changes: Partial<Task>) => {
  // ❌ Bad: Send entire task
  await supabase.from('tasks').update(fullTask).eq('id', taskId);
  
  // ✅ Good: Send only changes
  await supabase.from('tasks').update(changes).eq('id', taskId);
};

// Example: Only update status
optimizedUpdate(taskId, { status: 'done' }); // Not entire task
```

---

## Data Consistency Guarantees

### Strong Consistency
Database writes are immediately consistent for reads.

```sql
-- PostgreSQL ACID guarantees
BEGIN;
  UPDATE tasks SET column_id = $1 WHERE id = $2;
  -- This write is immediately visible to all subsequent reads
COMMIT;
```

### Eventual Consistency (Real-time)
WebSocket updates may have slight delay (typically <100ms).

```
Write to DB (t=0)
        ↓
DB confirms (t=10ms)
        ↓
WebSocket broadcast (t=50ms)
        ↓
Client receives (t=100ms)
```

### Handling Inconsistency

```typescript
// Implement reconciliation on reconnect
const reconcileState = async (boardId: string) => {
  // 1. Fetch fresh data from server
  const serverState = await boardService.getBoard(supabase, boardId);
  
  // 2. Compare with local state
  const localState = getBoardFromCache(boardId);
  
  // 3. Merge states (prefer server for conflicts)
  const mergedState = {
    ...localState,
    ...serverState,
    updated_at: serverState.updated_at // Always use server timestamp
  };
  
  // 4. Update UI
  setBoardState(mergedState);
};
```

---

## Implementation Roadmap

### Phase 1: Foundation (Current) ✅
- ✅ Optimistic UI updates
- ✅ Error handling with rollback
- ✅ Loading states
- ✅ Toast notifications

### Phase 2: Basic Real-time (Next 3 months)
- [ ] Supabase Realtime setup
- [ ] Subscribe to board changes
- [ ] Handle INSERT/UPDATE/DELETE events
- [ ] Basic conflict detection
- [ ] Connection status indicator

### Phase 3: Advanced Real-time (6 months)
- [ ] Presence indicators (who's online)
- [ ] Live cursor tracking
- [ ] Collaborative editing with OT
- [ ] Activity timeline
- [ ] Offline mode with sync queue

### Phase 4: Enterprise Features (12 months)
- [ ] Custom conflict resolution
- [ ] Audit trail
- [ ] Undo/Redo across users
- [ ] Version history
- [ ] Rollback to previous state

---

## Code Examples

### Basic Real-time Setup

```typescript
// components/Board.tsx
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export function Board({ boardId }: { boardId: string }) {
  const { board, columns, tasks, setTasks } = useBoard(boardId);
  
  useEffect(() => {
    // Setup real-time subscription
    const channel = supabase
      .channel(`board:${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `column_id=in.(${columns.map(c => c.id).join(',')})`
        },
        (payload) => {
          console.log('Real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setTasks(prev => [...prev, payload.new as Task]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new as Task : t)
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(prev => prev.filter(t => t.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
    
    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, columns]);
  
  return (
    <div>
      {/* Board UI */}
    </div>
  );
}
```

### Presence Tracking

```typescript
// Track who's viewing the board
const usePresence = (boardId: string, userId: string) => {
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const channel = supabase.channel(`presence:board:${boardId}`, {
      config: { presence: { key: userId } }
    });
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId, online_at: new Date().toISOString() });
        }
      });
    
    return () => {
      channel.unsubscribe();
    };
  }, [boardId, userId]);
  
  return onlineUsers;
};
```

### Offline Queue

```typescript
// Queue operations when offline
class OfflineQueue {
  private queue: Operation[] = [];
  
  add(operation: Operation) {
    this.queue.push(operation);
    this.saveToLocalStorage();
  }
  
  async sync() {
    if (!navigator.onLine) {
      console.log('Still offline, will retry later');
      return;
    }
    
    const operations = [...this.queue];
    
    for (const op of operations) {
      try {
        await this.execute(op);
        this.remove(op);
      } catch (error) {
        console.error('Failed to sync operation:', error);
        // Keep in queue for next sync
      }
    }
  }
  
  private async execute(op: Operation) {
    switch (op.type) {
      case 'create_task':
        await taskService.createTask(supabase, op.data);
        break;
      case 'update_task':
        await taskService.updateTask(supabase, op.taskId, op.data);
        break;
      case 'delete_task':
        await taskService.deleteTask(supabase, op.taskId);
        break;
    }
  }
  
  private saveToLocalStorage() {
    localStorage.setItem('offline_queue', JSON.stringify(this.queue));
  }
}
```

---

## Testing Strategy

### Unit Tests
```typescript
describe('Real-time updates', () => {
  it('should apply remote INSERT', () => {
    const payload = {
      eventType: 'INSERT',
      new: { id: '123', title: 'New Task' }
    };
    
    handleRealtimeUpdate(payload);
    
    expect(getTasks()).toContainEqual(payload.new);
  });
  
  it('should rollback on conflict', () => {
    const original = getTasks();
    
    // Simulate conflict
    handleConflict(localChanges, remoteChanges);
    
    expect(getTasks()).toEqual(original);
  });
});
```

### Integration Tests
```typescript
describe('Real-time sync', () => {
  it('should sync across multiple clients', async () => {
    // Client A creates task
    await clientA.createTask({ title: 'Test' });
    
    // Wait for real-time update
    await waitFor(() => {
      // Client B should see the task
      expect(clientB.getTasks()).toContainEqual({ title: 'Test' });
    });
  });
});
```

---

## Monitoring & Debugging

### Connection Status

```typescript
const useConnectionStatus = () => {
  const [status, setStatus] = useState<'connected' | 'disconnected'>('connected');
  
  useEffect(() => {
    const handleOnline = () => setStatus('connected');
    const handleOffline = () => setStatus('disconnected');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return status;
};

// UI Component
function ConnectionIndicator() {
  const status = useConnectionStatus();
  
  if (status === 'disconnected') {
    return (
      <div className="bg-yellow-100 text-yellow-800 p-2">
        You're offline. Changes will sync when connection is restored.
      </div>
    );
  }
  
  return null;
}
```

### Debug Logging

```typescript
// Enable real-time debug logs
if (process.env.NODE_ENV === 'development') {
  supabase.realtime.setAuth(token);
  supabase.realtime.onMessage((message) => {
    console.log('[Realtime Message]', message);
  });
}
```

---

## Performance Benchmarks

### Target Metrics
| Metric | Target | Acceptable |
|--------|--------|------------|
| Update latency | < 100ms | < 300ms |
| WebSocket reconnect | < 1s | < 3s |
| State reconciliation | < 200ms | < 500ms |
| Message processing | < 50ms | < 150ms |

### Load Testing
```typescript
// Simulate 100 concurrent updates
const loadTest = async () => {
  const updates = Array.from({ length: 100 }, (_, i) => ({
    id: `task-${i}`,
    title: `Task ${i}`,
    updated_at: new Date().toISOString()
  }));
  
  const start = performance.now();
  
  await Promise.all(
    updates.map(update => taskService.updateTask(supabase, update.id, update))
  );
  
  const end = performance.now();
  console.log(`Processed 100 updates in ${end - start}ms`);
};
```

---

## Conclusion

KaryaSetu's real-time sync strategy balances **immediate user feedback** (optimistic updates) with **eventual consistency** (planned WebSocket integration). This hybrid approach provides an excellent user experience while maintaining data integrity.

**Current State**: Optimistic updates with manual refresh  
**Future State**: Full real-time collaboration with conflict resolution

For implementation details, see [Backend Architecture](BACKEND_ARCHITECTURE.md) and [API Contract](API_CONTRACT.md).
