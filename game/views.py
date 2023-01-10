from django.shortcuts import render
from django.http import HttpResponse
# Create your views here.

def index(request):
    line1 = '<h1 style="text-align:center;">术土之战</h1>'
    line2 = '<a href="/play/">进入游戏界面</a>'
    return HttpResponse(line1+line2)


def play(request):
    line1 = '<h1>游戏界面</h1>'
    line2 = '<a href="/">返回</a>'
    return HttpResponse(line1 + line2)
