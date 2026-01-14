from django.core.exceptions import ValidationError
from .models import Task

class TaskService:
    @staticmethod
    def create_task(title: str, description: str = None) -> Task:
        return Task.objects.create(title=title, description=description, status=Task.Status.NOT_STARTED)

    @staticmethod
    def update_status(task: Task, new_status: str) -> Task:
        current_status = task.status
        
        # Define allowed transitions
        allowed_transitions = {
            Task.Status.NOT_STARTED: [Task.Status.IN_PROGRESS],
            Task.Status.IN_PROGRESS: [Task.Status.COMPLETED],
            Task.Status.COMPLETED: [],  # No transitions allowed from Completed
        }

        if new_status == current_status:
            return task  # No change

        if new_status not in allowed_transitions.get(current_status, []):
            raise ValidationError(f"Invalid state transition from {current_status} to {new_status}")

        task.status = new_status
        task.save()
        return task

    @staticmethod
    def get_task(task_id: int) -> Task:
        try:
            return Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            raise ValidationError(f"Task with ID {task_id} does not exist")
