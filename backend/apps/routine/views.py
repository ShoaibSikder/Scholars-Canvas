from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import UserPreferences
from apps.courses.models import RoutineSlot
from .serializers import RoutineSlotSerializer


class RoutineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        slots = RoutineSlot.objects.filter(user=request.user)
        preferences, _ = UserPreferences.objects.get_or_create(user=request.user)
        serializer = RoutineSlotSerializer(slots, many=True)
        return Response({
            "slots": serializer.data,
            "time_rows": preferences.routine_time_rows,
        })

    def post(self, request):
        serializer = RoutineSlotSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def patch(self, request):
        preferences, _ = UserPreferences.objects.get_or_create(user=request.user)
        routine_settings = request.data.get("time_rows")
        if routine_settings is None:
            return Response({"message": "No routine settings provided."}, status=status.HTTP_400_BAD_REQUEST)

        preferences.routine_time_rows = routine_settings
        preferences.save(update_fields=["routine_time_rows"])
        return Response({"time_rows": preferences.routine_time_rows})


class RoutineDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user, pk):
        return get_object_or_404(RoutineSlot, user=user, pk=pk)

    def patch(self, request, pk):
        slot = self.get_object(request.user, pk)
        serializer = RoutineSlotSerializer(slot, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        slot = self.get_object(request.user, pk)
        slot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
