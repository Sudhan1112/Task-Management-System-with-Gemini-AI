from tasks.services import TaskService
from tasks.models import Task
from django.core.exceptions import ValidationError

class IntentDispatcher:
    @staticmethod
    def handle_intent(intents):
        """
        Handles one or multiple user intents.
        Args:
            intents: A single dict OR a list of dicts.
        Returns:
            dict: Aggregated result.
        """
        # Normalize to list
        if isinstance(intents, dict):
            intents = [intents]
        
        if not isinstance(intents, list):
             return {"success": False, "message": "Invalid intent format received."}

        results = []
        success_count = 0
        
        for intent in intents:
            if not isinstance(intent, dict):
                continue
                
            action = intent.get('action')
            params = intent.get('params', {})
            result = {"action": action, "success": False, "message": ""}

            if action == 'create_task':
                title = params.get('title')
                description = params.get('description')
                if not title:
                    result["message"] = "Title is required for creating a task."
                else:
                    try:
                        task = TaskService.create_task(title=title, description=description)
                        result["success"] = True
                        result["message"] = f"Task '{task.title}' created."
                        result["task"] = {"id": task.id, "title": task.title}
                        success_count += 1
                    except Exception as e:
                        result["message"] = str(e)

            elif action == 'update_task_status':
                task = IntentDispatcher._find_task(params)
                if not task:
                    result["message"] = "Task not found."
                else:
                    new_status = params.get('status')
                    try:
                        TaskService.update_status(task, new_status)
                        result["success"] = True
                        result["message"] = f"Task '{task.title}' updated to {new_status}."
                        success_count += 1
                    except ValidationError as e:
                        result["message"] = str(e)
            
            elif action == 'list_tasks':
                status_filter = params.get('status')
                tasks = Task.objects.all()
                if status_filter:
                    tasks = tasks.filter(status=status_filter)
                task_list = [{"id": t.id, "title": t.title, "status": t.status} for t in tasks[:5]]
                result["success"] = True
                result["message"] = f"Found {tasks.count()} tasks."
                result["tasks"] = task_list
                success_count += 1

            elif action == 'delete_task':
                task = IntentDispatcher._find_task(params)
                if not task:
                    result["message"] = "Task not found."
                else:
                    title = task.title
                    task.delete()
                    result["success"] = True
                    result["message"] = f"Task '{title}' deleted."
                    success_count += 1
            
            else:
                 result["message"] = "Unknown action."

            results.append(result)

        # Summarize results
        if len(results) == 1:
            return results[0] # Return single object structure for backward compatibility/simplicity
        
        return {
            "success": success_count > 0,
            "message": f"Processed {len(results)} actions. {success_count} succeeded.",
            "results": results
        }

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
