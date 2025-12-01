from django.contrib import admin
from .models import Resource, Tag

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'created_at')
    list_filter = ('status', 'tags')
    search_fields = ('title', 'owner__username')
    actions = ['approve_resources']

    def approve_resources(self, request, queryset):
        queryset.update(status='approved')
    approve_resources.short_description = "Approve selected resources"

admin.site.register(Tag)
