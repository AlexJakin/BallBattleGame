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
