from django.shortcuts import render
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Tag, Resource, Rating, Comment
from .serializers import TagSerializer, ResourceSerializer, RatingSerializer, CommentSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Q, Avg
from django.db import models


# Create your views here.

class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.filter(status='approved')
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tags__name', 'owner', 'owner__id']
    search_fields = ['title', 'description', 'owner__username']
    ordering_fields = ['created_at', 'views_count', 'downloads_count', 'average_rating']
    ordering = ['-created_at']

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        queryset = Resource.objects.filter(status='approved', is_hidden=False)
        
        # Пошук за автором
        author_search = self.request.query_params.get('author', None)
        if author_search:
            queryset = queryset.filter(owner__username__icontains=author_search)
        
        # Сортування
        ordering = self.request.query_params.get('ordering', None)
        if ordering:
            if ordering == 'rating':
                queryset = queryset.annotate(avg_rating=models.Avg('ratings__rating')).order_by('-avg_rating')
            elif ordering == '-rating':
                queryset = queryset.annotate(avg_rating=models.Avg('ratings__rating')).order_by('avg_rating')
            else:
                queryset = queryset.order_by(ordering)
        
        if self.action == 'retrieve':
            resource = queryset.filter(pk=self.kwargs.get('pk')).first()
            if resource and self.request.user.is_authenticated and resource.owner == self.request.user:
                resource.views_count += 1
                resource.save()
                return Resource.objects.filter(pk=self.kwargs.get('pk'))
            if resource and resource.status == 'approved' and not resource.is_hidden:
                resource.views_count += 1
                resource.save()
            return queryset.filter(pk=self.kwargs.get('pk'))
        
        return queryset

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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def user_resources(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id parameter required'}, status=400)
        user_resources = Resource.objects.filter(owner_id=user_id, status='approved', is_hidden=False)
        serializer = self.get_serializer(user_resources, many=True)
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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def all(self, request):
        status_filter = request.query_params.get('status', None)
        hidden_filter = request.query_params.get('hidden', None)
        problematic_filter = request.query_params.get('problematic', None)
        queryset = Resource.objects.all().order_by('-created_at')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if hidden_filter == 'true':
            queryset = queryset.filter(is_hidden=True)
        elif hidden_filter == 'false':
            queryset = queryset.filter(is_hidden=False)
        if problematic_filter == 'true':
            queryset = queryset.filter(is_problematic=True)
        elif problematic_filter == 'false':
            queryset = queryset.filter(is_problematic=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def hide(self, request, pk=None):
        resource = self.get_object()
        resource.is_hidden = True
        resource.save()
        return Response({'status': 'resource hidden'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def unhide(self, request, pk=None):
        resource = self.get_object()
        resource.is_hidden = False
        resource.save()
        return Response({'status': 'resource unhidden'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def mark_problematic(self, request, pk=None):
        resource = self.get_object()
        resource.is_problematic = True
        resource.save()
        return Response({'status': 'resource marked as problematic'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def unmark_problematic(self, request, pk=None):
        resource = self.get_object()
        resource.is_problematic = False
        resource.save()
        return Response({'status': 'resource unmarked as problematic'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def delete(self, request, pk=None):
        resource = self.get_object()
        resource.delete()
        return Response({'status': 'resource deleted'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def download(self, request, pk=None):
        resource = self.get_object()
        resource.downloads_count += 1
        resource.save()
        return Response({'status': 'download counted'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def ratings(self, request, pk=None):
        resource = self.get_object()
        if request.method == 'POST':
            rating_value = request.data.get('rating')
            if not rating_value or not (1 <= int(rating_value) <= 5):
                return Response({'error': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
            
            rating, created = Rating.objects.update_or_create(
                resource=resource,
                user=request.user,
                defaults={'rating': int(rating_value)}
            )
            serializer = RatingSerializer(rating)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        else:
            ratings = resource.ratings.all()
            serializer = RatingSerializer(ratings, many=True)
            return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def comments(self, request, pk=None):
        resource = self.get_object()
        if request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'error': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
            text = request.data.get('text')
            if not text:
                return Response({'error': 'Text is required'}, status=status.HTTP_400_BAD_REQUEST)
            
            comment = Comment.objects.create(resource=resource, user=request.user, text=text)
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            comments = resource.comments.all()
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_comment(self, request, pk=None):
        comment_id = request.data.get('comment_id')
        if not comment_id:
            return Response({'error': 'comment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comment = Comment.objects.get(id=comment_id, resource_id=pk)
            if comment.user != request.user and not request.user.is_staff:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
            comment.delete()
            return Response({'status': 'comment deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        from django.db.models import Count
        total_resources = Resource.objects.count()
        approved = Resource.objects.filter(status='approved').count()
        pending = Resource.objects.filter(status='pending').count()
        rejected = Resource.objects.filter(status='rejected').count()
        
        resources_by_tag = Resource.objects.values('tags__name').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        from django.db.models import Sum
        total_views = Resource.objects.aggregate(total=Sum('views_count'))['total'] or 0
        total_downloads = Resource.objects.aggregate(total=Sum('downloads_count'))['total'] or 0
        hidden_resources = Resource.objects.filter(is_hidden=True).count()
        problematic_resources = Resource.objects.filter(is_problematic=True).count()
        
        return Response({
            'total_resources': total_resources,
            'approved': approved,
            'pending': pending,
            'rejected': rejected,
            'hidden': hidden_resources,
            'problematic': problematic_resources,
            'total_views': total_views,
            'total_downloads': total_downloads,
            'top_tags': list(resources_by_tag),
        })
