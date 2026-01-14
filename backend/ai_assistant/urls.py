from django.urls import path
from .views import AICommandView

urlpatterns = [
    path('command/', AICommandView.as_view(), name='ai-command'),
]
