import os
import google.generativeai as genai
import json
from django.conf import settings

# Configure Gemini
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

class GeminiService:
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    SYSTEM_INSTRUCTION = """
    You are an AI assistant for a Task Management System.
    Your job is to interpret user natural language commands and convert them into a structured JSON action.
    
    The system supports the following actions:
    1. 'create_task': Create a new task.
    2. 'update_task_status': Change the status of a task.
    3. 'delete_task': Delete a task.
    4. 'list_tasks': Show tasks, optionally filtered by status.

    Task Statuses: 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'.

    Output Format: JSON only. No markdown.
    
    Examples:
    - User: "Add a task to buy milk"
      Output: {"action": "create_task", "params": {"title": "Buy milk"}}
    
    - User: "Mark task 5 as completed"
      Output: {"action": "update_task_status", "params": {"task_id": 5, "status": "COMPLETED"}}
      (Note: If task ID is not explicitly mentioned, try to infer or ask, but for this task, assume ID or Title helps identify. If Title is given, output title in params instead of task_id)
      
    - User: "Start working on the presentation"
      Output: {"action": "update_task_status", "params": {"title": "presentation", "status": "IN_PROGRESS"}}

    - User: "Show me all completed tasks"
      Output: {"action": "list_tasks", "params": {"status": "COMPLETED"}}

    - User: "Delete the task about meeting"
      Output: {"action": "delete_task", "params": {"title": "meeting"}}
    
    If the intent is unclear, return {"action": "unknown", "message": "Could not understand command"}
    """

    @classmethod
    def interpret_command(cls, command: str) -> dict:
        try:
            response = cls.model.generate_content(
                f"{cls.SYSTEM_INSTRUCTION}\n\nUser Command: {command}"
            )
            # Clean response text (remove ```json ... ``` if present)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Gemini Error: {e}")
            return {"action": "error", "message": str(e)}
