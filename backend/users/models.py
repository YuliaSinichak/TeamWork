from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
    )

    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='student')
    email = models.EmailField(unique=True)
    is_approved = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    block_reason = models.TextField(blank=True, null=True)
    saved_resources = models.ManyToManyField('library.Resource', related_name='saved_by', blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email
