var BLACK = vec3(0, 0, 0);

//The height of canvas and grid
var W = 400, H = 800;
var gridSize = W / COLS;

var lineWidth = 1;

var points = [];
var colors = [];

function drawTriangle(A, B, C) {
    colors.push(BLACK);
    points.push(A);
    colors.push(BLACK);
    points.push(B);
    colors.push(BLACK);
    points.push(C);
}

//将坐标转换到canvas的坐标系下
function changeCoordinate(x, y) {
    var newX = 2 * x / W - 1;
    var newY = 2 * y / H - 1;
    return vec2(newX, newY);
}

//画矩形,由2个三角形拼成
function drawRectangle(a, b, c, d) {
    var A = changeCoordinate(a, b);
    var B = changeCoordinate(a, d);
    var C = changeCoordinate(c, d);
    var D = changeCoordinate(c, b);
    drawTriangle(A, B, C);
    drawTriangle(A, D, C);
}

//画方格
function drawBlock(x, y) {

    //先将坐标原点转换到左下角
    y = H / gridSize - y - 1;

    //求小方块的对角坐标
    var a = x * gridSize,
        b = y * gridSize;
    var c = a + gridSize,
        d = b + gridSize;

    //画一个矩形
    drawRectangle(a, b, c, d);
}

//画背景
function drawGrids() {
    
    for (var i = 0; i < COLS; i++) {
        var x = i * gridSize;
        drawRectangle(x - lineWidth, 0, x + lineWidth, H);
    }

    for (var i = 0; i < ROWS; i++) {
        var y = i * gridSize;
        drawRectangle(0, y - lineWidth, W, y + lineWidth);
    }
}


function render() {

    colors = [];
    points = [];

    //画背景
    for (var x = 0; x < COLS; ++x) {
        for (var y = 0; y < ROWS; ++y) {
            if (board[y][x]) {
                drawBlock(x, y);
            }
        }
    }

    //画当前块
    for (var y = 0; y < 4; ++y) {
        for (var x = 0; x < 4; ++x) {
            if (present[y][x]) {
                drawBlock(presentX + x, presentY + y);
            }
        }
    }

    //画格子
    drawGrids();

    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);


    //点缓冲区
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);


    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    //颜色缓冲区
    var bufferId1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId1);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
}