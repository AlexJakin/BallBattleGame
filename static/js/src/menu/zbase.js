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
        <div class = "ac-game-menu-field-item ac-game-menu-filed-item-multi-mode">
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
            outer.root.playground.show();
        });

        this.$multi_mode.click(function(){
            
        });

        this.$settings.click(function(){
            //console.log(1);
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
