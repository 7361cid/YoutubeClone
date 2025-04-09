from django.contrib import admin

from .models import Video, UserProfile, User, UserLikes

admin.site.register(Video)
admin.site.register(UserProfile)
admin.site.register(User)
admin.site.register(UserLikes)
