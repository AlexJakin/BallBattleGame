class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);

        this.hide(); // 先加载菜单 再进入游戏

        this.start();
    }

    get_random_color(){
        let colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * 7)];
    }

    start(){
        //console.log(this.width);
        //console.log(this.heighjt)
    }

    // 打开游戏界面
    show(){
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = []; // 玩家列表
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        // 创建敌人
        for (let i = 0; i < 5; i ++ )
        {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, this.get_random_color(), this.height * 0.15, false));
            // console.log(this.get_random_color);
        }


    }
    // 关闭游戏界面
    hide(){
        this.$playground.hide();
    }
}
