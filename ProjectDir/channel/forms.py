from django.forms import ModelForm
from django import forms
from .models import Video, User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.forms import AuthenticationForm, UsernameField


class VideoForm(ModelForm):
    class Meta:
        model = Video
        fields = ["name", "videofile"]


class UserRegisterForm(UserCreationForm):   # TODO заменить на userprofile
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']


class UserLoginForm(ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(
        attrs={
            'class': 'form-control',
            'placeholder': '',
            'id': 'hi',
        }))

    class Meta:
        model = User
        fields = ["email", "password"]

