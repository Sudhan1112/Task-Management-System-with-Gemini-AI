from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import GroqService
from .dispatcher import IntentDispatcher

class AICommandView(APIView):
    def post(self, request):
        command = request.data.get('command')
        if not command:
            return Response({"error": "Command is required"}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Interpret Command
        intent = GroqService.interpret_command(command)
        
        if isinstance(intent, list):
            # Check the first intent for error/unknown if it's a list (heuristic)
            if not intent:
                 return Response({"error": "AI returned empty intent list"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            first_intent = intent[0]
            if first_intent.get('action') == 'error':
                 return Response({"error": first_intent.get('message')}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            if first_intent.get('action') in ['unknown', None]:
                 return Response({"message": "I didn't understand that command.", "intent": intent}, status=status.HTTP_200_OK)
        else:
            # Single intent dict
            if intent.get('action') == 'error':
                 return Response({"error": intent.get('message')}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
            if intent.get('action') in ['unknown', None]:
                 return Response({"message": "I didn't understand that command.", "intent": intent}, status=status.HTTP_200_OK)

        # 2. Dispatch to Business Logic
        result = IntentDispatcher.handle_intent(intent)
        
        return Response({
            "original_command": command,
            "interpreted_intent": intent,
            "result": result
        })
