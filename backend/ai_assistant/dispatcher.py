from tasks.services import TaskService
from tasks.models import Task
from django.core.exceptions import ValidationError

class IntentDispatcher:
    @staticmethod
    def handle_intent(intent: dict):
        action = intent.get('action')
        params = intent.get('params', {})

        if action == 'create_task':
            title = params.get('title')
            description = params.get('description')
            if not title:
                return {"success": False, "message": "Title is required for creating a task."}
            task = TaskService.create_task(title=title, description=description)
            return {"success": True, "message": f"Task '{task.title}' created successfully.", "task": {"id": task.id, "title": task.title}}

        elif action == 'update_task_status':
            # Logic to find task by ID or Title
            task = IntentDispatcher._find_task(params)
            if not task:
                return {"success": False, "message": "Task not found."}
            
            new_status = params.get('status')
            title_part = params.get('title') # If found by title
            
            # Map friendly status to Enum if needed, but Gemini should output Enum values ideally.
            # Assuming Gemini is strict as per prompt.
            
            try:
                TaskService.update_status(task, new_status)
                return {"success": True, "message": f"Task '{task.title}' updated to {new_status}."}
            except ValidationError as e:
                 return {"success": False, "message": str(e)}

        elif action == 'list_tasks':
            status_filter = params.get('status')
            tasks = Task.objects.all()
            if status_filter:
                tasks = tasks.filter(status=status_filter)
            
            # Limit to 5 for brevity in chat response? Or return count.
            task_list = [{"id": t.id, "title": t.title, "status": t.status} for t in tasks[:5]]
            return {"success": True, "message": f"Found {tasks.count()} tasks.", "tasks": task_list}

        elif action == 'delete_task':
             task = IntentDispatcher._find_task(params)
             if not task:
                return {"success": False, "message": "Task not found."}
             title = task.title
             task.delete()
             return {"success": True, "message": f"Task '{title}' deleted."}

        return {"success": False, "message": "Unknown action."}

    @staticmethod
    def _find_task(params):
        task_id = params.get('task_id')
        title = params.get('title')
        
        if task_id:
            try:
                return Task.objects.get(id=task_id)
            except Task.DoesNotExist:
                return None
        
        if title:
            # Fuzzy match or exact? Using icontains for better UX
            tasks = Task.objects.filter(title__icontains=title)
            if tasks.exists():
                return tasks.first() # Return first match
        
        return None
