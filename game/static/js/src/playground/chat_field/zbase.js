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
