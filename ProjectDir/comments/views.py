from rest_framework import status
from .models import Comment
from channel.models import User, Video
from rest_framework.views import APIView
from rest_framework.response import Response


class CommentCreate(APIView):
    def post(self, request):
        text = request.data["text"]
        video_id = request.data["id"]
        user_id = request.user.id
        owner = User.objects.get(id=user_id)
        videofile = Video.objects.get(id=video_id)
        print(f"CommentCreate {text} {video_id} {user_id}")
        Comment.objects.create(text=text, videofile=videofile, owner=owner)
        return Response("OK", status=status.HTTP_200_OK)
