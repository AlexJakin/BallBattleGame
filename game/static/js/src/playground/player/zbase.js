class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo)
    {
        console.log(character, username, photo);
        super(); // 继承父类
        this.playground = playground; // 地图
        this.ctx = this.playground.game_map.ctx;
        this.x = x; // 坐标
        this.y = y; // 坐标
        this.vx = 0; // 横向速度
        this.vy = 0; // 纵向速度
        this.damage_x = 0; // 伤害横向速度
        this.damage_y = 0; // 伤害纵向速度
        this.damage_speed = 0; // 伤害速度
        this.move_length = 0; // 移动距离
        this.radius = radius; // 弧度
        this.color = color; // 物体颜色
        this.speed = speed; // 物体速度
        this.friction = 0.9; // 摩擦力
        this.character = character; // 有三种角色 me自己 enemy其他玩家 robot机器人
        this.username = username;
        this.photo = photo;
        this.protect_time = 0; // 保护时间


        this.eps = 0.01;

        // 当前技能
        this.cur_skill = null;

        // 若不为机器人的话，当前玩家的头像渲染到球上
        if (this.character !== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }
    }

    start(){
        //console.log(this.x);
        //console.log(this.y);
        // 如果是自己控制的物体, 才用监听事件操控
        if (this.character === "me")
        {
            this.add_listening_events();
        }
        else if (this.character === "robot")// 如果是机器人，随机动
        {
            let tx = Math.random() * this.playground.width / this.playground.scale;
            let ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    // 监听
    add_listening_events()
    {
        let outer = this;
        // 取消右键显示菜单
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        })

        // 监听鼠标
        this.playground.game_map.$canvas.mousedown(function(e){
            //获取画布坐标
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3)//右键
            {
                outer.move_to((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
            }
            else if (e.which === 1) // 鼠标左键
            {
                if (outer.cur_skill === "fireball")
                {
                    // 从该物体当前位置开始发射
                    outer.shoot_fireball((e.clientX - rect.left) / outer.playground.scale, (e.clientY - rect.top) / outer.playground.scale);
                }
                // 看是否选择按一次Q键只能发射一次
                // outer.cur_skill = null;
            }

        });


        // 用户选择技能
        $(window).keydown(function(e){
            if (e.which === 81) // Q键
            {
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    // 发射火球
    shoot_fireball(tx, ty)
    {
        //console.log("s f", tx, ty);
        let x = this.x, y = this.y;
        let radius = 0.01;
        let angle = Math.atan2(ty - this.y, tx - this.x);
        let vx = Math.cos(angle), vy = Math.sin(angle);// 火球攻击方向
        let color = "orange"; // 火球颜色
        let speed = 0.5; // 火球移动速度
        let move_length = 1; // 火球攻击距离
        // console.log(speed, move_length);
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        //console.log(this);
    }

    // 两点之间距离
    get_dist(x1, y1, x2, y2)
    {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty)
    {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        // 角度 arctanx
        let angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle); // 横向速度
        this.vy = Math.sin(angle); // 纵向速度
    }

    // 被攻击
    is_attacked(angle, damage)
    {
        this.radius -= damage; // 减去攻击值
        if (this.radius < this.eps)
        {
            this.destroy();
            return false;
        }
        // 被攻击后
        this.damage_x = Math.cos(angle);
        this.damage_y = Math.sin(angle);
        this.damage_speed = damage * 100;
        //被攻击后的效果
        //this.speed *= 0.8;

        // 被攻击时有粒子效果
        for (let i = 0; i < 10 + Math.random() * 5; i ++)
        {
            //console.log(1);
            let x = this.x, y = this.y;
            let radius = this.radius * Math.random() * 0.1;
            let angle = Math.PI * 2 * Math.random();
            let vx = Math.cos(angle), vy = Math.sin(angle);
            let color = this.color;
            let speed = this.speed * 10;
            let move_length = this.radius * Math.random() * 10;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }
    }
    
    update(){
        this.update_move();
        this.render();
    }

    //更新玩家移动
    update_move(){
        this.protect_time += this.timedelta / 1000;
        // 机器人随机攻击
        if (this.character === "robot" && this.protect_time > 4 && Math.random() < 1 / 300.0)
        {
            // players[0]是玩家自己
            // 随机选择一个攻击对象
            let player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            // console.log(this.playground.players);
            this.shoot_fireball(player.x, player.y);
        }

        if(this.damage_speed > this.eps)
        {
            this.vx = this.vy = 0;
            this.move_length = 0;
            this.x += this.damage_x * this.damage_speed * this.timedelta / 1000;
            this.y += this.damage_y * this.damage_speed * this.timedelta / 1000;
            this.damage_speed *= this.friction;
        }
        else
        {
            if (this.move_length < this.eps)
            {
                this.move_length = 0;
                this.vx = this.vy = 0;

                // 如果是敌人的话，下一次更新随机点
                if (this.character === "robot")
                {
                    let tx = Math.random() * this.playground.width / this.playground.scale;
                    let ty = Math.random() * this.playground.height / this.playground.scale;
                    this.move_to(tx, ty);
                }
            }
            else
            {
                let moved = Math.min
                (this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }

        //this.render();
    }

    // 销毁
    on_destroy()
    {
        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            if (this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
            }
        }
    }

    render(){
        let scale = this.playground.scale;
        // console.log(scale);
        if (this.character !== "robot")
        {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale); 
            this.ctx.restore();
        }
        else
        {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }
        //this.ctx.beginPath();
        //this.ctx.arc(95,50,40,0,2*Math.PI);
        //this.ctx.fillStyle = "white";
        //this.ctx.stroke();
    }
}
