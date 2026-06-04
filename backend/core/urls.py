"""
URL configuration for core project.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
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

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
