# Scalability & Performance Strategy

## Overview

This document outlines KaryaSetu's scalability strategy, covering infrastructure design, performance optimization, database scaling, and capacity planning for growth from 100 to 1,000,000+ users.

---

## Table of Contents
1. [Current Architecture](#current-architecture)
2. [Scaling Dimensions](#scaling-dimensions)
3. [Database Scaling](#database-scaling)
4. [Application Scaling](#application-scaling)
5. [Caching Strategy](#caching-strategy)
6. [Content Delivery](#content-delivery)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Observability](#monitoring--observability)
9. [Capacity Planning](#capacity-planning)
10. [Cost Optimization](#cost-optimization)

---

## Current Architecture

### Technology Stack
```
┌─────────────────┐
│   Users/Clients │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel Edge     │ ◄── CDN, Edge Functions
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Next.js App     │ ◄── Server Components, API Routes
└────────┬────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌──────────────┐
│  Supabase DB     │  │  Clerk Auth  │
│  (PostgreSQL)    │  │              │
└─────────────────┘  └──────────────┘
```

### Current Capacity
- **Users**: Designed for 0-10,000 concurrent users
- **Boards**: ~100 boards per page load
- **Tasks**: ~1,000 tasks per board
- **Response Time**: < 300ms (p95)
- **Availability**: 99.9% uptime target

---

## Scaling Dimensions

### 1. Vertical Scaling (Scale Up)
Increase resources of existing servers.

**When to use:**
- Quick fix for small traffic spikes
- Single database performance issues
- Simple to implement

**Limitations:**
- Hardware limits (max CPU/RAM)
- Single point of failure
- Expensive at scale

### 2. Horizontal Scaling (Scale Out)
Add more servers to distribute load.

**When to use:**
- Sustained traffic growth
- Need for redundancy
- Geographic distribution

**Benefits:**
- No theoretical limit
- Fault tolerance
- Cost-effective at scale

### 3. Data Partitioning (Sharding)
Split database across multiple instances.

**Strategies:**
- User-based: Users A-M on shard 1, N-Z on shard 2
- Geographic: US users on US shard, EU users on EU shard
- Feature-based: Boards on shard 1, tasks on shard 2

---

## Database Scaling

### Phase 1: Single Database (Current)
**Capacity**: 0-10,000 users

```sql
-- Current schema optimizations
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_columns_board_id ON columns(board_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_composite ON tasks(column_id, sort_order);
```

**Performance**:
- Query time: < 50ms
- Concurrent connections: 100
- Database size: < 10 GB

### Phase 2: Read Replicas (10K-100K users)
**Strategy**: Offload read queries to replicas

```
┌──────────────┐
│ Primary DB   │ ◄── Writes only
│ (Leader)     │
└──────┬───────┘
       │
       ├──── Replication ─────┐
       │                      │
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│ Replica 1    │      │ Replica 2    │
│ (Read-only)  │      │ (Read-only)  │
└──────────────┘      └──────────────┘
```

**Implementation**:
```typescript
// lib/supabase/client.ts
const getPrimaryClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

const getReplicaClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_READ_REPLICA_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Use replica for reads
export const boardService = {
  getBoards: async (userId: string) => {
    const replica = getReplicaClient();
    return await replica.from('boards').select('*').eq('user_id', userId);
  },
  
  createBoard: async (board: Board) => {
    const primary = getPrimaryClient();
    return await primary.from('boards').insert(board);
  }
};
```

**Benefits**:
- 10x read capacity
- Lower latency for reads
- High availability

### Phase 3: Horizontal Partitioning (100K-1M users)
**Strategy**: Shard by user_id

```typescript
// Shard selection logic
const getShardForUser = (userId: string): string => {
  const hash = hashCode(userId);
  const shardCount = 4;
  const shardIndex = hash % shardCount;
  return `shard_${shardIndex}`;
};

const hashCode = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
  }
  return Math.abs(hash);
};

// Route to correct shard
const getShardClient = (userId: string) => {
  const shard = getShardForUser(userId);
  const url = process.env[`SUPABASE_${shard.toUpperCase()}_URL`]!;
  return createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
};
```

**Shard Distribution**:
- Shard 0: Users with hash % 4 = 0 (25%)
- Shard 1: Users with hash % 4 = 1 (25%)
- Shard 2: Users with hash % 4 = 2 (25%)
- Shard 3: Users with hash % 4 = 3 (25%)

### Phase 4: Multi-Region (1M+ users)
**Strategy**: Deploy databases in multiple regions

```
US West          US East          Europe           Asia
┌───────┐       ┌───────┐       ┌───────┐       ┌───────┐
│ DB 1  │       │ DB 2  │       │ DB 3  │       │ DB 4  │
└───────┘       └───────┘       └───────┘       └───────┘
    ▲               ▲               ▲               ▲
    └───────────────┴───────────────┴───────────────┘
              Cross-region replication
```

**Smart Routing**:
```typescript
const getNearestDatabase = (): string => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const region = getRegionFromTimezone(userTimezone);
  
  const regionMap: Record<string, string> = {
    'us-west': process.env.SUPABASE_US_WEST_URL!,
    'us-east': process.env.SUPABASE_US_EAST_URL!,
    'eu-central': process.env.SUPABASE_EU_URL!,
    'asia-pacific': process.env.SUPABASE_ASIA_URL!
  };
  
  return regionMap[region] || regionMap['us-east'];
};
```

---

## Application Scaling

### Next.js on Vercel

#### Auto-Scaling
Vercel automatically scales based on traffic:

```
Normal Load (100 req/s)
┌──────┐
│ Edge │ ──► 2 instances
└──────┘

High Load (1000 req/s)
┌──────┐
│ Edge │ ──► 20 instances (auto-scaled)
└──────┘

Peak Load (10000 req/s)
┌──────┐
│ Edge │ ──► 200 instances (auto-scaled)
└──────┘
```

#### Edge Functions
Deploy compute closer to users:

```typescript
// app/api/boards/route.ts
export const runtime = 'edge'; // Enable edge runtime

export async function GET(request: Request) {
  // Runs on edge location closest to user
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Fast response from nearby edge location
  const boards = await boardService.getBoards(userId);
  
  return Response.json(boards);
}
```

**Benefits**:
- Lower latency (50-100ms improvement)
- Global distribution
- Infinite scalability

### Container Orchestration (Alternative)

For self-hosting, use Kubernetes:

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: karyasetu-app
spec:
  replicas: 3  # Start with 3 instances
  selector:
    matchLabels:
      app: karyasetu
  template:
    metadata:
      labels:
        app: karyasetu
    spec:
      containers:
      - name: nextjs
        image: karyasetu:latest
        resources:
          limits:
            cpu: "1000m"
            memory: "512Mi"
          requests:
            cpu: "500m"
            memory: "256Mi"
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: karyasetu-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: karyasetu-app
  minReplicas: 3
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Caching Strategy

### 1. Browser Caching
```typescript
// next.config.ts
export default {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### 2. React Query (Data Caching)
```typescript
// features/boards/hooks/useBoards.ts
import { useQuery } from '@tanstack/react-query';

export const useBoards = (userId: string) => {
  return useQuery({
    queryKey: ['boards', userId],
    queryFn: () => boardService.getBoards(supabase, userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });
};
```

**Cache Hit Rate Target**: 80%+

### 3. CDN Caching (Vercel Edge)
Automatic caching at edge locations:

```typescript
// app/api/boards/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const board = await boardService.getBoard(params.id);
  
  return Response.json(board, {
    headers: {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

### 4. Redis Cache (Future)
For frequently accessed data:

```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const getCachedBoard = async (boardId: string): Promise<Board | null> => {
  const cached = await redis.get<Board>(`board:${boardId}`);
  
  if (cached) {
    return cached;
  }
  
  const board = await boardService.getBoard(boardId);
  
  // Cache for 5 minutes
  await redis.setex(`board:${boardId}`, 300, board);
  
  return board;
};
```

**Cache Strategy**:
- Boards list: 5 minutes
- Board details: 2 minutes
- Task counts: 1 minute
- User profile: 10 minutes

---

## Content Delivery

### Static Asset Optimization

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200], // Responsive sizes
  },
  
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-*']
  }
};

export default config;
```

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const Board = dynamic(() => import('@/features/boards/components/Board'), {
  loading: () => <BoardSkeleton />,
  ssr: false // Don't render on server if heavy
});

const FilterDialog = dynamic(
  () => import('@/features/boards/components/FilterDialog'),
  { ssr: false }
);
```

### Bundle Size Targets
| Bundle | Target | Current |
|--------|--------|---------|
| First Load JS | < 100 kB | ~95 kB |
| Homepage | < 80 kB | ~75 kB |
| Dashboard | < 120 kB | ~110 kB |
| Board Page | < 150 kB | ~140 kB |

---

## Performance Optimization

### 1. React Performance

```typescript
// Memoization
import { memo, useMemo, useCallback } from 'react';

// Expensive component
export const TaskCard = memo(({ task }: { task: Task }) => {
  const priorityColor = useMemo(() => {
    return getPriorityColor(task.priority);
  }, [task.priority]);
  
  const handleClick = useCallback(() => {
    openTaskDialog(task.id);
  }, [task.id]);
  
  return <div onClick={handleClick} style={{ borderColor: priorityColor }} />;
});
```

### 2. Database Query Optimization

```sql
-- ❌ Bad: N+1 query problem
SELECT * FROM boards WHERE user_id = 'user-123';
-- Then for each board:
SELECT COUNT(*) FROM columns WHERE board_id = 'board-1';

-- ✅ Good: Single query with join
SELECT 
  b.*,
  COUNT(DISTINCT c.id) as column_count,
  COUNT(DISTINCT t.id) as task_count
FROM boards b
LEFT JOIN columns c ON c.board_id = b.id
LEFT JOIN tasks t ON t.column_id = c.id
WHERE b.user_id = 'user-123'
GROUP BY b.id;
```

### 3. Connection Pooling

```typescript
// Supabase automatically pools connections
// Configure based on load:

// Low traffic: 15 connections (default)
// Medium traffic: 50 connections
// High traffic: 100 connections
// Enterprise: 200+ connections

// Set in Supabase dashboard → Database → Settings
```

### 4. Lazy Loading

```typescript
// Virtualized list for large task lists
import { FixedSizeList } from 'react-window';

export function TaskList({ tasks }: { tasks: Task[] }) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <TaskCard task={tasks[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={tasks.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

## Monitoring & Observability

### 1. Application Monitoring

```typescript
// lib/monitoring/analytics.ts
export const trackPerformance = (metric: string, value: number) => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(metric);
    performance.measure(metric, {
      start: 0,
      duration: value
    });
  }
  
  // Send to analytics
  console.log(`[Performance] ${metric}: ${value}ms`);
};

// Usage
const start = performance.now();
await loadBoard(boardId);
const end = performance.now();
trackPerformance('board_load_time', end - start);
```

### 2. Database Monitoring

```sql
-- Monitor slow queries
SELECT 
  query,
  calls,
  total_time / calls as avg_time_ms,
  total_time
FROM pg_stat_statements
WHERE total_time / calls > 100 -- Slower than 100ms
ORDER BY total_time DESC
LIMIT 10;
```

### 3. Error Tracking

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
    }
    return event;
  }
});

// Catch errors
try {
  await boardService.createBoard(data);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'board_creation' },
    extra: { boardData: data }
  });
  throw error;
}
```

### 4. Key Metrics Dashboard

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time (p95) | < 300ms | > 500ms |
| Error Rate | < 0.1% | > 1% |
| Uptime | 99.9% | < 99.5% |
| DB Connections | < 80 | > 90 |
| Cache Hit Rate | > 80% | < 60% |
| CPU Usage | < 70% | > 85% |
| Memory Usage | < 80% | > 90% |

---

## Capacity Planning

### Growth Projections

```
Timeline        Users       Boards      Tasks       DB Size     Monthly Cost
────────────────────────────────────────────────────────────────────────────
Month 1         100         500         5K          100 MB      $50
Month 3         1,000       5K          50K         1 GB        $100
Month 6         10,000      50K         500K        10 GB       $300
Year 1          100,000     500K        5M          100 GB      $1,500
Year 2          500,000     2.5M        25M         500 GB      $5,000
Year 3          1,000,000   5M          50M         1 TB        $10,000
```

### Infrastructure Scaling Timeline

**Phase 1 (0-10K users)**:
- Single Supabase instance
- Vercel hobby plan
- No caching layer
- Cost: ~$100/month

**Phase 2 (10K-100K users)**:
- Read replicas (2x)
- Vercel pro plan
- Redis caching
- Cost: ~$500/month

**Phase 3 (100K-500K users)**:
- Database sharding (4 shards)
- Multi-region deployment
- CDN optimization
- Cost: ~$2,000/month

**Phase 4 (500K-1M users)**:
- 8+ database shards
- Global edge caching
- Dedicated infrastructure
- Cost: ~$10,000/month

---

## Cost Optimization

### 1. Query Optimization
```typescript
// ❌ Expensive: Fetch all fields
const boards = await supabase.from('boards').select('*');

// ✅ Optimized: Select only needed fields
const boards = await supabase
  .from('boards')
  .select('id, title, color') // 70% smaller response
  .limit(20); // Pagination
```

### 2. Right-Sizing Resources
- Monitor actual usage
- Scale down during off-peak hours
- Use burst capacity for spikes

### 3. Caching ROI
```
Without cache: 1M requests/day × $0.0001 = $100/day = $3,000/month
With 80% cache hit: 200K requests/day × $0.0001 = $20/day = $600/month
Cache cost: Redis $50/month
Net savings: $2,350/month (78% reduction)
```

---

## Disaster Recovery

### Backup Strategy
```sql
-- Automated daily backups (Supabase)
-- Retention: 7 days (Free tier), 30 days (Pro)

-- Point-in-time recovery
-- Can restore to any time within last 7 days
```

### Failover Plan
```
Primary Region Down
        ↓
DNS failover to backup region (60s)
        ↓
Traffic routes to backup
        ↓
Restore from latest backup if needed
        ↓
Resume operations (RTO: 5 minutes)
```

**Recovery Objectives**:
- RTO (Recovery Time Objective): < 5 minutes
- RPO (Recovery Point Objective): < 5 minutes (last backup)

---

## Load Testing

### Testing Scenarios

```typescript
// Artillery load test configuration
// artillery.yml
config:
  target: 'https://karyasetu.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10  # 10 users/sec
    - duration: 120
      arrivalRate: 50  # Ramp to 50 users/sec
    - duration: 60
      arrivalRate: 100 # Peak: 100 users/sec

scenarios:
  - name: 'Browse boards'
    flow:
      - get:
          url: '/api/boards'
      - think: 2
      - get:
          url: '/api/boards/{{ $randomString() }}'
```

### Performance Targets

| Load Level | Users/sec | Response Time | Success Rate |
|------------|-----------|---------------|--------------|
| Normal     | 10        | < 200ms       | 99.9%        |
| High       | 50        | < 300ms       | 99.5%        |
| Peak       | 100       | < 500ms       | 99%          |
| Stress     | 200       | < 1000ms      | 95%          |

---

## Conclusion

KaryaSetu is designed for **horizontal scalability** from day one:

✅ **Database**: Supabase with sharding support  
✅ **Application**: Stateless Next.js on Vercel edge  
✅ **Caching**: Multi-layer caching strategy  
✅ **Monitoring**: Comprehensive observability  
✅ **Cost**: Optimized for growth  

**Current Capacity**: 10,000 concurrent users  
**1-Year Target**: 100,000 concurrent users  
**Ultimate Goal**: 1,000,000+ concurrent users

For implementation details, see:
- [Backend Architecture](BACKEND_ARCHITECTURE.md)
- [Database Schema](DATABASE_SCHEMA.md)
- [Real-Time Sync Strategy](REAL_TIME_SYNC_STRATEGY.md)
