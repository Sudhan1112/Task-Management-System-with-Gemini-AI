# 🧠 Task Management System with Groq AI

A full-stack task management application where users can manage tasks via a **React-based UI** or **natural language commands** processed by **Groq AI (Llama 3.3 70B)**.

This system is designed with a strong emphasis on **clean architecture**, **strict business rules**, and **safe AI integration**.
AI interprets intent — **it never bypasses backend validation**.

---

## 📌 Overview

The Task Management System allows users to:

* Create, update, and delete tasks manually through a Kanban-style UI
* Control tasks using natural language commands (chat-based AI)
* Enforce a strict task lifecycle using backend business logic
* Share the same validation rules between REST APIs and AI commands

Core philosophy:
**AI is an assistant, not an authority.**

---

## 🧰 Tech Stack

### Frontend

* **Framework:** React (Vite)
* **Language:** JavaScript (ES6+)
* **Styling:** Tailwind CSS
* **HTTP Client:** Axios
* **State Management:** React Hooks
* **Drag & Drop:** React DnD

### Backend

* **Framework:** Django 5.x
* **API:** Django REST Framework (DRF)
* **Language:** Python 3.x
* **Database:** SQLite (local development)
* **AI Integration:** Groq Python SDK

### AI & Infrastructure

* **LLM Model:** Llama 3.3 70B (Groq Cloud)
* **Version Control:** Git
* **IDE:** VS Code

---

## 🏗️ System Design

### High-Level Design (HLD)

The application follows a **Client–Server Architecture** enhanced with an **AI Service Layer**.

### Architecture Overview

1. **Client (Frontend)**
   A Single Page Application (SPA) responsible for:

   * Rendering the task board
   * Handling drag-and-drop interactions
   * Capturing text-based AI commands

2. **Server (Backend)**
   Django REST API acting as the central orchestrator:

   * Manages data persistence
   * Enforces validation and business rules
   * Dispatches AI intents to core services

3. **Database**
   SQLite relational database storing structured task data.

4. **AI Provider (Groq Cloud)**
   External inference engine that converts natural language into structured JSON actions.

### Data Flow

**Standard UI Action**

```
User UI → API Endpoint → TaskService → Database
```

**AI Action**

```
User Prompt → AI API → Intent Dispatcher → TaskService → Database
```

---

## 🧩 Low-Level Design (LLD)

### Frontend Component Structure

* **App.tsx**
  Root entry point, routing, and global layout.

* **TaskList.tsx**
  Main dashboard integrating task lists, drag-and-drop logic, and state handling.

* **TaskCard.tsx**
  Reusable UI component for rendering individual tasks.

* **ChatInterface.tsx**
  AI sidebar handling user input, API calls, and AI responses.

---

### Backend Class Design

#### Task Model

Represents the database table for tasks.

**Fields**

* `title`
* `description`
* `status` (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`)
* `created_at`
* `updated_at`

---

#### TaskService (Business Logic Layer)

Central authority for all task operations and validations.

**Methods**

* `create_task(title, description)`
* `update_status(task_id, new_status)`
* `delete_task(task_id)`

**Why this layer exists**

* Keeps logic out of Views
* Allows reuse by both REST API and AI Dispatcher
* Prevents AI from bypassing validation rules

---

#### IntentDispatcher (AI Logic Layer)

Bridges AI-generated JSON intents to backend services.

**Responsibilities**

* Validate AI intent structure
* Map `action` → service method
* Handle task existence checks

**Examples**

* `create_task` → `TaskService.create_task()`
* `update_task_status` → `TaskService.update_status()`
* `delete_task` → `TaskService.delete_task()`

---

## 🌐 API Endpoints

### Task APIs

* `GET /api/tasks/` — List all tasks
* `POST /api/tasks/` — Create a task
* `PATCH /api/tasks/{id}/` — Update task details or status
* `DELETE /api/tasks/{id}/` — Delete a task

### AI API

* `POST /api/ai/chat/` — Send natural language command to AI

---

## 🔄 Task Model & State Design

The core entity is the **Task**, governed by a strict state machine.

### Task States

* `NOT_STARTED` — Initial state
* `IN_PROGRESS` — Work has begun
* `COMPLETED` — Work is finished

---

## 🚦 State Transition Rules

Transitions are **one-way only**:

* `NOT_STARTED → IN_PROGRESS`
* `IN_PROGRESS → COMPLETED`

🚫 Invalid transitions are rejected:

* Skipping states
* Reverting to previous states

All enforcement happens inside `TaskService`.

---

## 🗄️ Database Choice

**Database:** SQLite

**Reasoning**

* Lightweight and serverless
* ACID compliant
* Zero configuration overhead
* Ideal for evaluation and local development

### Database Schema

| Field       | Type     | Description        |
| ----------- | -------- | ------------------ |
| id          | Integer  | Primary Key        |
| title       | String   | Max 255 characters |
| description | Text     | Optional           |
| status      | Enum     | Task state         |
| created_at  | DateTime | Auto-generated     |
| updated_at  | DateTime | Auto-updated       |

---

## 🤖 AI Input Processing

**AI Role:** Intent interpretation only
AI **does not directly modify the database**.

### Processing Flow

1. User sends a natural language command
2. Backend sends prompt to Groq API with strict JSON instructions
3. Groq returns structured JSON intent
4. JSON is validated for structure and safety
5. Intent is dispatched to `TaskService`

### Example AI Output

```json
{
  "action": "create_task",
  "params": {
    "title": "Finish documentation",
    "description": "Complete README formatting"
  }
}
```

---

## 🔗 Mapping AI to Business Logic

The **IntentDispatcher** ensures:

* AI output is sanitized
* Business rules are reused
* Validation logic is shared

This guarantees:

* No AI privilege escalation
* Identical behavior for UI and AI actions

---

## ⚠️ Handling Ambiguity & Errors

* **Ambiguous Commands:**
  Dispatcher verifies task existence before execution

* **Invalid Commands:**
  Validation errors are converted to user-friendly chat messages

* **State Violations:**
  Rejected by `TaskService` and safely reported

---

## 🧱 Architectural Layers & Decisions

### Core Layers

1. **Domain Layer (`models.py`)**
   Defines data structures only.

2. **Business Logic Layer (`services.py`)**
   Enforces all rules and validations.

3. **Interface Layers**

   * REST API (`views.py`)
   * AI Dispatcher (`ai_assistant/dispatcher.py`)

---

### Design Patterns Used

* **Service Pattern** — Business logic isolation
* **Adapter Pattern** — AI JSON → Service calls
* **State Machine** — Controlled task lifecycle

---

### Trade-offs

* **Polling over WebSockets**
  Simpler, stateless, lower complexity

* **SQLite over PostgreSQL**
  Zero-setup and portable

* **Large LLM (70B)**
  Higher reliability for structured JSON output

---

## 🔑 Groq API Setup

### Get Your API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Create a free account
3. Generate an API key
4. Add it to `backend/.env`

```env
GROQ_API_KEY=your_key_here
```

### Model Used

* `llama-3.3-70b-versatile`
* Fast inference
* Strong JSON reliability
* High intent accuracy

---

## 🚀 How to Run the Project

### Backend

```bash
cd backend
source venv/bin/activate      # Mac/Linux
venv\Scripts\activate         # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:
👉 `http://localhost:5173`

---

## Project Structure

```markdown
Task Management System/
├── backend/                      # Backend application logic (Django + Django REST Framework)
│   ├── ai_assistant/             # Django App: Handles all AI-related functionality
│   │   ├── migrations/           # Database migrations for the AI app (manages DB schema changes)
│   │   │   └── __init__.py       # Python package initialization file
│   │   ├── __init__.py           # Marks directory as a Python package
│   │   ├── admin.py              # Configuration for viewing AI models in the Django Admin Interface
│   │   ├── apps.py               # Application configuration settings for the AI Assistant app
│   │   ├── dispatcher.py         # Core Logic: Maps structured AI intents (JSON) to concrete TaskService business methods
│   │   ├── models.py             # Database models for storing AI chat history (currently empty/unused)
│   │   ├── services.py           # Service Layer: Manages Groq API communication, prompt engineering, and response parsing
│   │   ├── tests.py              # Unit tests ensuring AI intent parsing and dispatching works correctly
│   │   ├── urls.py               # URL routing specific to the AI Assistant app API endpoints
│   │   └── views.py              # API ViewSets: Handles HTTP requests from frontend to trigger AI commands
│   │
│   ├── core/                     # Project Configuration Root: Holds settings for the entire Django project
│   │   ├── __init__.py           # Marks directory as a Python package
│   │   ├── asgi.py               # ASGI configuration entry point for asynchronous web servers
│   │   ├── settings.py           # Main Config: Database, Apps, Middleware, Auth, and Environment Variables
│   │   ├── urls.py               # Root URL Router: Dispatches requests to specific apps (tasks/ai_assistant)
│   │   └── wsgi.py               # WSGI configuration entry point for traditional synchronous web servers
│   │
│   ├── tasks/                    # Django App: Core business logic for Task Management
│   │   ├── migrations/           # Database migrations for the Task app (e.g., creating tasks table)
│   │   │   ├── 0001_initial.py   # Migration file: Defines the initial schema for the Task model
│   │   │   └── __init__.py       # Python package initialization file
│   │   ├── __init__.py           # Marks directory as a Python package
│   │   ├── admin.py              # Registers Task model with Django Admin for easy management
│   │   ├── apps.py               # Application configuration settings for the Tasks app
│   │   ├── models.py             # Data Layer: Defines the Task database schema (title, status, etc.)
│   │   ├── serializers.py        # Data Transformation: Converts complex Task model instances to/from JSON
│   │   ├── services.py           # Business Logic Layer: Enforces state transitions and handles task operations
│   │   ├── tests.py              # Unit tests for Task CRUD operations and state validation
│   │   ├── urls.py               # URL routing specific to the Tasks app API endpoints
│   │   └── views.py              # API ViewSets: Provides REST endpoints for frontend to Create/Read/Update/Delete tasks
│   │
│   ├── .env                      # Environment Variables: Stores secrets like GROQ_API_KEY (Not verified in git)
│   ├── db.sqlite3                # SQLite Database: Lightweight file-based database for development
│   ├── manage.py                 # Command-line utility for interacting with this Django project
│   └── requirements.txt          # Dependency List: Specifies all Python packages required to run the backend
│
├── frontend/                     # Frontend application logic (React + Vite + Tailwind CSS)
│   ├── node_modules/             # Dependency Library: Contains all installed npm packages (Excluded from git)
│   ├── public/                   # Static Assets: Files served directly to the browser
│   │   ├── background.png        # Image: Custom background used in the application layout
│   │   └── vite.svg              # Icon: Default Vite project logo
│   │
│   ├── src/                      # Source Code: Main development directory for React
│   │   ├── assets/               # Assets: Imported images/icons used within React components
│   │   │   └── react.svg         # Icon: React framework logo
│   │   │
│   │   ├── components/           # UI Components: Reusable React components
│   │   │   ├── ChatInterface.tsx # Component: The AI sidebar handling user input and chat display
│   │   │   ├── Layout.tsx        # Component: Main layout wrapper defining structure (Sidebar/Main area)
│   │   │   ├── TaskCard.tsx      # Component: Renders a single task card with drag-handle and actions
│   │   │   └── TaskEditModal.tsx # Component: Modal dialog form for editing task details
│   │   │
│   │   ├── pages/                # Page Views: Top-level components representing full pages
│   │   │   └── TaskList.tsx      # Page: The main dashboard view integrating Lists, DnD, and State Management
│   │   │
│   │   ├── services/             # API Layer: Functions for communicating with the Backend
│   │   │   └── api.ts            # API Client: Axios configuration and functions for all GET/POST requests
│   │   │
│   │   ├── App.css               # Styles: Global application-specific CSS styles
│   │   ├── App.tsx               # Root Component: Sets up Routes, Toast providers, and global providers
│   │   ├── index.css             # Styles: Tailwind directives and base CSS reset
│   │   ├── main.tsx              # Entry Point: Mounts the React application to the DOM
│   │   └── types.ts              # Type Definitions: Shared TypeScript interfaces (Task, TaskStatus)
│   │
│   ├── .gitignore                # Git Configuration: Specifies frontend files to ignore (e.g., node_modules)
│   ├── eslint.config.js          # Linter Config: Rules for code quality and consistency (ESLint)
│   ├── index.html                # HTML Entry: The single HTML file that loads the React app
│   ├── package-lock.json         # Dependency Lock: Locks npm versions for consistent installs
│   ├── package.json              # Project Manifest: Scripts, version, and dependency definitions
│   ├── postcss.config.js         # CSS Config: Configuration for PostCSS (used by Tailwind)
│   ├── tailwind.config.js        # Tailwind Config: Custom themes, colors, and content paths
│   ├── tsconfig.app.json         # TypeScript: Configuration for application code
│   ├── tsconfig.json             # TypeScript: Base configuration reference
│   ├── tsconfig.node.json        # TypeScript: Configuration for Node.js based build tools
│   └── vite.config.ts            # Build Tool: Configuration for Vite dev server and bundler
│
├── .git/                         # Version Control: Git repository metadata folder
├── .gitignore                    # Git Configuration: Root level ignore rules (backend venv, etc.)
├── create_submission.py          # Utility Script: Automates zipping the project for submission (ignoring unnecessary files)
└── README.md                     # Documentation: Detailed project guide, architecture details, and setup instructions
```

---

## ✅ Summary

This project demonstrates:

* Clean separation of concerns
* Safe and controlled AI integration
* Strict business rule enforcement
* Production-inspired backend architecture
* Scalable design without unnecessary complexity

**AI assists users — it never replaces system authority.**
