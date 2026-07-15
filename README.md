# 🎯 Smart Task Manager

<div align="center">

![Smart Task Manager Banner](https://img.shields.io/badge/Smart-Task%20Manager-E50914?style=for-the-badge&logo=task&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)

**A professional, production-ready Full Stack Task Management System**

[Live Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 📋 Project Overview

Smart Task Manager is a feature-complete full-stack web application that enables professionals to organize, track, and manage their tasks with efficiency. Built with a Netflix-inspired dark design system, it provides a premium user experience with real-time task statistics, priority management, and comprehensive filtering capabilities.

## ✨ Features

### 🔐 Authentication
- User registration with email & password
- JWT-based login with 7-day token expiry
- Password strength indicator
- bcrypt password hashing (salt rounds: 12)
- Protected routes with Angular route guards
- Token auto-expiry handling with redirect to login
- Profile management & password change

### 📊 Dashboard
- Real-time task statistics (total, completed, pending, high priority)
- SVG progress ring showing completion rate
- Priority breakdown bars
- Recent tasks list with quick status indicator
- Animated stat cards with hover effects
- Greeting based on time of day

### ✅ Task Management (Full CRUD)
- Create tasks with title, description, priority, due date & tags
- Edit any task property
- Delete with confirmation dialog
- Quick status update (mark complete) from list view
- Grid and List view modes
- Chip-based tag management

### 🔍 Search & Filter
- Real-time search with 400ms debounce
- Filter by status (todo, in-progress, completed, cancelled)
- Filter by priority (low, medium, high, critical)
- Sort by created date, due date, priority, or title
- Paginated results (6/12/24 per page)

### 🎨 UI/UX
- Netflix-style dark theme with Bebas Neue + Inter fonts
- Glassmorphism cards with gradient backgrounds
- Smooth hover animations and transitions
- Angular Material components throughout
- Responsive design (desktop, tablet, mobile)
- Toast notifications (success, error, warning, info)
- Loading spinners on all async operations

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Angular | 19 | SPA Framework |
| TypeScript | 5.x | Type Safety |
| Angular Material | 19 | UI Components |
| RxJS | 7.x | Reactive Programming |
| SCSS | - | Styling |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 4.x | Web Framework |
| Mongoose | 8.x | ODM |
| JWT | 9.x | Authentication |
| bcryptjs | 2.x | Password Hashing |
| express-validator | 7.x | Input Validation |

### Database
| Technology | Purpose |
|-----------|---------|
| MongoDB Atlas | Cloud Database |

---

## 📁 Folder Structure

```
Full_Stack_Web/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   └── taskController.js  # Task CRUD
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── Task.js            # Task schema
│   ├── routes/
│   │   ├── authRoutes.js      # Auth endpoints
│   │   └── taskRoutes.js      # Task endpoints
│   ├── server.js              # Express entry point
│   ├── .env                   # Environment variables
│   └── package.json
│
└── frontend/
    └── src/
        └── app/
            ├── components/
            │   ├── navbar/        # Navigation component
            │   ├── login/         # Login page
            │   ├── register/      # Registration page
            │   ├── dashboard/     # Dashboard with stats
            │   ├── task-list/     # Task listing (grid/list)
            │   ├── task-form/     # Add/Edit task form
            │   ├── profile/       # User profile settings
            │   ├── not-found/     # 404 page
            │   └── shared/        # Confirm dialog
            ├── services/
            │   ├── auth.service.ts        # JWT auth operations
            │   ├── task.service.ts        # Task API calls
            │   └── notification.service.ts # Toast notifications
            ├── guards/
            │   └── auth.guard.ts  # Route protection
            ├── interceptors/
            │   └── auth.interceptor.ts    # JWT header injection
            ├── models/
            │   ├── user.model.ts  # User interfaces
            │   └── task.model.ts  # Task interfaces
            ├── environments/
            │   ├── environment.ts          # Dev config
            │   └── environment.prod.ts     # Prod config
            ├── app.routes.ts      # Route definitions
            ├── app.config.ts      # App providers
            └── app.component.ts   # Root component
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- npm 8+
- MongoDB Atlas account (free tier works)

---

### 1️⃣ Clone the Repository

```bash
git clone <your-repo-url>
cd Full_Stack_Web
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart-task-manager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:4200
```

#### Start Backend

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

Health check: `http://localhost:5000/api/health`

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

#### Configure API URL

The development API URL is pre-configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

#### Start Frontend

```bash
npm run start
# or
npx ng serve
```

Frontend runs at: `http://localhost:4200`

---

### 4️⃣ MongoDB Atlas Configuration

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Go to **Database Access** → Add new user with read/write access
4. Go to **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
5. Go to **Connect** → Choose "Connect your application"
6. Copy the connection string and replace in your `.env` file

---

## 📡 REST API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/update-profile` | Update profile | Yes |
| PUT | `/api/auth/change-password` | Change password | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all tasks (with filters) | Yes |
| GET | `/api/tasks/stats` | Get task statistics | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PUT | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Query Parameters for GET /api/tasks

| Parameter | Values | Description |
|-----------|--------|-------------|
| `status` | `todo`, `in-progress`, `completed`, `cancelled`, `all` | Filter by status |
| `priority` | `low`, `medium`, `high`, `critical`, `all` | Filter by priority |
| `search` | string | Search in title/description |
| `sortBy` | `createdAt`, `dueDate`, `priority`, `title` | Sort field |
| `sortOrder` | `asc`, `desc` | Sort direction |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (max: 50) |

---

## 🗄 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String (required, 2-50 chars),
  email: String (required, unique),
  password: String (hashed, select: false),
  avatar: String,
  role: 'user' | 'admin',
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Collection
```javascript
{
  _id: ObjectId,
  title: String (required, 3-100 chars),
  description: String (required, max 1000),
  priority: 'low' | 'medium' | 'high' | 'critical',
  status: 'todo' | 'in-progress' | 'completed' | 'cancelled',
  dueDate: Date (required),
  tags: [String],
  userId: ObjectId (ref: User),
  completedAt: Date,
  isOverdue: Boolean (virtual),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

- **JWT Authentication**: Tokens signed with HS256, 7-day expiry
- **bcrypt Hashing**: Password hashed with salt rounds = 12
- **Input Validation**: express-validator on all POST/PUT endpoints
- **Authorization**: Users can only access their own tasks
- **CORS**: Restricted to frontend origin only
- **Environment Variables**: All secrets in `.env` (never committed)
- **HTTP-only**: Token stored in localStorage (can be upgraded to httpOnly cookies)

---

## 🌐 Deployment

### Backend - Render

1. Push code to GitHub
2. Go to [Render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables in Render dashboard
7. Deploy!

### Frontend - Vercel

1. Build the app: `npx ng build --configuration=production`
2. Install Vercel CLI: `npm i -g vercel`
3. Run: `vercel --prod` from the `frontend/` folder
4. Update `environment.prod.ts` with your Render backend URL

---

## 🤖 AI Tools Used

AI assistance (Claude/ChatGPT) was used for:
- Understanding Angular 19 standalone components and signals API
- Generating boilerplate CRUD code patterns
- Debugging TypeScript compilation errors
- Improving documentation and README formatting

**The developer independently implemented:**
- Complete application architecture design
- Authentication flow and JWT strategy
- MongoDB schema design with indexes and virtuals
- Angular routing with lazy loading and guards
- Custom form validators and reactive forms
- HTTP interceptor for token injection
- Dashboard statistics aggregation queries
- Responsive CSS layouts and animations
- Netflix-style design system and typography choices
- Testing with Postman API collection
- Deployment configuration

---

## 🔮 Future Improvements

- [ ] Email verification on registration
- [ ] Forgot password with email reset link
- [ ] Task comments and activity log
- [ ] File attachment support
- [ ] Team collaboration (share tasks)
- [ ] Google OAuth login
- [ ] Push notifications (PWA)
- [ ] Dark/Light mode toggle
- [ ] Drag-and-drop Kanban board
- [ ] Export tasks to CSV/PDF
- [ ] Task recurring schedules
- [ ] AI-powered priority suggestions

---

## 📸 Screenshots

> Screenshots would be added here after deployment

| Login Page | Dashboard | Task List |
|-----------|-----------|-----------|
| [Screenshot] | [Screenshot] | [Screenshot] |

---

## 🎯 Git Commit History

```
feat: Initial Angular 19 project setup
feat: Initial Express.js backend setup
feat: MongoDB Atlas connection with Mongoose
feat: Create User model with bcrypt password hashing
feat: Create Task model with indexes and virtuals
feat: Implement JWT authentication middleware
feat: Create register and login API endpoints
feat: Implement full CRUD APIs for tasks
feat: Add task statistics aggregation endpoint
feat: Add search, filter, sort and pagination to tasks API
feat: Add Angular authentication service with signals
feat: Add HTTP interceptor for JWT token injection
feat: Add Angular route guards (auth and guest)
feat: Build Netflix-style login and register pages
feat: Build dashboard with stats cards and progress ring
feat: Build task list with grid/list toggle and filters
feat: Build task form (add/edit) with datepicker and tags
feat: Build profile settings page with password change
feat: Build 404 not-found page
feat: Add global Netflix-style dark design system
feat: Add Angular Material components and dark theme
feat: Add responsive design for mobile/tablet/desktop
feat: Add toast notification service
feat: Add confirm delete dialog component
feat: Add environment configuration for dev/prod
fix: Fix Angular template arrow function compatibility
feat: Write comprehensive README documentation
chore: Final project submission
```

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

Built with ❤️ using Angular 19, Node.js, and MongoDB

**Smart Task Manager** — *Organize Your Work, Amplify Results*

</div>
