# Generated by Django 5.1.2 on 2024-10-25 00:08

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Deck',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Flashcard',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('question', models.TextField()),
                ('answer', models.TextField()),
                ('quality_score', models.FloatField(default=0)),
                ('response_time', models.FloatField(default=0)),
                ('streak', models.IntegerField(default=0)),
                ('review_required', models.BooleanField(default=False)),
                ('difficulty_rating', models.IntegerField(default=0)),
                ('deck', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='flashcards.deck')),
            ],
        ),
    ]
