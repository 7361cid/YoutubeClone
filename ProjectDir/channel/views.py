import jwt
import os
import subprocess
from django.conf import settings
from django.shortcuts import render, redirect
from django.db.models import Q
from functools import reduce
from django.core.files import File
from uuid import uuid4

from django.contrib import messages
from django.contrib.auth import authenticate
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework import exceptions
from rest_framework.response import Response
from django.http import HttpResponseRedirect
from .models import Video, User, UserLikes, UserProfile
from comments.models import Comment
from comments.serializers import CommentSerializer
from .forms import VideoForm, UserRegisterForm, UserLoginForm
from .serializers import UserSerializer, UserLoginSerializer, VideoSerializer, UserProfileSerializer
from .utils import generate_access_token, generate_refresh_token
from rest_framework.decorators import api_view, renderer_classes
from rest_framework.renderers import JSONRenderer, TemplateHTMLRenderer
from rest_framework import status
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

#@login_required
def showvideo(request):
    lastvideo = Video.objects.last()

    videofile = lastvideo.videofile

    form = VideoForm(request.POST or None, request.FILES or None)
    if form.is_valid():
        form.save()

    context = {'videofile': videofile,
               'form': form
               }
    print(f"showvideo COOKIES {request.COOKIES}")
    print(f"showvideo user {request.user}")
    return render(request, 'Blog/videos.html', context)


class UserLoginAPIView(GenericAPIView):
    """
    An endpoint to authenticate existing users using their email and password.
    """

    permission_classes = (AllowAny,)
    serializer_class = UserLoginSerializer
    authentication_classes = []   # make endpoint public
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        serializer = UserSerializer(user)
        token = RefreshToken.for_user(user)
        data = serializer.data
        data["tokens"] = {"refresh": str(token), "access": str(token.access_token)}
        return Response(data, status=status.HTTP_200_OK)

def logout(request):
    if request.method == 'GET':
        print(f"DEBUG Logout")
        response = HttpResponseRedirect('/channel/showvideo')
        response.data = {
            'access_token': None,
            'user': None,
        }
        response.set_cookie(key='refreshtoken', value=None, httponly=True)
        response.set_cookie(key='access_token', value=None, httponly=True)

        return response


class UserDetail(APIView):
    def get(self, request):
        try:
            print(f"UserDetail {request.user}")

            user = User.objects.get(email=request.user)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            user_profile = UserProfile.objects.get_or_create(user=user)[0]
        except UserProfile.DoesNotExist:
            return Response({"error": "UserProfile not found"}, status=status.HTTP_404_NOT_FOUND)
        print(f"USER PROFILE DEBUG2 {user_profile}")
        serializer = UserSerializer(user)
        data = dict(serializer.data)
        profile_data = {"avatar": str(user_profile.avatar), "birthday": str(user_profile.birth_date)}
        data["profile"] = profile_data
        print(f"USER PROFILE DEBUG {data}")
        return Response(data)
# http://localhost:4173/video/27
class AnotherUserDetail(APIView):
    def get(self, request, id):
        try:
            print(f"AnotherUserDetail {request.user}")
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            user_profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            return Response({"error": "UserProfile not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        serializer_profile = UserProfileSerializer(user_profile)
        data = dict(serializer.data)
        data["profile"] = serializer_profile.data
        return Response(data)

class UserVideosDetail(APIView):
    def get(self, request):
        try:
            print(f"UserVideosDetail {request.user}")
            print(f"UserVideosDetail2 {request.GET}")
            user = User.objects.get(email=request.user)
            videos = Video.objects.filter(owner=user)
            if 'search' in dict(request.GET).keys() and dict(request.GET)['search'][0] != '':
                search_list = dict(request.GET)['search'][0].split()
                print(f"SEARCH DEBUG {search_list}")
                videos = videos.filter(reduce(lambda x, y: x | y, [Q(name__contains=word) for word in search_list]))
            print(f"videos len {len(videos)}")
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = VideoSerializer(videos, many=True)
        return Response(serializer.data)


class VideoDetail(APIView):
    def get(self, request, id):
        print(f"here VideoDetail {id}")
        video = Video.objects.get(id=id)
        print(f"here VideoDetail {video} {type( video)}")
        serializer = VideoSerializer(video)
        comments = Comment.objects.filter(videofile=video)
        comments = CommentSerializer(comments, many=True)
        data = dict(serializer.data)
        data['comments'] = comments.data
        print(f"here VideoDetail data {data} type {type(data)}")
        for comment in data['comments']:   # Добавление имен пользователей к комментариям
            comment_owner = User.objects.get(id=comment['owner'])
            comment['username'] = comment_owner.username
        print(f"here VideoDetail data2 {data} type {type(data)}")
        return Response(data)


class VideoUpload(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        data = {"name": request.data.get("title", "title"), "videofile": request.data["file"], "owner": request.user.id}
        serializer = VideoSerializer(data=data)
        if serializer.is_valid():
            instance = serializer.save()
            print(f"VideoUpload {instance} {type(instance)} {instance.videofile}")
            video_input_path = os.path.join(settings.MEDIA_ROOT, str(instance.videofile))
            img_output_path = str(video_input_path).replace(".mp4", "") + "thumb.jpg"
            print(f"THUMB {video_input_path} {img_output_path}")
            subprocess.call([r'C:\FFmpeg\bin\ffmpeg.exe', '-i', video_input_path, '-ss', '00:00:00.000', '-vframes', '1', img_output_path])
            img_output_path = img_output_path.split('media')
            instance.thumb = "/media" + img_output_path[1]
            instance.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvatarUpload(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        file = request.data["file"]
        user = User.objects.get(email=request.user)
        user_profile = UserProfile.objects.get_or_create(user=user)[0]
        name=f"ava{uuid4()}.png"
        user_profile.avatar.save(name, File(file), save=True)
        return Response("OK", status=status.HTTP_200_OK)


class VideoView(APIView):
    def post(self, request):
        video = Video.objects.get(id=request.data["id"])
        video.views_count = video.views_count + 1
        video.save()
        return Response({"views": video.views_count}, status=status.HTTP_200_OK)


class VideoLike(APIView):
    def post(self, request):
        video = Video.objects.get(id=request.data["id"])
        try:
            user_like = UserLikes.objects.get(user_id=request.user.id, video_id=video.id)
        except UserLikes.DoesNotExist:
            user_like = UserLikes.objects.create(user_id=request.user.id, video_id=video.id)
        print(f"VideoLike {user_like} {user_like.flag}")
        if not user_like.flag:
            video.likes_count = video.likes_count + 1
            video.save()
            user_like.flag = True
            user_like.save()
        else:
            video.likes_count = video.likes_count - 1
            video.save()
            user_like.flag = False
            user_like.save()
        return Response({"likes": video.likes_count}, status=status.HTTP_200_OK)
