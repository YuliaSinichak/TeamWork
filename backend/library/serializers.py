from rest_framework import serializers
from .models import Tag, Resource, Rating, Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class RatingSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Rating
        fields = ('id', 'user', 'user_id', 'rating', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Comment
        fields = ('id', 'user', 'user_id', 'text', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class ResourceSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all())
    owner = serializers.ReadOnlyField(source='owner.username')
    owner_id = serializers.ReadOnlyField(source='owner.id')
    average_rating = serializers.ReadOnlyField()
    rating_count = serializers.ReadOnlyField()
    user_rating = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = ('id', 'title', 'description', 'file', 'tags', 'owner', 'owner_id', 'status', 
                  'views_count', 'downloads_count', 'is_hidden', 'is_problematic', 
                  'created_at', 'updated_at', 'average_rating', 'rating_count', 'user_rating')

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = Rating.objects.filter(resource=obj, user=request.user).first()
            return rating.rating if rating else None
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tags'] = TagSerializer(instance.tags.all(), many=True).data
        return representation
