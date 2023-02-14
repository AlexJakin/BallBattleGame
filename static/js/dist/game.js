class AcGameMenu{
    constructor(root)
    {
        this.root = root;
        this.$menu = $(`
<div class="ac-game-menu">
    <div class="ac-game-menu-field">
        <div class = "ac-game-menu-field-item ac-game-menu-field-item-single-mode">
            单人模式
        </div>
        <br>
        <div class = "ac-game-menu-field-item ac-game-menu-field-item-multi-mode">
            多人模式
        </div>
        <br>
        <div class = "ac-game-menu-field-item ac-game-menu-field-item-settings">
            注销
        </div>
    </div>
</div>
`);
        this.$menu.hide();
        this.root.$ac_game.append(this.$menu);
        this.$single_mode = this.$menu.find('.ac-game-menu-field-item-single-mode');
        this.$multi_mode  = this.$menu.find('.ac-game-menu-field-item-multi-mode');
        this.$settings = this.$menu.find('.ac-game-menu-field-item-settings');

        this.start();
    }
    start(){
        this.add_listening_events();
    }

    add_listening_events(){
        let outer = this;
        this.$single_mode.click(function(){
            outer.hide();
            outer.root.playground.show("single mode");
        });

        this.$multi_mode.click(function(){
            outer.hide();
            outer.root.playground.show("multi mode");
        });

        this.$settings.click(function(){
            outer.root.settings.logout_on_remote();
        });
    }
    
    // 显示菜单
    show(){
        this.$menu.show();
    }

    //关闭菜单
    hide(){
        this.$menu.hide();
    }
}
let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor(){
        // 将每一个物体对象都放入全局数组中
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false; // 是否试行过start
        this.timedelta = 0; // 当前帧距离上一帧的时间间隔
        this.uuid = this.create_uuid();
    }

    // 为每一名物体随机生成一个唯一id，联机对战时候标记
    create_uuid(){
        let res = "";
        for (let i = 0; i < 8; i ++)
        {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start(){ // 只会在第一帧执行一次
    }

    update(){ // 每一帧只执行一次

    }

    on_destroy(){ // 销毁前执行
    }

    destroy(){ // 删掉该物体
        this.on_destroy();

        for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
        {
            if (AC_GAME_OBJECTS[i] === this) //  找到该物体
            {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }

}
let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp){

    for (let i = 0; i < AC_GAME_OBJECTS.length; i ++ )
    {
        let obj = AC_GAME_OBJECTS[i];
        if (!obj.has_called_start) // 如果没有执行过start
        {
            obj.start();
            obj.has_called_start = true;
        }
        else
        {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(AC_GAME_ANIMATION);
}
requestAnimationFrame(AC_GAME_ANIMATION);
class GameMap extends AcGameObject{
    constructor(playground)
    {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.playground.$playground.append(this.$canvas);
    }
    
    start(){
    }

    resize(){
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        // 取消渐变过程
        this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    }

    update(){
        this.render();
    }

    render(){
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
}   

class Particle extends AcGameObject{
    constructor(playground, x, y, radius, vx, vy, color, speed, move_length)
    {
        super();
        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.speed = speed;
        this.move_length = move_length;
        this.friction = 0.9; // 摩擦力
        this.eps = 0.01;
    }

    start()
    {
    }
    
    update()
    {
        if (this.move_length < this.eps || this.speed < this.eps)
        {
            this.destroy();
            return false;
        }

        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;
        this.y += this.vy * moved;
        this.speed *= this.friction;
        this.move_length -= moved;
        //console.log(1);

        this.render();
    }

    render()
    {
        let scale = this.playground.scale;
        // console.log(this.x, this.y, this.radius);
        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
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
        
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;// 方向乘距离
        this.y += this.vy * moved;
        this.move_length -= moved;
        
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

        this.render();
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
        this.destroy();
    }

    render(){
        let scale = this.playground.scale;

        this.ctx.beginPath();
        this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
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
class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide(); // 先加载菜单 再进入游戏
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 7)];
    }

    start(){
        let outer = this;
        $(window).resize(function(){
            outer.resize(); 
        });
    }

    resize(){
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        let unit = Math.min(this.width / 16, this.height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        // 统一长度
        this.scale = this.height;

        if (this.game_map) this.game_map.resize();
    }

    // 打开游戏界面
    show(mode){
        let outer = this;
        this.$playground.show();

        // 界面显示时都要resize，统一长度
        // this.resize();

        // this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);

        this.resize();

        this.players = []; // 玩家列表
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        // 判断是什么模式
        if (mode === "single mode")
        {
            // 创建敌人
            for (let i = 0; i < 5; i ++ )
            {
                this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, this.get_random_color(), 0.15, "robot"));
                // console.log(this.get_random_color);
            }
        }
        else if (mode === "multi mode")
        {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;
            // 当链接的时候向后端发送消息
            this.mps.ws.onopen = function() {
                outer.mps.send_create_player(outer.root.settings.username, outer.root.settings.photo);
            }
        }


    }
    // 关闭游戏界面
    hide(){
        this.$playground.hide();
    }
}
class Settings{
    constructor(root){
        this.root = root;
        this.platform = "WEB";
        if (this.root.AcWingOS) this.platform = "ACAPP";
        
        this.username = "";
        this.photo = "";
        
        this.$settings = $(`
<div class = "ac-game-settings">
<div class = "ac-game-settings-login">
    <div class = "ac-game-settings-title">
        登录
    </div>
    <div class="ac-game-settings-username">
        <div class = "ac-game-settings-item">
            <input type="text" placeholder="用户名">
        </div>
    </div>
    <div class = "ac-game-settings-password">
        <div class = "ac-game-settings-item">
            <input type = "password" placeholder="密码">
        </div>
    </div>
    <div class = "ac-game-settings-submit">
        <div class = "ac-game-settings-item">
            <button>登录</button>
        </div>
    </div>
    <div class = "ac-game-settings-error-message">
        
    </div>
    <div class = "ac-game-settings-option">
        注册
    </div>
    <br>
    <div class = "ac-game-settings-acwing">
        <img width="30" src = "https://app4507.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
        <div>AcWing一键登录</div>
    </div>
</div>



    <div class = "ac-game-settings-register">
        <div class="ac-game-settings-title">
            注册
        </div>
        <div class="ac-game-settings-username">
            <div class="ac-game-settings-item">
                <input type="text" placeholder="用户名">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-first">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="密码">
            </div>
        </div>
        <div class="ac-game-settings-password ac-game-settings-password-second">
            <div class="ac-game-settings-item">
                <input type="password" placeholder="确认密码">
            </div>
        </div>
        <div class="ac-game-settings-submit">
            <div class="ac-game-settings-item">
                <button>注册</button>
            </div>
        </div>
        <div class="ac-game-settings-error-message">
        </div>
        <div class="ac-game-settings-option">
            登录
        </div>
        <br>
        <div class="ac-game-settings-acwing">
            <img width="30" src="https://app165.acapp.acwing.com.cn/static/image/settings/acwing_logo.png">
            <br>
            <div>
                AcWing一键登录
            </div>
        </div>

    </div>
</div>
`);
        this.$login = this.$settings.find(".ac-game-settings-login");
        this.$login_username = this.$login.find(".ac-game-settings-username input");
        this.$login_password = this.$login.find(".ac-game-settings-password input");
        this.$login_submit = this.$login.find(".ac-game-settings-submit button");
        this.$login_error_message = this.$login.find(".ac-game-settings-error-message");
        this.$login_register = this.$login.find(".ac-game-settings-option");

        this.$login.hide();


        this.$register = this.$settings.find(".ac-game-settings-register");
        this.$register_username = this.$register.find(".ac-game-settings-username input");
        this.$register_password = this.$register.find(".ac-game-settings-password-first input");
        this.$register_password_confirm = this.$register.find(".ac-game-settings-password-second input");
        this.$register_submit = this.$register.find(".ac-game-settings-submit button");
        this.$register_error_message = this.$register.find(".ac-game-settings-error-message");
        this.$register_login = this.$register.find(".ac-game-settings-option");

        this.$register.hide();
        this.$acwing_login = this.$settings.find('.ac-game-settings-acwing img')
        this.root.$ac_game.append(this.$settings);

        this.start();
    }
    

    start(){
        if (this.platform === "ACAPP")
        {
            this.getinfo_acapp();
        }
        else
        {
        
            this.getinfo_web();
            //运行绑定函数
            this.add_listening_events();
        }
    }
    
    add_listening_events(){
        let outer = this;

        this.add_listening_events_login();
        this.add_listening_events_register();
        this.$acwing_login.click(function(){
            outer.acwing_login();
        });
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
        this.$login_submit.click(function(){
            outer.login_on_remote();
        });
    }

    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
        });
        this.$register_submit.click(function(){
            outer.register_on_remote();
        })
    }
    
    acwing_login(){
        $.ajax({
            url: "https://app4507.acapp.acwing.com.cn/settings/acwing/web/apply_code/",
            type: "GET",
            success: function(resp){
                if (resp.result === "success")
                {
                    //console.log(resp.apply_code_url);
                    window.location.replace(resp.apply_code_url);
                }
            }
        });
    }

    login_on_remote(){ //在远程服务器上登录
        let outer = this;
        let username = this.$login_username.val();
        let password = this.$login_password.val();
        this.$login_error_message.empty();

        $.ajax({
            url : "https://app4507.acapp.acwing.com.cn/settings/login/",
            type: "GET",
            data:{
                username : username,
                password : password,
            },
            success : function(resp){
                if (resp.result === "success")
                {
                    location.reload();
                }
                else
                {
                    outer.$login_error_message.html(resp.result);
                }
            }
        });
    }

    register_on_remote(){ // 在远程服务器上注册
        let outer = this;
        let username = this.$register_username.val();
        let password = this.$register_password.val();
        let password_confirm = this.$register_password_confirm.val();
        this.$register_error_message.empty();

        $.ajax({
            url : "https://app4507.acapp.acwing.com.cn/settings/register",
            data:{
                username:username,
                password:password,
                password_confirm:password_confirm,
            },
            success: function(resp){
                if (resp.result === "success")
                {
                    location.reload();
                }
                else
                {
                    outer.$register_error_message.html(resp.result);
                }
            }
        });
    }

    logout_on_remote(){ // 在远程服务器上退出登录
        // 注销功能仅支持WEB
        if (this.platform === "ACAPP") return false;
        
        $.ajax({
            url : "https://app4507.acapp.acwing.com.cn/settings/logout/",
            type: "GET",
            success: function(resp){
                if (resp.result === "success")
                {
                    location.reload();
                }
            }
        });
    }

    register(){ // 打开注册页面
        this.$login.hide();
        this.$register.show();
    }
    
    login(){ // 登录
        this.$register.hide();
        this.$login.show();
    }

    acapp_login(appid, redirect_uri, scope, state) {
        let outer = this;

        this.root.AcWingOS.api.oauth2.authorize(appid, redirect_uri, scope, state, function(resp) {
            if (resp.result === "success") {
                outer.username = resp.username;
                outer.photo = resp.photo;
                outer.hide();
                outer.root.menu.show();
            }
        });
    }

    
    getinfo_acapp(){
        let outer = this;

        $.ajax({
            url: "https://app4507.acapp.acwing.com.cn/settings/acwing/acapp/apply_code/",
            type: "GET",
            success: function(resp) {
                if (resp.result === "success") {
                    outer.acapp_login(resp.appid, resp.redirect_uri, resp.scope, resp.state);
                }
            }
        });
    }

    getinfo_web(){
        let outer = this;

        $.ajax({
            url : "https://app4507.acapp.acwing.com.cn/settings/getinfo/",
            type : "GET",
            data : {
                platform : outer.platform,
            },
            success: function(resp){
                if (resp.result === "success")
                {
                    outer.username = resp.username;
                    outer.photo = resp.photo;
                    outer.hide();
                    outer.root.menu.show();
                }
                else
                {
                    outer.login();
                }
            }
        });
    }

    hide(){
        this.$settings.hide();
    }

    show(){
        this.$settings.show();
    }
}
export class AcGame{
    constructor(id, AcWingOS){
        this.id = id;
        this.$ac_game = $('#' + id);
        this.AcWingOS = AcWingOS;

        this.settings = new Settings(this);
        this.menu = new AcGameMenu(this);
        this.playground = new AcGamePlayground(this);
        
        this.start();

    }

    start(){

    }
}
