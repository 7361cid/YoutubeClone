from django.db import models
from channel.models import Video, User

# Create your models here.
class Comment(models.Model):
    text = models.CharField(max_length=500)
    videofile = models.ForeignKey(Video, on_delete=models.NOT_PROVIDED)
    owner = models.ForeignKey(User, on_delete=models.NOT_PROVIDED)
