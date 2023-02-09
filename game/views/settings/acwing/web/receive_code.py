from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint
def receive_code(request):
    data = request.GET
    code = data.get('code')
    state = data.get('state')
    #print(code, state)
    
    if not cache.has_key(state):
        return redirect("index")
    cache.delete(state)
    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
        'appid':'4507',
        'secret':'7a9d4d5dab6c4cc5beea54909ee91d93',
        'code': code
    }
    access_token_res = requests.get(apply_access_token_url, params=params).json()
    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)
    if players.exists():# 该用户已经存在，无需获取信息，直接登录
        login(request, players[0].user)
        return redirect("index")
    
    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/"
    params = {
        "access_token":access_token,
        "openid":openid
    }
    
    userinfo_res = requests.get(get_userinfo_url, params=params).json()
    username = userinfo_res['username']
    photo = userinfo_res['photo']

    while User.objects.filter(username=username).exists():  # 找到一个新用户名
        username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)


    #print(access_token_res)
    return redirect("index")
