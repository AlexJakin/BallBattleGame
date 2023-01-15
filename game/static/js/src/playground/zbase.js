class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        
        // this.hide();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        
        this.players = []; // 玩家列表
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));
        

        // 创建敌人
        for (let i = 0; i < 5; i ++ )
        {
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "green", this.height * 0.15, false));

        }

        this.start();
    }
    
    start(){
        //console.log(this.width);
        //console.log(this.heighjt)
    }

    // 打开游戏界面
    show(){
        this.$playground.show();
    }
    // 关闭游戏界面
    hide(){
        this.$playground.hide();
    }
}
