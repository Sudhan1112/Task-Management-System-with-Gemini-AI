from django.test import TestCase
from django.core.exceptions import ValidationError
from .models import Task
from .services import TaskService

class TaskServiceTest(TestCase):
    def test_create_task(self):
        task = TaskService.create_task(title="New Task")
        self.assertEqual(task.status, Task.Status.NOT_STARTED)
        self.assertEqual(task.title, "New Task")

    def test_valid_transition_not_started_to_in_progress(self):
        task = TaskService.create_task(title="Task 1")
        TaskService.update_status(task, Task.Status.IN_PROGRESS)
        self.assertEqual(task.status, Task.Status.IN_PROGRESS)

    def test_valid_transition_in_progress_to_completed(self):
        task = TaskService.create_task(title="Task 2")
        TaskService.update_status(task, Task.Status.IN_PROGRESS)
        TaskService.update_status(task, Task.Status.COMPLETED)
        self.assertEqual(task.status, Task.Status.COMPLETED)

    def test_invalid_transition_not_started_to_completed(self):
        task = TaskService.create_task(title="Task 3")
        with self.assertRaises(ValidationError):
            TaskService.update_status(task, Task.Status.COMPLETED)

    def test_invalid_transition_backwards(self):
        task = TaskService.create_task(title="Task 4")
        TaskService.update_status(task, Task.Status.IN_PROGRESS)
        with self.assertRaises(ValidationError):
            TaskService.update_status(task, Task.Status.NOT_STARTED)

    def test_invalid_transition_from_completed(self):
        task = TaskService.create_task(title="Task 5")
        TaskService.update_status(task, Task.Status.IN_PROGRESS)
        TaskService.update_status(task, Task.Status.COMPLETED)
        with self.assertRaises(ValidationError):
            TaskService.update_status(task, Task.Status.IN_PROGRESS)
