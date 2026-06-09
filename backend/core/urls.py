"""
URL configuration for core project.
"""
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.db import connection
from django.http import HttpResponse, JsonResponse
from django.urls import include, path

def service_status(request):
    return JsonResponse({"service": "Scholars Canvas API", "status": "ok"})

def warmup_status(request):
    connection.ensure_connection()
    get_user_model().objects.only("id").first()
    return JsonResponse({"status": "warm"})

urlpatterns = [
    path('', service_status),
    path('health/', lambda request: JsonResponse({"status": "ok"})),
    path('warmup/', warmup_status),
    path('favicon.ico', lambda request: HttpResponse(status=204)),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/app/', include('apps.courses.urls')),
    path('api/app/tasks/', include('apps.tasks.urls')),
    path('api/app/resources/', include('apps.resources.urls')),
    path('api/app/notifications/', include('apps.notification.urls')),
    path('api/app/notification/', include('apps.notification.urls')),
    path('api/app/search/', include('apps.search.urls')),
    path('api/app/ai-lab/', include('apps.ai_lab.urls')),
    path('api/app/communication/', include('apps.communication.urls')),
    path('api/admin-panel/', include('apps.administration.urls')),
]
