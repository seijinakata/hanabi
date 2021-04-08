const SCREEN_SIZE_W = 800;
const SCREEN_SIZE_H = 600;

let can = document.getElementById("can");
let con = can.getContext("2d");

can.width = SCREEN_SIZE_W;
can.height = SCREEN_SIZE_H;

function rand(min,max){
  return Math.floor(
  (Math.random()*(max-min+1))+min);
}

let fwcol = [
"#ffdd55",
"#ff6622",
"#2255ff",
"#44ff44",
];

//シフトするのは移動量を少なくするため
//10進数で100なら2ビット左シフトで10000にして400足すと10400で2ビット右シフトで104.00になる
//もともと100から104になったので移動数は4になる
//vyを大きくするとフレームごとの移動量が大きくなりすぎる。小さくするとvyがすぐに＋になってしまうため上まで上がらない。

class Zanzo{
  
  constructor(x,y,col){
    this.col = col;
    this.x = x;
    this.y = y;
    this.c = 10;
    this.kill = false;
  }
  update(){
    if(this.kill) return;
    if(--this.c==0)this.kill = true;
  }
  draw(){
    if(this.kill) return;
    con.globalAlpha = 1.0*this.c/10;
    con.fillStyle = fwcol[this.col];
    con.fillRect(this.x>>8,this.y>>8,2,2);
  }
}
class Hanabi{
  constructor(x,y,col,vx,vy,gv,tp,hp){
    this.col = col;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.gv = gv;
    this.kill = false;
    //花火が玉か火花か？
    if(tp==undefined)tp=0;
    this.tp = tp;
    //火花の耐久力
    if(hp==undefined)hp=100;
    this.hp = hp;
    //火花の端っこの方動き遅く
    this.sp = 100;
  }
  
  update(){
    if(this.kill)return;
    this.x += this.vx*this.sp/100;;
    this.y += this.vy*this.sp/100;;
    this.vy += this.gv;
    
    //画面から出たら消す
    //花火玉
    if(this.tp == 0 && this.vy >=0){
       this.kill = true;  
      //火花内側入力colは発射した時設定
	for(let i=0;i<200;i++)
	{
		let r=rand(0,360);
		let s=rand(10,300);
		let vx=Math.cos(r*Math.PI/180)*s;
		let vy=Math.sin(r*Math.PI/180)*s;
		hanabi.push(
			new Hanabi( this.x,this.y,this.col,vx,vy,1,1,200) 
		);
	}
      //火花外側入力
	let col=rand(0,3);
	for(let i=0;i<100;i++)
	{
		let r=rand(0,360);
		let s=rand(300,400);
		let vx=Math.cos(r*Math.PI/180)*s;
		let vy=Math.sin(r*Math.PI/180)*s;
		hanabi.push(
			new Hanabi( this.x,this.y,col,vx,vy,1,1,200) 
		);
	}
    }
    //火花
		if(this.tp==1)
		{
			this.hp--;
			if(this.hp<100)
			{
				if(this.sp)this.sp--;
			}
			if(this.hp==0)this.kill=true;
		}
  }
  
  draw(){
    //花火にちらつきを出す
    if(this.tp>0 && rand(0,100)<80 )return;
		if(this.tp==0 && rand(0,100)<20 )return;
    
    if(this.kill)return;
    
    //すこしずつ消えていくようにする
    if(this.hp<50){
     con.globalAlpha=this.hp/50;
    }
    con.globalAlpha = 1.0;
		let col=this.col;
		if(this.tp==0)col=0;
    console.log(col)
		con.fillStyle=fwcol[col];
    con.fillRect(this.x>>8,this.y>>8,2,2);
    
    //火花の火一つ一つをぼやけさせる
    //アンチエイリアスみたいな感じ
    con.globalAlpha=0.5;
		con.fillRect((this.x>>8)-1,(this.y>>8),4,2);
		con.fillRect((this.x>>8),(this.y>>8)-1,2,4);
    zanzo.push(
      new Zanzo(this.x,this.y,col)
    );

  }
}

let hanabi = [];
let zanzo = [];

function updateObj(obj)
{
	//スプライトのブロックを更新
	for(let i=obj.length-1;i>=0;i--)
	{
		obj[i].update();
		if( obj[i].kill )obj.splice(i,1);
	}
}
function drawObj(obj)
{
	//スプライトのブロックを更新
	for(let i=obj.length-1;i>=0;i--)
	{
		obj[i].draw();
	}
}

//毎フレーム毎の更新処理
function update()
{
	updateObj(hanabi);
	updateObj(zanzo);
}
//作画
function draw(){
  
  //画面を黒でクリア
	con.globalCompositeOperation = 'source-over';
	con.fillStyle="#000000";
	con.fillRect(0,0,SCREEN_SIZE_W,SCREEN_SIZE_H);
  
  //後ろに隠れた花火も作画するための指定
	con.globalCompositeOperation = 'lighter';
	drawObj(zanzo);
	drawObj(hanabi);
}

setInterval(mainLoop,1000/60);

function mainLoop(){
  update();
  draw();
}

document.onkeydown = function(e){
  if(e.keyCode==32){
    let x=rand(0,SCREEN_SIZE_W);
    let y=rand(SCREEN_SIZE_H-100,SCREEN_SIZE_H);
    let col = rand(0,3);
    hanabi.push(
     new Hanabi(x<<8,y<<8,col,0,-800,4)
     )
   }
}
