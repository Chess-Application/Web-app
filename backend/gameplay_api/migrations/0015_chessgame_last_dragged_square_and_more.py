# Generated by Django 5.1.4 on 2025-03-02 23:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gameplay_api', '0014_remove_chessgame_timer_task_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='chessgame',
            name='last_dragged_square',
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='chessgame',
            name='last_dropped_square',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
