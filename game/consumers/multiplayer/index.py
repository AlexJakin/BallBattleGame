from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.core.cache import cache
import json

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = None

        for i in range(1000):
            name = "room-%d" % (i)
            # 判断是否有这个房间 或 房间人数不足三人
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return

        await self.accept()
        # 创建房间
        if not cache.has_key(self.room_name):
            cache.set(self.room_name, [], 3600) # 有效期一小时
        
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({
                'event' : "create_player",
                'uuid' : player['uuid'], # 表示从哪个地方发过来的
                'username' : player['username'],
                'photo' : player['photo']
            }))



        await self.channel_layer.group_add(self.room_name, self.channel_name)

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        # 找到cache中当前对局
        players = cache.get(self.room_name)
        players.append({
            'uuid' : data['uuid'],
            'username' : data['username'],
            'photo' : data['photo']
        })
        # 将玩家加入对局
        cache.set(self.room_name, players, 3600) #有效期一小时
        
        # 广播给组内所有人
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': "group_create_player",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )
    
    async def group_create_player(self, data):
        await self.send(text_data=json.dumps(data))


    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
