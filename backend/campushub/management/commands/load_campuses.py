from django.core.management.base import BaseCommand
from campushub.models import CampusHub
import csv
import os
from django.conf import settings

class Command(BaseCommand):
    help='Load Predefined campus hubs into the database'

    #for testing
    def handle(self, *args, **options):
        file_path = os.path.join(settings.BASE_DIR, 'datasets', 'us_univ.csv')

        try:
            with open(file_path, newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                count_created = 0
                count_existing = 0

                for row in reader:
                    campus, created = CampusHub.objects.get_or_create(
                        campus_tag = row['campus_tag'],
                        defaults={
                            'name':row['name'],
                            'domain': row['domain'],
                        }
                    )
                    if created:
                        count_created += 1
                    else:
                        count_existing += 1

                self.stdout.write(self.style.SUCCESS(f"{count_created} campuses created."))
                self.stdout.write(self.style.WARNING(f'{count_existing} already existed'))

        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'File not found: {file_path}'))
        
       