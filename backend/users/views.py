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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def all(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def toggle_staff(self, request, pk=None):
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        return Response({'status': f'staff status changed to {user.is_staff}'}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def block(self, request, pk=None):
        user = self.get_object()
        reason = request.data.get('reason', '')
        user.is_blocked = True
        user.block_reason = reason
        user.save()
        return Response({'status': 'user blocked', 'reason': reason}, status=200)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def unblock(self, request, pk=None):
        user = self.get_object()
        user.is_blocked = False
        user.block_reason = ''
        user.save()
        return Response({'status': 'user unblocked'}, status=200)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        from django.db.models import Count, Q
        total_users = User.objects.count()
        students = User.objects.filter(user_type='student').count()
        teachers = User.objects.filter(user_type='teacher').count()
        approved_teachers = User.objects.filter(user_type='teacher', is_approved=True).count()
        pending_teachers = User.objects.filter(user_type='teacher', is_approved=False).count()
        staff_users = User.objects.filter(is_staff=True).count()
        
        blocked_users = User.objects.filter(is_blocked=True).count()
        
        return Response({
            'total_users': total_users,
            'students': students,
            'teachers': teachers,
            'approved_teachers': approved_teachers,
            'pending_teachers': pending_teachers,
            'staff_users': staff_users,
            'blocked_users': blocked_users,
        })
