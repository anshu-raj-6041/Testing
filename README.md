# KaryaSetu 🚀

> A modern, full-stack Kanban board application for agile project management

KaryaSetu is a powerful project management tool built with cutting-edge technologies. It provides an intuitive drag-and-drop interface for organizing tasks, managing workflows, and collaborating with teams in real-time.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?logo=clerk)](https://clerk.com/)

---

## ✨ Features

### 📋 Core Functionality
- **Kanban Board Management**: Create, edit, and organize unlimited boards with customizable colors
- **Drag & Drop Interface**: Smooth, intuitive task management powered by @dnd-kit
- **Column Management**: Flexible workflow organization with custom columns
- **Advanced Task Management**: 
  - Rich task descriptions
  - Priority levels (Low, Medium, High)
  - Due date tracking
  - Assignee management
  - Status tracking across columns

### 🔒 Security & Data Protection
- **Row Level Security (RLS)**: Database-level security policies
- **User Isolation**: Complete data separation between users
- **Secure Authentication**: Enterprise-grade auth with Clerk
- **Environment-based Configuration**: Secure credential management

### 🎨 User Experience
- **Modern UI/UX**: Beautiful interface with Tailwind CSS and Shadcn UI
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Dashboard Overview**: Centralized view with statistics and quick actions
- **Advanced Filtering**: Filter by priority, assignee, and due dates
- **Real-time Updates**: Optimistic UI updates for instant feedback
- **Dark Mode Support**: Coming soon

### 🚀 Technical Excellence
- **TypeScript**: 100% type-safe codebase
- **Server Components**: Next.js 15 with App Router
- **Feature-based Architecture**: Modular, scalable code organization
- **Service Layer Pattern**: Clean separation of concerns
- **Custom Hooks**: Reusable business logic
- **Error Boundaries**: Graceful error handling

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` folder:

- **[Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md)** - Component structure, patterns, and client-side architecture
- **[Backend Architecture](docs/BACKEND_ARCHITECTURE.md)** - Database design, RLS, service layer, and scalability
- **[Database Schema](docs/DATABASE_SCHEMA.md)** - Complete schema with ERD, SQL scripts, and indexes
- **[API Contract](docs/API_CONTRACT.md)** - Service API documentation, request/response formats
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Detailed local development setup instructions

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18.18.0 or higher
- npm 10.0.0 or higher
- Supabase account (free tier available)
- Clerk account (free tier available)

### Installation

```bash
# Clone the repository
git clone https://github.com/anshu-raj-6041/KaryaSetu.git

# Navigate to project directory
cd KaryaSetu

# Install dependencies
npm install

# Set up environment variables
# Copy .env.example to .env.local and fill in your values
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

> **For detailed setup instructions, see [SETUP_GUIDE.md](docs/SETUP_GUIDE.md)**

---

## 🏗️ Architecture Overview

KaryaSetu follows a feature-based architecture pattern:

```
├── app/                    # Next.js App Router (Pages & Layouts)
├── components/             # Shared UI Components
│   ├── layout/            # Navbar, Footer
│   ├── ui/                # Shadcn UI components
│   └── common/            # Reusable components
├── features/              # Feature Modules
│   ├── auth/              # Authentication
│   ├── boards/            # Board management
│   └── dashboard/         # Dashboard features
├── lib/                   # Core Libraries
│   ├── supabase/          # Database client
│   └── services.ts        # API service layer
└── docs/                  # Documentation
```

**Key Design Patterns:**
- **Service Layer**: Abstraction over Supabase operations
- **Custom Hooks**: Encapsulated business logic (useBoard, useBoards)
- **Component Composition**: Reusable, testable UI components
- **Type Safety**: TypeScript interfaces for all data models

For more details, see [Frontend Architecture](docs/FRONTEND_ARCHITECTURE.md) and [Backend Architecture](docs/BACKEND_ARCHITECTURE.md).

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org/) | 15.5.2 | React framework with App Router & Server Components |
| [React](https://react.dev/) | 19.1.0 | UI library |
| [TypeScript](https://www.typescriptlang.org/) | 5.0+ | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) | 3.4+ | Styling framework |
| [Shadcn UI](https://ui.shadcn.com/) | Latest | Accessible component library |
| [@dnd-kit](https://dndkit.com/) | 6.3.1 | Drag-and-drop functionality |
| [Lucide React](https://lucide.dev/) | Latest | Icon library |

### Backend & Infrastructure
| Technology | Purpose |
|-----------|---------|
| [Supabase](https://supabase.com/) | PostgreSQL database with real-time capabilities |
| [Clerk](https://clerk.com/) | Authentication & user management |
| Row Level Security | Database-level access control |
| [Vercel](https://vercel.com/) | Hosting & deployment |

### Development Tools
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing
- **Turbopack**: Fast development builds

---

## 🗄️ Database Schema

### Tables
- **boards**: User's Kanban boards
- **columns**: Board columns (To Do, In Progress, Done, etc.)
- **tasks**: Individual tasks with metadata

### Relationships
```
boards (1) ----< (N) columns (1) ----< (N) tasks
```

### Security
- Row Level Security (RLS) policies on all tables
- User isolation at database level
- Cascade deletes for data integrity

**See [Database Schema Documentation](docs/DATABASE_SCHEMA.md) for complete schema, SQL scripts, and ERD diagrams.**

---

## 🔌 API Services

All backend operations are abstracted through a service layer:

```typescript
// Board operations
boardService.getBoards(supabase, userId)
boardService.createBoard(supabase, boardData)
boardService.updateBoard(supabase, boardId, updates)

// Column operations
columnService.createColumn(supabase, columnData)
columnService.updateColumn(supabase, columnId, updates)

// Task operations
taskService.createTask(supabase, taskData)
taskService.moveTask(supabase, taskId, newColumnId, sortOrder)
```

**See [API Contract Documentation](docs/API_CONTRACT.md) for complete API reference.**

---

## 📦 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk Redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**See [Setup Guide](docs/SETUP_GUIDE.md) for detailed configuration instructions.**

---

## 🚀 Development

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Fix linting issues
npm run lint -- --fix
```

### Development Workflow

1. Start development server: `npm run dev`
2. Make changes to code (Hot Module Replacement active)
3. Test in browser at `http://localhost:3000`
4. Lint code: `npm run lint`
5. Build for production: `npm run build`

---

## 📱 Key Features Demo

### Dashboard
- View all boards at a glance
- Create new boards with custom colors
- Filter and search boards
- View statistics (total boards, tasks)
- Quick access to recent boards

### Kanban Board
- Drag tasks between columns
- Reorder tasks within columns
- Create, edit, delete tasks
- Filter by priority, assignee, due date
- Color-coded board identification
- Real-time updates with optimistic UI

### Task Management
- Rich descriptions with markdown (coming soon)
- Priority levels with color indicators
- Due date tracking
- Assignee management
- Status updates via drag-and-drop

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

**Important**: Set all environment variables in Vercel dashboard:
- Vercel → Project → Settings → Environment Variables
- Copy all values from `.env.local`

### Other Platforms
- **Netlify**: Supports Next.js with Edge Functions
- **AWS Amplify**: Full Next.js support
- **Railway**: Easy PostgreSQL integration
- **Render**: Web service deployment

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User authentication (sign up, sign in, sign out)
- [ ] Board creation and management
- [ ] Column creation and editing
- [ ] Task CRUD operations
- [ ] Drag-and-drop functionality
- [ ] Filter and search features
- [ ] Responsive design on different devices

### Future: Automated Testing
- Unit tests with Jest
- Component tests with React Testing Library
- E2E tests with Playwright
- API integration tests

---

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Board management
- [x] Column management
- [x] Task CRUD operations
- [x] Drag-and-drop interface
- [x] Filtering and search

### Phase 2: Enhanced Features 🚧
- [ ] Real-time collaboration with WebSockets
- [ ] Team workspaces
- [ ] Board templates
- [ ] Task comments
- [ ] File attachments
- [ ] Activity timeline
- [ ] Notifications

### Phase 3: Advanced Features 📋
- [ ] Gantt chart view
- [ ] Sprint planning
- [ ] Time tracking
- [ ] Custom fields
- [ ] Automation rules
- [ ] API webhooks
- [ ] Mobile app

### Phase 4: Enterprise Features 🎯
- [ ] SSO integration
- [ ] Advanced permissions
- [ ] Audit logs
- [ ] Data export
- [ ] White-labeling
- [ ] SLA management

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/KaryaSetu.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Follow existing code style
   - Add TypeScript types
   - Update documentation
   - Test your changes

4. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Link related issues
   - Add screenshots if applicable

### Contribution Guidelines

- **Code Style**: Follow existing TypeScript and React patterns
- **Commits**: Use clear, descriptive commit messages
- **Testing**: Ensure your changes don't break existing functionality
- **Documentation**: Update README and docs as needed
- **Issues**: Open an issue before working on major changes

### Areas for Contribution
- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🧪 Test coverage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Clerk](https://clerk.com/) for authentication
- [Shadcn](https://ui.shadcn.com/) for beautiful UI components
- [Vercel](https://vercel.com/) for hosting
- All contributors and users of KaryaSetu

---

## 📧 Support

- **Documentation**: [/docs](docs/)
- **Issues**: [GitHub Issues](https://github.com/anshu-raj-6041/KaryaSetu/issues)
- **Discussions**: [GitHub Discussions](https://github.com/anshu-raj-6041/KaryaSetu/discussions)

---

## 🌟 Star History

If you find KaryaSetu useful, please consider giving it a star ⭐

[![Star History Chart](https://api.star-history.com/svg?repos=anshu-raj-6041/KaryaSetu&type=Date)](https://star-history.com/#anshu-raj-6041/KaryaSetu&Date)

---

<div align="center">

**Made with ❤️ by [Anshu Raj](https://github.com/anshu-raj-6041)**

[⬆ Back to Top](#karyasetu-)

</div>
