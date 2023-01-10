from django.urls import path
from game.views import index, play

urlpatterns = [
    path("", index, name="index"), #主页面
    path("play/", play, name= "play")
]
