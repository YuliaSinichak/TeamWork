from rest_framework import serializers
from .models import Tag, Resource
from django.contrib.auth import get_user_model

User = get_user_model()

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'


class ResourceSerializer(serializers.ModelSerializer):
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all())
    owner = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Resource
        fields = ('id', 'title', 'description', 'file', 'tags', 'owner', 'status', 'created_at', 'updated_at')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['tags'] = TagSerializer(instance.tags.all(), many=True).data
        return representation
