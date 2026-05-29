from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class ResourcesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                "courses": [
                    {
                        "semester": 3,
                        "courses": [
                            {
                                "id": 1,
                                "name": "Data Structures & Algorithms",
                                "code": "CS301",
                                "files": [
                                    {"id": 1, "name": "Binary_Trees.pdf", "type": "pdf", "size": "2.4 MB", "uploaded": "2 days ago"},
                                    {"id": 2, "name": "Sorting_Algorithms.pdf", "type": "pdf", "size": "1.8 MB", "uploaded": "5 days ago"},
                                    {"id": 3, "name": "Lecture_Notes.pptx", "type": "pptx", "size": "5.2 MB", "uploaded": "1 week ago"},
                                ],
                            },
                            {
                                "id": 2,
                                "name": "Database Management Systems",
                                "code": "CS302",
                                "files": [
                                    {"id": 4, "name": "SQL_Basics.pdf", "type": "pdf", "size": "3.1 MB", "uploaded": "3 days ago"},
                                    {"id": 5, "name": "ER_Diagrams.pdf", "type": "pdf", "size": "1.5 MB", "uploaded": "1 week ago"},
                                ],
                            },
                        ],
                    },
                    {
                        "semester": 4,
                        "courses": [
                            {
                                "id": 3,
                                "name": "Machine Learning",
                                "code": "CS401",
                                "files": [
                                    {"id": 6, "name": "Neural_Networks.pdf", "type": "pdf", "size": "4.7 MB", "uploaded": "1 day ago"},
                                    {"id": 7, "name": "Regression_Analysis.pdf", "type": "pdf", "size": "2.2 MB", "uploaded": "4 days ago"},
                                    {"id": 8, "name": "ML_Resources.link", "type": "link", "size": "-", "uploaded": "1 week ago"},
                                ],
                            }
                        ],
                    },
                ]
            }
        )
