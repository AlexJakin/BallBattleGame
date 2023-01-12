class AcGamePlayground{
    constructor(root){
        this.root = root;
        this.$playground = $(`<div>游戏界面</div>`);
        
        this.hide();
        this.root.$ac_game.append(this.$playground);

        this.start();
    }
    
    start(){

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
