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
**Database:** PostgreSQL (Preferred)
**Reason:** Scalable relational database that ensures data integrity and supports complex queries.
**Schema:**
- `id`: Auto-increment INT
- `title`: String (255)
- `description`: Text (Optional)
- `status`: String (Enum: NOT_STARTED, IN_PROGRESS, COMPLETED)
- `created_at`, `updated_at`: Timestamps

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

## 7. Architecture & Trade-offs
**Stack:** React (Vite) + Django (DRF) + PostgreSQL.
**Key Decisions:**
- **Service Layer Pattern**: Decoupled views from logic to support dual-entry (API & AI).
- **Groq (Llama 3.3 70B Versatile)**: Chosen for excellent JSON structured output, fast inference, and superior natural language understanding.
- **Polling/REST for Frontend**: Kept simple (fetch on command success) rather than WebSockets for this scope.

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
4. Run server: `python manage.py runserver`.

### Frontend
1. Navigate to `frontend`.
2. Install dependencies: `npm install`. (Already done)
3. Run dev server: `npm run dev`.
4. Open `http://localhost:5173`.
