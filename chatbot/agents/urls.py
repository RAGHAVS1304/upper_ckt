from django.urls import path
from .views import chat,chatbot_ui,reset_chat
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('chat-ui/', chatbot_ui),
    path('chat/', chat),
    path('reset_chat/',reset_chat)
]  + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
