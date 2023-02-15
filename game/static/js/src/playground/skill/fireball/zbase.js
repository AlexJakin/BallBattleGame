class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length, damage){
        super();
        this.playground = playground;
        this.player = player;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.damage = damage; // 伤害值

        this.eps = 0.01;

        this.start();
    }

    start(){
        // console.log(this);
    }

    update(){
        // 火球距离到达，可以消失
        if (this.move_length < this.eps){
            this.destroy();
            return false;
        }
        this.update_move();
        if (this.player.character !== "enemy"){ // 只有不是敌人才判断碰撞，由本窗口玩家检测碰撞是否发生
            this.update_attack();
        }
        this.render();
    }

    update_move(){
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;// 方向乘距离
        this.y += this.vy * moved;
        this.move_length -= moved;
    }

    update_attack(){
        // 碰撞检测
        for (let i = 0; i < this.playground.players.length; i ++)
        {
            let player = this.playground.players[i];
            if (this.player !== player && this.is_collision(player))
            {
                this.attack(player);
                break;
                // console.log(this.player, player);
            }
        }
    }

    // 计算距离
    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // 碰撞检测
    is_collision(player)
    {
        //console.log(this.x, this.y, player.x, player.y);
        let distance = this.get_dist(this.x, this.y, player.x, player.y);
        if (distance < this.radius + player.radius)
        {
            // console.log("火球:" ,this.x, this.y, "敌人：");
            // console.log("distance", distance);
            // console.log("radius", this.radius, player.radius);
            return true;
        }
        return false;
    }

    //攻击玩家
    attack(player)
    {
        let angle = Math.atan2(player.y - this.y, player.x - this.x);
        player.is_attacked(angle, this.damage);

        // 如果是多人模式的话 同步一下攻击事件
        if (this.playground.mode === "multi mode"){
            this.playground.mps.send_attack(player.uuid, player.x, player.y, angle, this.damage, this.uuid);
        }
        this.destroy();
    }

    render(){
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy(){
        let fireballs = this.player.fireballs;
        for (let i = 0; i < fireballs.length; i ++ )
        {
            if (fireballs[i] === this){
                fireballs.splice(i, 1);
                break;
            }
        }
    }
}
