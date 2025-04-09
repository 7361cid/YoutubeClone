"""
URL configuration for ProjectDir project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from channel import views as channel_views

urlpatterns = [
                path('admin/', admin.site.urls),
                path("channel/", include("channel.urls")),
                path("api/comments/", include("comments.urls")),
                path("api/login/", channel_views.UserLoginAPIView.as_view(), name="loginapi"),
                path('logout/', channel_views.logout, name='logout'),
                path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
                path('api/user/', channel_views.UserDetail.as_view(), name='user-detail'),
                path('api/user/<int:id>/', channel_views.AnotherUserDetail.as_view(), name='another-user-detail'),
                path('api/user_videos/', channel_views.UserVideosDetail.as_view(), name='user-videos'),
                path('api/get_video/<int:id>/', channel_views.VideoDetail.as_view(), name='get-video'),
                path('api/video_upload/', channel_views.VideoUpload.as_view(), name='video_upload'),
                path('api/avatar_upload/', channel_views.AvatarUpload.as_view(), name='avatar_upload'),
                path('api/video_view/', channel_views.VideoView.as_view(), name='video_view'),
                path('api/video_like/', channel_views.VideoLike.as_view(), name='video_like'),
                path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
                path('api/v1/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
              ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
