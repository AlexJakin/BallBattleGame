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
class ChatField{
    constructor(playground){
        this.playground = playground;
        // 历史记录框
        this.$history = $(`<div class="ac-game-chat-field-history">聊天记录：</div>`);
        //输入框
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);
        
        //计时器id
        this.func_id = null;

        this.$history.hide();
        this.$input.hide();

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);
        


        this.start();
    }

    start(){
        this.add_listening_events();
    }

    add_listening_events() {
        let outer = this;

        this.$input.keydown(function(e) {
            if (e.which === 27) {  // ESC
                outer.hide_input();
                return false;
            } else if (e.which === 13) {  // ENTER
                let username = outer.playground.root.settings.username;
                let text = outer.$input.val();
                if (text) { // 信息不为空
                    outer.$input.val("");
                    outer.add_message(username, text);
                    outer.playground.mps.send_message(username, text);
                }
                return false;
            }
        });
    }
    
    render_message(message){
        return $(`<div>${message}</div>`);
    }

    add_message(username, text){
        this.show_history();
        let message = `[${username}]：${text}`;
        this.$history.append(this.render_message(message));
        // 将滚动条移到最下
        this.$history.scrollTop(this.$history[0].scrollHeight);
    }
    

    show_history(){
        let outer = this;
        this.$history.fadeIn();
        
        if (this.func_id) clearTimeout(this.func_id);
        this.func_id = setTimeout(function(){
            outer.$history.fadeOut();
            outer.func_id = null;
        }, 3000);
    }

    show_input(){
        this.show_history();
        this.$input.fadeIn();
        this.$input.focus();
    }

    hide_input(){
        this.$input.fadeOut();
        //将焦点集中到地图
        this.playground.game_map.$canvas.focus();
    }


}
class GameMap extends AcGameObject{
    constructor(playground)
    {
        super();
        this.playground = playground;
        this.$canvas = $(`<canvas tabindex=0></canvas>`);
        this.ctx = this.$canvas[0].getContext('2d');
        this.ctx.canvas.width = this.playground.width;
        this.ctx.canvas.height = this.playground.height;

        this.playground.$playground.append(this.$canvas);
    }
    
    start(){
        // 聚焦
        this.$canvas.focus();
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

class NoticeBoard extends AcGameObject {
    constructor(playground) {
        super();

        this.playground = playground;
        this.ctx = this.playground.game_map.ctx;
        this.text = "已就绪：0人";
    }

    start() {
    }

    write(text) {
        this.text = text;
    }

    update() {
        this.render();
    }

    render() {
        this.ctx.font = "20px serif";
        this.ctx.fillStyle = "white";
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.text, this.playground.width / 2, 20);
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
class AcGamePlayground{
    constructor(root){
        this.player_count = 0;
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide(); // 先加载菜单 再进入游戏
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green", "aqua", "maroon", "yellow", "purple", "silver"];
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
        this.mode = mode;
        // 三种状态waiting fighting over
        this.state = "waiting";
        this.notice_board = new NoticeBoard(this);

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
            this.chat_field = new ChatField(this);
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
        if (this.platform === "ACAPP")
        {
            this.root.AcWingOS.api.window.close();//当使用acwing平台登录时关闭直接关闭窗口
        }
        else{
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
    }

    register(){ // 打开注册页面
        this.$login.hide();
        this.$register.show();
    }
    
    login(){ // 登录
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
