from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class TasksView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "todo": [
                    {"id": 1, "title": "Complete ML Assignment", "priority": "high", "due": "Today 5:00 PM", "course": "AI"},
                    {"id": 2, "title": "Read Chapter 7 - Algorithms", "priority": "medium", "due": "Tomorrow", "course": "DSA"},
                    {"id": 3, "title": "Prepare presentation slides", "priority": "high", "due": "Today 8:00 PM", "course": "SE"},
                ],
                "inProgress": [
                    {"id": 4, "title": "Study for DBMS midterm", "priority": "low", "due": "Next week", "course": "DBMS"},
                    {"id": 5, "title": "Build portfolio website", "priority": "medium", "due": "In 3 days", "course": "Web Dev"},
                ],
                "done": [
                    {"id": 6, "title": "Lab report submission", "priority": "high", "due": "Tomorrow 11:59 PM", "course": "Physics"},
                    {"id": 7, "title": "Submit Data Structures homework", "priority": "high", "due": "Yesterday", "course": "DS"},
                    {"id": 8, "title": "Practice SQL queries", "priority": "medium", "due": "2 days ago", "course": "DBMS"},
                ],
            }
        )
