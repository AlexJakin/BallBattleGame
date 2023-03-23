class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo)
    {
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
        this.fireballs = []; // 保存每个玩家的子弹


        this.eps = 0.01;

        // 当前技能
        this.cur_skill = null;

        // 若不为机器人的话，当前玩家的头像渲染到球上
        if (this.character !== "robot")
        {
            this.img = new Image();
            this.img.src = this.photo;
        }

        // 设定技能cd 只有玩家才有技能cd
        // robot的技能cd由ai控制
        if (this.character === "me")
        {
            this.fireball_coldtime = 3; // 冷却时间
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
            

            this.blink_coldtime = 3;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start(){
        // 记录进入对局的人数
        this.playground.player_count ++;
        this.playground.notice_board.write("已就绪：" + this.playground.player_count + "位玩家");

        if (this.playground.player_count >= 3){
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting！！！");
        }

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
            // 如果不是对战状态 不能操作
            if (outer.playground.state !== "fighting") return true;

            //获取画布坐标
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3)//右键
            {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);

                // 如果是多人模式的话 要将当前玩家的移动情况广播给其他玩家 实现同步
                if (outer.playground.mode === "multi mode"){
                    outer.playground.mps.send_move_to(tx, ty);
                }
            }
            else if (e.which === 1) // 鼠标左键
            {
                let tx = (e.clientX - rect.left) / outer.playground.scale;
                let ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball")
                {
                    if (outer.fireball_coldtime > outer.eps) return false;
                    // 从该物体当前位置开始发射
                    let fireball = outer.shoot_fireball(tx, ty);

                    // 如果是多人模式
                    if (outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                    
                } // 闪现
                else if (outer.cur_skill === "blink"){
                    // 判断cd
                    if (outer.blink_coldtime > outer.eps) return false;
                    outer.blink(tx, ty);
                    if (outer.playground.mode === "multi mode")
                    {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }
                // 看是否选择按一次Q键只能发射一次
                outer.cur_skill = null;
            }

        });


        // 用户选择技能
        this.playground.game_map.$canvas.keydown(function(e){
            // 聊天功能 等待时也可以聊天
            if (e.which === 32){ // space
                if (outer.playground.mode === "multi mode") {// 打开聊天框
                    outer.playground.chat_field.show_input();
                    return false;
                }
            }else if (e.which === 27){ // esc
                if (outer.playground.mode === "multi mode"){
                    outer.playground.chat_field.hide_input();
                }
            }

            // 如果对局不是fighting状态直接返回
            if (outer.playground.state !== "fighting") return true;

            if (e.which === 81) // Q键
            {
            // 表示技能还没冷却好
            if (outer.firball_coldtime > outer.eps) return true
                outer.cur_skill = "fireball";
                return false;
            }

            if (e.which === 70)
            {
                if (outer.blink_coldtime > outer.eps) return true;
                outer.cur_skill = "blink";
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
        let fb = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, 0.01);
        this.fireballs.push(fb);
        //发射完成后重置技能cd
        this.fireball_coldtime = 3;
        return fb;
    }

    // 删除火球
    destroy_fireball(uuid){
        for (let i = 0; i < this.fireballs.length; i ++)
        {
            let fb = this.fireballs[i];
            if (fb.uuid === uuid)
            {
                fb.destroy();
                break;
            }
        }
    }
    // 闪现技能
    blink(tx, ty){
        let d = this.get_dist(this.x, this.y, tx, ty);
        d = Math.min(d, 0.8);
        let angle = Math.atan2(ty - this.y, tx - this.x);
        // 闪现坐标
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 3;
        this.move_length = 0; // 闪现后停止
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

    // 接受攻击并同步自己的位置 multi mode模式使用
    receive_attack(x, y, angle, damage, ball_uuid, attacker){
        // 删除火球
        attacker.destroy_fireball(ball_uuid);
        // 同步位置
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update(){
        this.protect_time += this.timedelta / 1000;
        this.update_move();
        // 只有是当前玩家 和 对局处于fighting状态才能冷却技能
        if (this.character === "me" && this.playground.state === "fighting"){
            this.update_coldtime();
        }
        this.render();
    }


    //更新玩家移动
    update_move(){
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

    // 更新冷却时间
    update_coldtime(){
        // 火球技能
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        // 闪现技能
        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    // 销毁
    on_destroy()
    {
        if (this.character === "me") this.playground.state = "over"; // 更新游戏状态

        for (let i = 0; i < this.playground.players.length; i ++ )
        {
            if (this.playground.players[i] === this)
            {
                this.playground.players.splice(i, 1);
                break;
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
            this.ctx.lineWidth = 0;
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

        // 只有对局还没结束 并且 当前玩家是自己的时候才渲染
        if (this.character === "me" && this.playground.state === "fighting"){
            this.render_skill_coldtime();
        }
    }

    // 渲染冷却时间
    render_skill_coldtime(){
        // 火球技能图标渲染及冷却显示
        let scale = this.playground.scale;
        let x = 1.5, y = 0.9, r = 0.04;

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {// 逆时针转画冷却圆
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }


        // 闪现技能图标显示及冷却显示
        x = 1.62, y = 0.9, r = 0.04;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2, false);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }
}
