from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .agents import run_agent, memory
import json
import uuid
import markdown

@csrf_exempt
def chat(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_query = data.get('query', '')
        
        if not user_query:
            return JsonResponse({'error': 'Query is required'}, status=400)
        
        if not request.session.get("thread_id"):
            request.session["thread_id"] = str(uuid.uuid4())
        
        thread_id = request.session["thread_id"]
        
        response,follow_ups = run_agent(user_query, thread_id)
        

        return JsonResponse({"response": response,"follow_ups":follow_ups})
    
    return JsonResponse({"error": "Invalid request method."}, status=405)


@csrf_exempt
@require_POST
def reset_chat(request):
    # Remove the thread_id from session and clear memory
    thread_id = request.session.get("thread_id")
    if thread_id:
        memory.delete_thread(thread_id=thread_id)
        del request.session["thread_id"]
    
    return JsonResponse({"status": "Chat reset successfully (memory + session)."})

def chatbot_ui(request):
    return render(request, 'chatbot.html')
