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
        this.root.$ac_game.append(this.$settings);

        this.start();
    }
    

    start(){
        this.getinfo();
        //运行绑定函数
        this.add_listening_events();
    }
    
    add_listening_events(){
        this.add_listening_events_login();
        this.add_listening_events_register();
    }

    add_listening_events_login(){
        let outer = this;
        this.$login_register.click(function(){
            outer.register();
        });
    }

    add_listening_events_register(){
        let outer = this;
        this.$register_login.click(function(){
            outer.login();
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
    
    getinfo(){
        let outer = this;

        $.ajax({
            url : "https://app4507.acapp.acwing.com.cn/settings/getinfo/",
            type : "GET",
            data : {
                platform : outer.platform,
            },
            success: function(resp){
                console.log(resp);
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
