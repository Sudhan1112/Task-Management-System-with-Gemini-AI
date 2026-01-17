import os
from groq import Groq
import json
from django.conf import settings

# Configure Groq client
client = Groq(api_key=os.environ["GROQ_API_KEY"])

class GroqService:
    """
    Groq-based AI service for interpreting natural language commands
    and converting them into structured actions for the Task Management System.
    """
    
    # Using Llama 3.3 70B for excellent JSON output and reasoning
    MODEL = "llama-3.3-70b-versatile"
    
    SYSTEM_INSTRUCTION = """You are an AI assistant for a Task Management System.
Your job is to interpret user natural language commands and convert them into a structured JSON action.

The system supports the following actions:
1. 'create_task': Create a new task.
2. 'update_task_status': Change the status of a task.
3. 'delete_task': Delete a task.
4. 'list_tasks': Show tasks, optionally filtered by status.

Task Statuses: 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'.


CRITICAL: You must respond with ONLY valid JSON.
If the user requests multiple actions (e.g., "Add task 1 and task 2"), return a LIST of JSON objects.
If it is a single action, return a single JSON object or a list with one object.

Output Format Examples:
- User: "Add a task to buy milk"
  Output: [{"action": "create_task", "params": {"title": "Buy milk"}}]

- User: "Add task A and task B"
  Output: [
      {"action": "create_task", "params": {"title": "Task A"}},
      {"action": "create_task", "params": {"title": "Task B"}}
  ]

- User: "Mark task 5 as completed"
  Output: [{"action": "update_task_status", "params": {"task_id": 5, "status": "COMPLETED"}}]

- User: "Start working on the presentation"
  Output: [{"action": "update_task_status", "params": {"title": "presentation", "status": "IN_PROGRESS"}}]

- User: "Show me all completed tasks"
  Output: [{"action": "list_tasks", "params": {"status": "COMPLETED"}}]

- User: "Delete the task about meeting"
  Output: [{"action": "delete_task", "params": {"title": "meeting"}}]

If the intent is unclear, return [{"action": "unknown", "message": "Could not understand command"}]

Remember: ONLY output valid JSON, nothing else."""

    @classmethod
    def interpret_command(cls, command: str) -> dict:
        """
        Sends the user command to Groq API and returns structured JSON intent.
        
        Args:
            command: Natural language command from user
            
        Returns:
            dict: Structured action with params
        """
        try:
            response = client.chat.completions.create(
                model=cls.MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": cls.SYSTEM_INSTRUCTION
                    },
                    {
                        "role": "user",
                        "content": command
                    }
                ],
                temperature=0.1,  # Low temperature for consistent JSON output
                max_tokens=500,
                response_format={"type": "json_object"}  # Force JSON output
            )
            
            # Extract the response text
            response_text = response.choices[0].message.content.strip()
            
            # Parse and return JSON
            parsed_json = json.loads(response_text)
            
            # Handle case where AI returns a list of actions instead of a single object
            if isinstance(parsed_json, list):
                if len(parsed_json) > 0:
                    parsed_json = parsed_json[0]
                else:
                    return {"action": "unknown", "message": "AI returned an empty list"}
            
            if not isinstance(parsed_json, dict):
                 return {"action": "error", "message": "AI returned invalid JSON structure (not a dictionary)"}

            return parsed_json
            
        except json.JSONDecodeError as e:
            print(f"Groq JSON Parse Error: {e}")
            print(f"Response text: {response_text}")
            return {"action": "error", "message": "Failed to parse AI response"}
        except Exception as e:
            print(f"Groq Error: {e}")
            return {"action": "error", "message": str(e)}
