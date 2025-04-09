from rest_framework import serializers
from .models import User, Video, UserProfile
from django.contrib.auth import authenticate
from rest_framework.serializers import ModelSerializer


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_active']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['id', 'avatar', 'bio', 'birth_date']


class UserLoginSerializer(serializers.Serializer):
    """
    Serializer class to authenticate users with email and password.
    """

    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")


class VideoSerializer(ModelSerializer):
    class Meta:
        model = Video
        fields = ["id", "videofile", "name", "owner", "views_count", "likes_count", "thumb"]


class VideoTitleSerializer(ModelSerializer):
    class Meta:
        model = Video
        fields = ["name"]
