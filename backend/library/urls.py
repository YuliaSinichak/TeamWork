from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TagViewSet, ResourceViewSet

router = DefaultRouter()
router.register(r'tags', TagViewSet)
router.register(r'resources', ResourceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
