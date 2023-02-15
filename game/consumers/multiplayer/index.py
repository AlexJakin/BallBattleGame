from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.core.cache import cache
import json

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def create_player(self, data):
        self.room_name = None

        for i in range(1000):
            name = "room-%d" % (i)
            # 判断是否有这个房间 或 房间人数不足三人
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name:
            return

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
                'type': "group_send_event",
                'event': "create_player",
                'uuid': data['uuid'],
                'username': data['username'],
                'photo': data['photo'],
            }
        )
    
    # 所有同步事件都是用这个函数广播给room其他玩家
    async def group_send_event(self, data):
        await self.send(text_data=json.dumps(data))
    
    async def move_to(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "move_to",
                'uuid' : data['uuid'],
                'tx' : data['tx'],
                'ty' : data['ty'],
            }
        )
    async def shoot_fireball(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                "type" : "group_send_event",
                'event' : "shoot_fireball",
                'uuid' : data['uuid'],
                'tx' : data['tx'],
                'ty' : data['ty'],
                'ball_uuid' : data['ball_uuid'],
            }
        )

    async def attack(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "attack",
                'uuid' : data['uuid'],
                'attackee_uuid' : data['attackee_uuid'],
                'x' : data['x'],
                'y' : data['y'],
                'angle' : data['angle'],
                'damage' : data['damage'],
                'ball_uuid' : data['ball_uuid']
            }
        )
    
    async def blink(self, data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "blink",
                'uuid' : data['uuid'],
                'tx' : data['tx'],
                'ty' : data['ty']
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "blink":
            await self.blink(data)

