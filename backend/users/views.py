from django.shortcuts import render
from rest_framework import generics, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import User
from .serializers import UserRegistrationSerializer

# Create your views here.


class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        pending_users = User.objects.filter(is_approved=False, user_type='teacher')
        serializer = self.get_serializer(pending_users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        user = self.get_object()
        user.is_approved = True
        user.save()
        return Response({'status': 'user approved'}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        user = self.get_object()
        user.is_approved = False
        user.save()
        return Response({'status': 'user rejected'}, status=200)
