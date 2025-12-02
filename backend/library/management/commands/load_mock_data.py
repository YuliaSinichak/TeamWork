from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from library.models import Tag, Resource
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


class Command(BaseCommand):
    help = 'Loads mock data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Loading mock data...')

        admin_user, created = User.objects.get_or_create(
            email='admin@library.com',
            defaults={
                'username': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_approved': True,
            }
        )
        if created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@library.com / admin123'))

        student1, created = User.objects.get_or_create(
            email='student1@example.com',
            defaults={
                'username': 'student1',
                'user_type': 'student',
                'is_approved': True,
            }
        )
        if created:
            student1.set_password('student123')
            student1.save()
            self.stdout.write(self.style.SUCCESS('Created student1: student1@example.com / student123'))

        student2, created = User.objects.get_or_create(
            email='student2@example.com',
            defaults={
                'username': 'student2',
                'user_type': 'student',
                'is_approved': True,
            }
        )
        if created:
            student2.set_password('student123')
            student2.save()
            self.stdout.write(self.style.SUCCESS('Created student2: student2@example.com / student123'))

        teacher1, created = User.objects.get_or_create(
            email='teacher1@example.com',
            defaults={
                'username': 'teacher1',
                'user_type': 'teacher',
                'is_approved': True,
            }
        )
        if created:
            teacher1.set_password('teacher123')
            teacher1.save()
            self.stdout.write(self.style.SUCCESS('Created teacher1: teacher1@example.com / teacher123'))

        teacher2, created = User.objects.get_or_create(
            email='teacher2@example.com',
            defaults={
                'username': 'teacher2',
                'user_type': 'teacher',
                'is_approved': False,
            }
        )
        if created:
            teacher2.set_password('teacher123')
            teacher2.save()
            self.stdout.write(self.style.SUCCESS('Created teacher2 (pending): teacher2@example.com / teacher123'))

        tags_data = [
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Literature',
            'Programming',
            'Art',
            'Music',
            'Geography',
        ]

        tags = []
        for tag_name in tags_data:
            tag, created = Tag.objects.get_or_create(name=tag_name)
            tags.append(tag)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created tag: {tag_name}'))

        resources_data = [
            {
                'title': 'Introduction to Python Programming',
                'description': 'A comprehensive guide to Python programming for beginners. Covers basic syntax, data structures, and object-oriented programming concepts.',
                'status': 'approved',
                'owner': teacher1,
                'tags': ['Programming', 'Mathematics'],
            },
            {
                'title': 'World War II History Overview',
                'description': 'Detailed overview of World War II, including major battles, key figures, and political implications.',
                'status': 'approved',
                'owner': teacher1,
                'tags': ['History'],
            },
            {
                'title': 'Basic Chemistry Formulas',
                'description': 'Essential chemistry formulas and equations for high school students. Includes periodic table references.',
                'status': 'approved',
                'owner': teacher1,
                'tags': ['Chemistry'],
            },
            {
                'title': 'Shakespeare\'s Sonnets Analysis',
                'description': 'In-depth analysis of selected Shakespeare sonnets with literary criticism and historical context.',
                'status': 'approved',
                'owner': teacher1,
                'tags': ['Literature'],
            },
            {
                'title': 'Quantum Physics Fundamentals',
                'description': 'Introduction to quantum mechanics covering wave-particle duality, uncertainty principle, and quantum states.',
                'status': 'approved',
                'owner': teacher1,
                'tags': ['Physics'],
            },
            {
                'title': 'Cell Biology Study Guide',
                'description': 'Comprehensive study guide covering cell structure, organelles, and cellular processes.',
                'status': 'pending',
                'owner': teacher1,
                'tags': ['Biology'],
            },
            {
                'title': 'Advanced Calculus Problems',
                'description': 'Collection of advanced calculus problems with step-by-step solutions for university students.',
                'status': 'pending',
                'owner': teacher1,
                'tags': ['Mathematics'],
            },
            {
                'title': 'Renaissance Art Movement',
                'description': 'Overview of Renaissance art, including major artists, techniques, and cultural significance.',
                'status': 'pending',
                'owner': teacher1,
                'tags': ['Art', 'History'],
            },
            {
                'title': 'Music Theory Basics',
                'description': 'Introduction to music theory covering scales, chords, and basic composition techniques.',
                'status': 'rejected',
                'owner': teacher1,
                'tags': ['Music'],
            },
            {
                'title': 'European Geography Guide',
                'description': 'Detailed guide to European geography including countries, capitals, and physical features.',
                'status': 'approved',
                'owner': teacher1,
                'tags': ['Geography'],
            },
        ]

        for resource_data in resources_data:
            tag_names = resource_data.pop('tags')
            owner = resource_data.pop('owner')
            
            mock_file = SimpleUploadedFile(
                f"{resource_data['title'].replace(' ', '_')}.pdf",
                b'Mock PDF content for testing',
                content_type='application/pdf'
            )
            
            resource, created = Resource.objects.get_or_create(
                title=resource_data['title'],
                defaults={
                    'description': resource_data['description'],
                    'status': resource_data['status'],
                    'owner': owner,
                    'file': mock_file,
                }
            )
            
            if created:
                for tag_name in tag_names:
                    tag = Tag.objects.get(name=tag_name)
                    resource.tags.add(tag)
                self.stdout.write(self.style.SUCCESS(f'Created resource: {resource.title} ({resource.status})'))
            else:
                resource.status = resource_data['status']
                resource.save()

        student1.saved_resources.add(Resource.objects.filter(status='approved').first())
        student2.saved_resources.add(Resource.objects.filter(status='approved')[0])
        student2.saved_resources.add(Resource.objects.filter(status='approved')[1])

        self.stdout.write(self.style.SUCCESS('\nMock data loaded successfully!'))
        self.stdout.write('\nTest accounts:')
        self.stdout.write('  Admin: admin@library.com / admin123')
        self.stdout.write('  Student1: student1@example.com / student123')
        self.stdout.write('  Student2: student2@example.com / student123')
        self.stdout.write('  Teacher1 (approved): teacher1@example.com / teacher123')
        self.stdout.write('  Teacher2 (pending): teacher2@example.com / teacher123')

