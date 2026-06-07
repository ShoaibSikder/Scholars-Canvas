"""
URL configuration for core project.
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

urlpatterns = [
    path('health/', lambda request: JsonResponse({"status": "ok"})),
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
