from django.urls import path

from . import views

urlpatterns = [
    path('create/', views.CommentCreate.as_view(), name='comment_create'),
]