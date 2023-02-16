class MultiPlayerSocket{
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app4507.acapp.acwing.com.cn/wss/multiplayer/");
        this.start();
    }

    start(){
        this.receive();
    }

    // 通过uuid找到某名玩家
    get_player(uuid){
        let players = this.playground.players;
        for (let i = 0; i < players.length; i ++ )
        {
            let player = players[i];
            if(player.uuid === uuid) return player;
        }
        return null;
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
            else if (event === "move_to")
            {
                outer.receive_move_to(uuid, data.tx, data.ty);
            }
            else if (event === "shoot_fireball")
            {
                outer.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            }
            else if (event === "attack")
            {
                outer.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            }
            else if (event == "blink")
            {
                outer.receive_blink(uuid, data.tx, data.ty);
            }
            else if (event === "message")
            {
                outer.receive_message(uuid, data.username, data.text);
            }
        }

    }

    // 用send和receive将玩家同步
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

    // 用send和receive将玩家的移动同步
    send_move_to(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : 'move_to',
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
        }));
    }

    receive_move_to(uuid, tx, ty){
        let player = this.get_player(uuid);

        if(player){
            player.move_to(tx, ty);
        }
    }

    // 子弹的同步
    send_shoot_fireball(tx, ty, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "shoot_fireball",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty,
            'ball_uuid' : ball_uuid,
        }))
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid){
        let player = this.get_player(uuid);
        if (player){
            let fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    // 攻击同步 
    // 并且为了防止延迟时位置不一致，将被攻击者的位置同步到其他联机玩家
    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : 'attack',
            'uuid' : outer.uuid,
            'attackee_uuid' : attackee_uuid,
            'x' : x,
            'y' : y,
            'angle' : angle,
            'damage' : damage,
            'ball_uuid' : ball_uuid,
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid){
        let attacker = this.get_player(uuid); //攻击者
        let attackee = this.get_player(attackee_uuid); // 被攻击者
        if (attacker && attackee){
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    // 闪现同步
    send_blink(tx, ty){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "blink",
            'uuid' : outer.uuid,
            'tx' : tx,
            'ty' : ty
        }));
    }

    receive_blink(uuid, tx, ty){
        let player = this.get_player(uuid);
        if (player){
            player.blink(tx, ty);
        }
    }

    // 发送聊天同步
    send_message(username, text){
        let outer = this;
        this.ws.send(JSON.stringify({
            'event' : "message",
            'username' : username,
            'uuid' : outer.uuid,
            'username': username,
            'text' : text,
        }));
    }

    receive_message(uuid, username, text){
        this.playground.chat_field.add_message(username, text);
    }
}
