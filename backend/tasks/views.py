from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.core.exceptions import ValidationError
from .models import Task
from .serializers import TaskSerializer
from .services import TaskService

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        status_param = request.query_params.get('status')
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            task = TaskService.create_task(
                title=serializer.validated_data['title'],
                description=serializer.validated_data.get('description')
            )
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data.get('status')
        
        try:
            # Handle other fields update
            if 'title' in serializer.validated_data:
                instance.title = serializer.validated_data['title']
            if 'description' in serializer.validated_data:
                instance.description = serializer.validated_data['description']
            
            instance.save()

            # Handle status transition via Service
            if new_status and new_status != instance.status:
                TaskService.update_status(instance, new_status)

            return Response(TaskSerializer(instance).data)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def filter_by_status(self, request):
        status_param = request.query_params.get('status')
        if not status_param:
            return Response({'error': 'Status parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        tasks = self.queryset.filter(status=status_param)
        serializer = self.get_serializer(tasks, many=True)
        return Response(serializer.data)
