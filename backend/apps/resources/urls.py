from django.urls import path

from .views import CourseResourceDetailView, CourseResourceView, ResourceCourseDetailView, ResourcesView

urlpatterns = [
    path("", ResourcesView.as_view(), name="resources-data"),
    path("<int:pk>/", ResourceCourseDetailView.as_view(), name="resource-course-detail"),
    path("<int:course_id>/items/", CourseResourceView.as_view(), name="course-resource-create"),
    path("<int:course_id>/items/<int:pk>/", CourseResourceDetailView.as_view(), name="course-resource-detail"),
]
