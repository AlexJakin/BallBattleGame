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
