from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        user = getattr(request, "user", None)
        full_name = getattr(user, "full_name", None) or "Scholar"

        return Response(
            {
                "profile": {
                    "full_name": full_name,
                    "email": getattr(user, "email", None) or "student@university.edu",
                },
                "studyData": [
                    {"day": "Mon", "hours": 4},
                    {"day": "Tue", "hours": 6},
                    {"day": "Wed", "hours": 3},
                    {"day": "Thu", "hours": 7},
                    {"day": "Fri", "hours": 5},
                    {"day": "Sat", "hours": 8},
                    {"day": "Sun", "hours": 4},
                ],
                "currentClass": {
                    "name": "Data Structures",
                    "room": "Room 301",
                    "isLive": True,
                    "endTime": "10:30 AM",
                    "zoomLink": "#",
                },
                "nextClass": {
                    "name": "Database Management",
                    "room": "Room 205",
                    "startTime": "11:00 AM",
                },
                "topTasks": [
                    {"id": 1, "title": "Complete ML Assignment", "priority": "high", "due": "Today 5:00 PM"},
                    {"id": 2, "title": "Read Chapter 7 - Algorithms", "priority": "medium", "due": "Tomorrow"},
                    {"id": 3, "title": "Prepare presentation slides", "priority": "high", "due": "Today 8:00 PM"},
                ],
                "recentFiles": [
                    {"name": "Neural_Networks.pdf", "course": "AI", "accessed": "2h ago"},
                    {"name": "Database_Notes.pptx", "course": "DBMS", "accessed": "5h ago"},
                    {"name": "Algorithms_Cheat_Sheet.pdf", "course": "DSA", "accessed": "1d ago"},
                ],
            }
        )


class RoutineView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                "times": ["8:00", "9:00", "10:00", "11:00", "12:00", "1:00", "2:00", "3:00"],
                "classes": [
                    {
                        "id": 1,
                        "day": 0,
                        "start": 0,
                        "duration": 2,
                        "name": "Calculus",
                        "room": "Room 204",
                        "color": "blue",
                        "live": True,
                    },
                    {
                        "id": 2,
                        "day": 1,
                        "start": 2,
                        "duration": 2,
                        "name": "Data Structures",
                        "room": "Room 301",
                        "color": "purple",
                        "live": False,
                    },
                    {
                        "id": 3,
                        "day": 3,
                        "start": 4,
                        "duration": 2,
                        "name": "Database",
                        "room": "Room 205",
                        "color": "green",
                        "live": False,
                    },
                    {
                        "id": 4,
                        "day": 5,
                        "start": 5,
                        "duration": 2,
                        "name": "Machine Learning",
                        "room": "Lab 2",
                        "color": "orange",
                        "live": False,
                    },
                ],
            }
        )
