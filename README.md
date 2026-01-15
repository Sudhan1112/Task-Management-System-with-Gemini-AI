# Task Management System with Groq AI

## Overview
A full-stack task management application where users can manage tasks via a React UI or natural language commands processed by Groq AI (Llama 3.3 70B model).

## 1. Task Model & State Design
The core entity is the `Task`, which enforces a strict state machine.
**States:**
- `NOT_STARTED`: Initial state.
- `IN_PROGRESS`: Work has begun.
- `COMPLETED`: Work is finished.

**Adherence:**
The state logic is centralized in `tasks/services.py` (`TaskService`), ensuring that both API calls and AI commands follow the exact same rules.

## 2. State Transition Rules
Transitions are strictly one-way:
- `NOT_STARTED` -> `IN_PROGRESS`
- `IN_PROGRESS` -> `COMPLETED`
- Any other transition (e.g., skipping straight to Completed, or moving back to Not Started) is rejected with a `ValidationError`.

## 3. Database Choice
**Database:** SQLite
**Reason:** Lightweight, serverless, and easy to set up for this specific task requirement. It fulfills the data integrity needs with ACID compliance without the overhead of a separate database server.
**Schema:**
- `id`: Auto-increment Integer (Primary Key)
- `title`: String (255 chars)
- `description`: Text (Optional)
- `status`: String (Enum: NOT_STARTED, IN_PROGRESS, COMPLETED)
- `created_at`: DateTime (Auto-add)
- `updated_at`: DateTime (Auto-update)

## 4. AI Input Processing
**Role of AI:** Intent Interpretation only. AI does NOT modify the DB directly.
**Process:**
1. User sends natural language command (e.g., "Add task...").
2. Backend (`GroqService`) sends prompt to Groq API (Llama 3.3 70B) with strict JSON output instructions.
3. Groq returns structured JSON (e.g., `{"action": "create_task", "params": {...}}`).
4. System validates the JSON structure.

## 5. Mapping AI to Business Logic
The `IntentDispatcher` (`ai_assistant/dispatcher.py`) acts as the bridge:
- Receives the JSON intent.
- Maps `action` string to specific `TaskService` methods.
- Example: `create_task` -> `TaskService.create_task()`.
- Example: `update_task_status` -> `TaskService.update_status()`.
**Benefits:** Reuses the exact same validation and state rules as the REST API.

## 6. Handling Ambiguity & Errors
- **Ambiguity:** If task ID/Title isn't clear, Groq is instructed to infer or fail gracefully. The Dispatcher checks if the task exists before acting.
- **Invalid Commands:** If `TaskService` raises a validation error (e.g., invalid state transition), the error is caught and returned as a user-friendly message to the chat interface.

## 7. Detailed Architecture & Design Decisions
The application follows a **Service-Oriented Architecture** within Django to ensure separation of concerns and reusability.

### Key Architectural Layers:

1.  **Domain Layer (`models.py`)**:
    -   Defines the `Task` entity and strict choices for Status (`NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`).
    -   Contains no complex logic, only data structure.

2.  **Business Logic Layer (`services.py`)**:
    -   **`TaskService`**: This is the core of the application. It encapsulates ALL business rules.
    -   **Validation**: It enforces the state machine rules (e.g., preventing `Not Started` -> `Completed` directly).
    -   **Single Source of Truth**: Both the REST API views and the AI Dispatcher call this service. This guarantees that **AI cannot bypass business rules**.

3.  **Interface Layers**:
    -   **REST API (`views.py`)**: Handles HTTP requests, authentication, and serialization. It explicitly calls `TaskService` for creating or updating tasks to ensure validation runs.
    -   **AI Dispatcher (`ai_assistant/dispatcher.py`)**: Acts as a translation layer. It receives the JSON intent from `GroqService`, validates parameters, and calls the exact same `TaskService` methods as the API.

### Design Patterns Used:
-   **Service Pattern**: Decoupling logic from Views allowing reuse (API vs AI).
-   **Adapter Pattern**: The AI Dispatcher adapts the AI's JSON output to the Service Layer's method signatures.
-   **State Machine**: Implicitly implemented in `TaskService.update_status` via `allowed_transitions` dictionary.

### Trade-offs:
-   **Polling vs WebSockets**: For simplicity and statelessness, the frontend polls/refreshes after AI commands. WebSockets would be better for real-time updates but add significant complexity.
-   **SQLite**: Chosen for zero-configuration and portability for this evaluation task.
-   **LLM Choice**: Using Groq's Llama 3.3 70B instead of small local models ensures high reliability in outputting valid JSON, reducing the need for complex retry logic.

## 8. Groq API Setup
**Get your API key:**
1. Visit [Groq Console](https://console.groq.com/)
2. Create a free account (no credit card required)
3. Generate an API key from the dashboard
4. Add to `backend/.env` as `GROQ_API_KEY=your_key_here`

**Model Used:** `llama-3.3-70b-versatile`
- Excellent for JSON structured outputs
- Fast inference speed (~2 seconds)
- Superior natural language understanding

## How to Run
### Backend
1. Navigate to `backend`.
2. Activate venv: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows).
3. Install dependencies: `pip install -r requirements.txt`. (Already done)
4. Apply migrations: `python manage.py migrate`. (Required for SQLite)
5. Run server: `python manage.py runserver`.

### Frontend
1. Navigate to `frontend`.
2. Install dependencies: `npm install`. (Already done)
3. Run dev server: `npm run dev`.
4. Open `http://localhost:5173`.

## 10. Project Structure
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
