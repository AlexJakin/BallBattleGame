## Django游戏项目

1. 游戏地址：https://app4507.acapp.acwing.com.cn/
2. 推荐使用chrome浏览器
3. 游戏仅支持pc端

![菜单](/pic/menu.png)

## 游戏服务器运行环境

1. Ubuntu20.04
2. docker 20.10.21
3. nginx 1.18.0
4. python3
5. django
6. redis

## 游戏玩法

1. 注册

可以随意注册账号，或者使用acwing平台一键登录，好处就是不用申请权限

2. 登录

测试账号：zjb 密码：zjb
![登录](/pic/login.png)

3. 单人模式

进入游戏后，会自动生成五个对手，每次受到攻击都会变小，直到消失

每个玩家可点击鼠标右键来移动到目标位置（参考dota），并且有两个技能，技能一是火球攻击，技能二是闪现。技能有冷却时间，目前技能冷却时间暂时设置为3秒，技能描述：

    * 火球攻击：按Q键锁定火球技能，再按鼠标左键会朝着鼠标方向发射
    * 闪现：按F键锁定闪现技能，再按鼠标左键会闪现到鼠标所在位置

单人模式预览：
![单人模式](/pic/single.png)

4. 多人模式

    * 每三个玩家在一个房间，组队前，不可以移动，但可以进行聊天。
    * 组队成功后，前期是无敌时间，无敌时间后可以开始攻击
    ![多人模式](/pic/multi.png)

5. 聊天功能
    * 按空格键可以开启聊天功能
    * 按ESC快速退出，或者会一定时间自动消失
    ![聊天](/pic/chat.png)

## 游戏系统结构
* menu：菜单页面
* playground：游戏界面
* settings：设置页面

## 项目文件结构

* templates : 管理html文件
* urls : 管理路由
* views : 管理http函数
* models : 管理数据库数据
* static : 管理静态文件
* consumers : 管理websocket

## 游戏代码解析

1. 玩家类Player，每个玩家对象有以下属性：
    * playground = playground; // 地图
    * ctx = this.playground.game_map.ctx;
    * x = x; // 坐标
    * y = y; // 坐标
    * vx = 0; // 横向速度
    * vy = 0; // 纵向速度
    * damage_x = 0; // 伤害横向速度
    * damage_y = 0; // 伤害纵向速度
    * damage_speed = 0; // 伤害速度
    * move_length = 0; // 移动距离
    * radius = radius; // 弧度
    * color = color; // 物体颜色
    * speed = speed; // 物体速度
    * friction = 0.9; // 摩擦力
    * character = character; // 有三种角色 me自己 enemy其他玩家 robot机器人
    * username = username;
    * photo = photo;
    * protect_time = 0; // 保护时间
    * fireballs = []; // 保存每个玩家的子弹

2. 玩家战斗时候的粒子效应对象：

    * this.playground = playground;
    * this.ctx = this.playground.game_map.ctx;
    * this.x = x;
    * this.y = y;
    * this.radius = radius;
    * this.vx = vx;
    * this.vy = vy;
    * this.color = color;
    * this.speed = speed;
    * this.move_length = move_length;
    * this.friction = 0.9; // 摩擦力
    * this.eps = 0.01;

3. 技能对象：
    * this.playground = playground;
    * this.player = player;
    * this.ctx = this.playground.game_map.ctx;
    * this.x = x;
    * this.y = y;
    * this.vx = vx;
    * this.vy = vy;
    * this.move_length = 0;
    * this.radius = radius;
    * this.color = color;
    * this.speed = speed;
    * this.move_length = move_length;
    * this.damage = damage; // 伤害值
    * this.eps = 0.01;
