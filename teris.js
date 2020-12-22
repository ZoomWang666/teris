var COLS = 10, ROWS = 20;//游戏界面20*10个格子
var board = [];//游戏面板，二维数组
var lose;
var intervalMove;//块位置更新间隔
var intervalRender;//绘图间隔
var present;//当前块
var presentX, presentY; //当前移动的距离
var is_fixed;
var score = 0;

//七种形状的块
var shapes = [
    [ 1, 1, 1, 1 ],
    [ 1, 1, 1, 0,
      1 ],
    [ 1, 1, 1, 0,
      0, 0, 1 ],
    [ 1, 1, 0, 0,
      1, 1 ],
    [ 1, 1, 0, 0,
      0, 1, 1 ],
    [ 0, 1, 1, 0,
      1, 1 ],
    [ 0, 1, 0, 0,
      1, 1, 1 ]
];


//随机生成某种形状的块
function newShape() {

    //随机生成一个整数id
    var id = Math.floor(Math.random() * shapes.length);
    //某个形状的块
    var shape = shapes[ id ]; 

    present = [];
    for ( var y = 0; y < 4; ++y ) {
        present[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            var i = 4 * y + x;

            //4*4数组记录的形状号，以及对应的颜色号
            if ( typeof shape[ i ] != 'undefined' && shape[ i ] ) {
                present[ y ][ x ] = id + 1;
            }
            else {
                present[ y ][ x ] = 0;
            }

        }
    }
    
    //初始不固定
    is_fixed = false;
    // 出发点
    presentX = 4;
    presentY = 0;
}

//初始化，清空游戏板面
function init() {
    for ( var y = 0; y < ROWS; ++y ) {
        board[ y ] = [];
        for ( var x = 0; x < COLS; ++x ) {
            board[ y ][ x ] = 0;
        }
    }
}

//下坠
function move() {
    //没触碰到边界则下移
    if ( valid( 0, 1 ) ) {
        ++presentY;
    }
    // 触碰到边界
    else {

        //固定
        fix();
        valid(0, 1);
        clearLines();

        if (lose) {
            clearAllIntervals();
            alert("game over!");
            return false;
        }
        newShape();
    }
}

//停止块的移动并固定
function fix() {
    for ( var y = 0; y < 4; ++y ) {
        for ( var x = 0; x < 4; ++x ) {
            if ( present[ y ][ x ] ) {
                board[ y + presentY ][ x + presentX ] = present[ y ][ x ];
            }
        }
    }
    is_fixed = true;
}

//旋转变换
function rotate( present ) {
    var newCurrent = [];
    for ( var y = 0; y < 4; ++y ) {
        newCurrent[ y ] = [];
        for ( var x = 0; x < 4; ++x ) {
            newCurrent[ y ][ x ] = present[ 3 - x ][ y ];
        }
    }
    return newCurrent;
}

//清除一行填满的格子
function clearLines() {

    for (var y = ROWS - 1; y >= 0; --y) {

        //是否有行填满
        var rowFilled = true;
        for ( var x = 0; x < COLS; ++x ) {
            if ( board[ y ][ x ] == 0 ) {
                rowFilled = false;
                break;
            }
        }
        //填满则下降一行
        if ( rowFilled ) {
            for ( var yy = y; yy > 0; --yy ) {
                for ( var x = 0; x < COLS; ++x ) {
                    board[ yy ][ x ] = board[ yy - 1 ][ x ];
                }
            }
            score += 100;
            ++y;
        }
    }
    document.getElementById("score").innerText = score;
}



//开始按钮
function startButtonClicked() {
    newGame();
    document.getElementById("startButton").disabled = true;
}


//取消定时器
function clearAllIntervals(){
    clearInterval( intervalMove );
    clearInterval( intervalRender );
}

//新游戏
function newGame() {
    clearAllIntervals();
    score = 0;
    document.getElementById("score").innerText = score;

    canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    //设置移动及重新绘图的间隔
    intervalRender = setInterval(render, 50);
    intervalMove = setInterval(move, 500);
    init();
    newShape();
    lose = false;
}

//检测方块组的移动是否合法
function valid(xChanged, yChanged, newCurrent) {

    xChanged = xChanged || 0;
    yChanged = yChanged || 0;

    //新的坐标变化
    xChanged = presentX + xChanged;
    yChanged = presentY + yChanged;
    newCurrent = newCurrent || present;

    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (newCurrent[y][x]) {
                if (typeof board[y + yChanged] == 'undefined'
                    || typeof board[y + yChanged][x + xChanged] == 'undefined'
                    || board[y + yChanged][x + xChanged]
                    || x + xChanged < 0
                    || y + yChanged >= ROWS
                    || x + xChanged >= COLS) {

                    //固定在最上一行就输了
                    if (yChanged == 1 && is_fixed) {
                        lose = true;
                        document.getElementById('startButton').disabled = false;
                    }
                    return false;
                }
            }
        }
    }
    return true;
}

//键盘操作
function keyPressed( key ) {
    switch ( key ) {
        case 'left':
            if ( valid( -1 ) )  presentX--; 
            break;
        case 'right':
            if ( valid( 1 ) )  presentX++;
            break;
        case 'down':
            if ( valid( 0, 1 ) )  presentY++;
            break;
        case 'rotate':
            var rotated = rotate( present );
            if ( valid( 0, 0, rotated ) ) present = rotated;
            break;
    }
}

//键盘控制
document.onkeypress = function (e) {

    var keys = {
        "w": "rotate",
        "a": "left",
        "s": "down",
        "d": "right"
    };
    var keyCode = e.key;
    if ( typeof keys[keyCode] != 'undefined') {
        keyPressed(keys[keyCode]);
        //键盘按一次则应该重新绘图
        render();
    }
}