class FireBall extends AcGameObject{
    constructor(playground, player, x, y, radius, vx, vy, color, speed, move_length){
        super();
        this.playground = playground;
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

        this.eps = 0.1;

        this.start();
    }
    
    start(){
       // console.log(this.x, this.y, this.radius);
    }

    update(){
        // 火球距离到达，可以消失
        if (this.move_length < this.eps){
            this.destory();
            return false;
        }
        
        let moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
        this.x += this.vx * moved;// 方向乘距离
        this.y += this.vy * moved;
        this.move_length -= moved;

        this.render();
    }
   
    render(){
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }
}
