# Skipli Board - Collaborative Task Management System
## Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)
*Overview of all boards and projects*

### Board View
![Board View](./screenshots/board.png)
*Kanban-style board with drag-and-drop functionality*

### Task Detail Modal
![Task Detail](./screenshots/task-detail.png)
*Detailed task view with GitHub integration*

### GitHub Integration
![GitHub Integration](./screenshots/github-integration.png)
*Attach PRs, commits, and issues to tasks*

## Features

- **Real-time Collaboration**: Multiple users can work together with instant updates via Socket.IO
- **Kanban Boards**: Visual task management with drag-and-drop functionality
- **GitHub Integration**: Link pull requests, commits, and issues directly to tasks
- **Authentication**: Secure login with email/OTP and GitHub OAuth
- **Team Management**: Invite members, assign tasks, and manage permissions
- **Task Management**: Create, edit, delete, and organize tasks with priorities and deadlines

## Project Structure

```
skipli-ieviet-challange/
├── src/
│   ├── components/
│   │   ├── boards/              # Board-related components
│   │   │   ├── BoardColumn.tsx
│   │   │   ├── CreateBoardModal.tsx
│   │   │   ├── InviteMemberModal.tsx
│   │   │   └── TaskDetailModal.tsx
│   │   ├── layouts/             # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedLayout.tsx
│   │   │   └── UnProtectedLayout.tsx
│   │   ├── ui/                  # Reusable UI components (shadcn/ui)
│   │   ├── login-form.tsx
│   │   └── signup-form.tsx
│   ├── contexts/
│   │   └── SocketContext.tsx    # Socket.IO context
│   ├── hooks/
│   │   ├── useBoards.ts         # Board management hooks
│   │   ├── useCardsAndTasks.ts  # Task management hooks
│   │   ├── useGitHub.ts         # GitHub integration hooks
│   │   └── useUsers.ts          # User management hooks
│   ├── lib/
│   │   ├── axios.ts             # API client configuration
│   │   ├── firebase.ts          # Firebase client setup
│   │   └── utils.ts             # Utility functions
│   ├── pages/
│   │   ├── board/               # Board page
│   │   └── dashboard/           # Dashboard page
│   ├── schemas/
│   │   └── board.ts             # Zod validation schemas
│   ├── App.tsx
│   └── main.tsx
├── public/
└── package.json

skipli-ieviet-challange-be/
├── src/
│   ├── config/
│   │   ├── firebase.js          # Firebase Admin SDK setup
│   │   └── passport.js          # Passport GitHub strategy
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── boardController.js   # Board CRUD operations
│   │   ├── cardController.js    # Card CRUD operations
│   │   ├── taskController.js    # Task CRUD operations
│   │   └── githubController.js  # GitHub API integration
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT authentication
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── boardRoutes.js
│   │   ├── cardRoutes.js
│   │   ├── taskRoutes.js
│   │   └── githubRoutes.js
│   ├── socket/
│   │   └── socketHandlers.js    # Real-time event handlers
│   └── server.js                # Express server entry point
└── package.json
```

## Tech Stack

### Frontend
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS 4** - Styling
- **React Query** - Data fetching and caching
- **React Router 7** - Routing
- **Socket.IO Client** - Real-time communication
- **Firebase SDK** - Authentication
- **Zod** - Schema validation
- **React Hook Form** - Form management
- **shadcn/ui** - UI components
- **@hello-pangea/dnd** - Drag and drop

### Backend
- **Node.js** - Runtime
- **Express 5** - Web framework
- **Firebase Admin SDK** - Database and authentication
- **Socket.IO** - Real-time communication
- **Passport.js** - OAuth authentication
- **JWT** - Token-based auth
- **Axios** - HTTP client
- **Nodemailer** - Email service

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recommended) or npm
- **Firebase Account** with a project created
- **GitHub Account** for OAuth integration

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vannamphuc/skipli-ieviet-challange.git
cd skipli-ieviet-challange
```

### 2. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., `skipli-board`)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

#### Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select your location
5. Click **"Enable"**

#### Get Firebase Web Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll to **"Your apps"** section
3. Click **Web icon** (</>) to create a web app
4. Register app with nickname (e.g., `skipli-web`)
5. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

#### Generate Firebase Admin SDK Key

1. In Firebase Console, go to **Project Settings** → **Service accounts**
2. Click **"Generate new private key"**
3. Download the JSON file
4. Open the file and copy:
   - `project_id`
   - `client_email`
   - `private_key` (entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

### 3. GitHub OAuth Setup

#### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `Skipli Board`
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Click **"Register application"**
5. Copy the **Client ID**
6. Click **"Generate a new client secret"**
7. Copy the **Client Secret** (save it immediately, you won't see it again)

### 4. Environment Configuration

#### Frontend Environment Variables

Create `.env` file in the frontend root:

```bash
cd skipli-ieviet-challange
```

Create `.env`:

```env
# Backend API URL
VITE_BACKEND_URL=http://localhost:3000/api

# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### Backend Environment Variables

Create `.env` file in the backend root:

```bash
cd ../skipli-ieviet-challange-be
```

Create `.env`:

```env
# Server Configuration
PORT=3000

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Firebase Admin SDK (from downloaded JSON file)
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"

# Email Configuration (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# GitHub OAuth (from GitHub OAuth App)
GITHUB_CLIENT_ID=Iv1.abc123def456
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Note**: For `EMAIL_PASS`, if using Gmail:
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use that app password instead of your regular password

### 5. Install Dependencies

#### Frontend

```bash
cd skipli-ieviet-challange
pnpm install
# or
npm install
```

#### Backend

```bash
cd skipli-ieviet-challange-be
npm install
```

### 6. Run the Application

#### Start Backend Server

```bash
cd skipli-ieviet-challange-be
npm run dev
```

Backend will run on `http://localhost:3000`

#### Start Frontend Development Server

```bash
cd skipli-ieviet-challange
pnpm dev
# or
npm run dev
```

Frontend will run on `http://localhost:5173`

### 7. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## Authentication Flow

### Email/OTP Authentication
1. User enters email on signup page
2. System sends OTP to email
3. User verifies OTP
4. Account is created and JWT token is issued

### GitHub OAuth
1. User clicks "Login with GitHub"
2. Redirected to GitHub authorization page
3. User authorizes the app
4. GitHub redirects back with authorization code
5. Backend exchanges code for access token
6. User account is created/updated with GitHub data
7. JWT token is issued

## Key Features Usage

### Creating a Board
1. Click "Create Board" on dashboard
2. Enter board name and description
3. Board is created and you're redirected to it

### Managing Tasks
1. Click "Add Task" in any column
2. Fill in task details (title, description, priority, deadline)
3. Assign members by clicking the "+" icon
4. Drag and drop tasks between columns

### GitHub Integration
1. Open a task detail modal
2. Enter a GitHub repository (e.g., `facebook/react`)
3. Browse pull requests, commits, and issues
4. Click to attach relevant items to the task
5. Attached items appear with links to GitHub

### Real-time Collaboration
- Multiple users can work on the same board simultaneously
- Changes are instantly reflected for all users
- See who's assigned to tasks in real-time

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account with email
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/login` - Login with email
- `GET /api/auth/github` - Initiate GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback

### Boards
- `GET /api/boards` - Get all user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `POST /api/boards/:id/invite` - Invite member
- `POST /api/boards/:id/accept-invite` - Accept invitation

### Cards & Tasks
- `GET /api/boards/:boardId/cards` - Get all cards
- `POST /api/boards/:boardId/cards` - Create card
- `POST /api/cards/:cardId/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `POST /api/tasks/:taskId/assign` - Assign member
- `DELETE /api/tasks/:taskId/unassign` - Remove member

### GitHub
- `GET /api/github/repo?owner=X&repo=Y` - Get repo info
- `POST /api/github/:boardId/:cardId/:taskId/attach` - Attach GitHub item
- `POST /api/github/:boardId/:cardId/:taskId/remove` - Remove attachment

## Configuration

### Firestore Security Rules

In Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Boards collection
    match /boards/{boardId} {
      allow read: if request.auth != null &&
                     (resource.data.members.hasAny([request.auth.uid]) ||
                      resource.data.createdBy == request.auth.uid);
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                               resource.data.createdBy == request.auth.uid;

      // Nested collections
      match /cards/{cardId} {
        allow read, write: if request.auth != null;

        match /tasks/{taskId} {
          allow read, write: if request.auth != null;
        }
      }
    }
  }
}
```

Built with ❤️ by Van Nam Phuc
