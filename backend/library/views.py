from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tag, Resource
from .serializers import TagSerializer, ResourceSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters


# Create your views here.

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.filter(status='approved')
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['tags__name']
    search_fields = ['title', 'description']

    def get_queryset(self):
        if self.action == 'retrieve':
            resource = Resource.objects.filter(pk=self.kwargs.get('pk')).first()
            if resource and self.request.user.is_authenticated and resource.owner == self.request.user:
                return Resource.objects.filter(pk=self.kwargs.get('pk'))
            return Resource.objects.filter(status='approved', pk=self.kwargs.get('pk'))
        return Resource.objects.filter(status='approved')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my(self, request):
        user_resources = Resource.objects.filter(owner=request.user)
        serializer = self.get_serializer(user_resources, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        resource = self.get_object()
        user = request.user
        if resource in user.saved_resources.all():
            user.saved_resources.remove(resource)
            return Response({'status': 'resource removed from saved'}, status=status.HTTP_200_OK)
        else:
            user.saved_resources.add(resource)
            return Response({'status': 'resource added to saved'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='saved')
    def list_saved(self, request):
        user = request.user
        saved_resources = user.saved_resources.all()
        serializer = self.get_serializer(saved_resources, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def pending(self, request):
        pending_resources = Resource.objects.filter(status='pending')
        serializer = self.get_serializer(pending_resources, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        resource = self.get_object()
        resource.status = 'approved'
        resource.save()
        return Response({'status': 'resource approved'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        resource = self.get_object()
        resource.status = 'rejected'
        resource.save()
        return Response({'status': 'resource rejected'}, status=status.HTTP_200_OK)
