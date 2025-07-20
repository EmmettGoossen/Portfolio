//Variables

var lives = 3;
var score = 0;
var II = false;
//Create Sprites
  //misc
createEdgeSprites();
  //background
var back = createSprite(200,200);
  //player
var player = createSprite(200,330);
player.setAnimation("guardian");
player.scale = 0.75;
//platform
var platform = createGroup();
platform.add(createSprite(200,358));
platform.add(createSprite(95,185));
platform.add(createSprite(95,75));
platform.setAnimationEach("platform");
platform.setScaleEach(0.5);
platform.setColliderEach("rectangle",0,0,80,1);
//shard
var shard = createSprite(200,-50);
shard.setAnimation("shards");
shard.velocityY = 1.5;
shard.alpha = 0.75;
function draw() {
//scene
  // draw the background
  background1();
  // update the sprites
  plat();
  gravity();
  shards();
  drawSprites();
  if(lives < 1){
    stopSound("mixkit-small-waves-harbor-rocks-1208.mp3");
    stopSound("mixkit-rain-loop-1250.mp3");
    stopSound("mixkit-summer-night-in-the-forest-1227.mp3");
    background("black");
    textSize(25);
    text("error occurred. reboot:/msg 'Game over'",10,200,380);
  }
}
// Functions
function background1() {
 switch(score){
  case 0:
  back.setAnimation("back1");
  playSound("mixkit-small-waves-harbor-rocks-1208.mp3", true);
  stopSound("mixkit-summer-night-in-the-forest-1227.mp3");
  score++;
  break;
  case 25:
  back.setAnimation("back2");
  playSound("mixkit-rain-loop-1250.mp3", true);
  stopSound("mixkit-summer-night-in-the-forest-1227.mp3");
  score++;
  break;
  case 50:
  back.setAnimation("back3");
  stopSound("mixkit-rain-loop-1250.mp3");
  playSound("mixkit-summer-night-in-the-forest-1227.mp3",true);
  score++;
  break;
 }
 if(score%25 ==0){
  switch(randomNumber(1,3)){
  case 1:
  back.setAnimation("back1");
  stopSound("mixkit-rain-loop-1250.mp3");
  stopSound("mixkit-summer-night-in-the-forest-1227.mp3");
  score++;
  break;
  case 2:
  back.setAnimation("back2");
  stopSound("mixkit-summer-night-in-the-forest-1227.mp3");
  playSound("mixkit-rain-loop-1250.mp3", true);
  score++;
  break;
  case 3:
  back.setAnimation("back3");
  playSound("mixkit-summer-night-in-the-forest-1227.mp3",true);
  stopSound("mixkit-rain-loop-1250.mp3");
  score++;
  break;
  }
 }
}

function gravity(){
player.velocityY = player.velocityY + 2;
for(var I = 0; I<3;I++){
 if(!player.isTouching(platform.get(I))){
  continue;
 }
  if(player.y  <= platform.get(I).y-35){
player.velocityY = platform.get(I).velocityY;  
II = false;
   }else{
    player.velocityY = platform.get(I).velocityY-5;
  }
 }
edge();
movement();
}


function movement(){
//movement
  //D
if(keyDown('D') == true){
    player.velocityX = 5;
    player.setAnimation("guardian_walk");
  }
if(keyWentUp('D') == true){
    player.velocityX = 0;
    player.setAnimation("guardian");
  }
  //A
if(keyDown('A') == true){
    player.velocityX = -5;
    player.setAnimation("guardian_walk");
  }
if(keyWentUp('A')){
    player.velocityX = 0;
    player.setAnimation("guardian");

  }
  //W
  if(keyWentDown('space') && !II){
    player.velocityY = -28;
    II = true;
  }
}

function plat(){
for(var I = 0;I<3;I++){
if(platform.get(I).y >= 400){
 platform.get(I).y = -16;
 platform.get(I).x = randomNumber(55,355);
  }  
 }
plat2();
}

function shards(){
if(shard.y == 450){
shard.y = -200; 
shard.x = randomNumber(100,300);
 }
if(player.isTouching(shard)){
score++;
shard.y = -200;
shard.x = randomNumber(150,250);
 }
}

function edge(){
player.collide(leftEdge);
player.collide(rightEdge);
player.bounceOff(bottomEdge);
player.bounciness =2.5;
if(player.y >= 378){
lives--; 
 }
}

function plat2(){
    platform.setVelocityYEach(2);
}
