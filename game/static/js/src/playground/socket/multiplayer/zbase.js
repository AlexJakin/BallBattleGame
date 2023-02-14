class MultiPlayerSocket{
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app4507.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start(){
        this.receive();
    }

    receive(){
        let outer = this;
        this.ws.onmessage = function(e) {
            let data = JSON.parse(e.data);
            let uuid = data.uuid; // 接收其他玩家uuiid
            let event = data.event;
            
            if (uuid == outer.uuid) return false; // 如果是自己 则不用接收
            //如果是联机玩家 则加入房间地图
            if (event === "create_player")
            {
                outer.receive_create_player(uuid, data.username, data.photo);
            }
        }

    }

    send_create_player(username, photo) {
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "create_player",
            'uuid' : outer.uuid,
            'username': username,
            'photo': photo
        }));
    }


    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );

        player.uuid = uuid;
        this.playground.players.push(player);
    }
}
