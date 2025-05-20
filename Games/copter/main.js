// GAME SETUP
  //libraries
const spriteLogic = document.spriteLogic;
const keyLogic = document.keyLogic;
const canvas = document.getElementById("channel").getContext("2d");
var World = new Date();


  //strings
var tip = "press E to shoot the target.\nhold SPACE to float."+
  " W and space will let you go up. A and D let you go left and"+
  " right. When you're ready press V to start.\nT to change tip";
  //world
var game = {
    //world logic
    time: 0,
    combo: 0,
    score: 0,
    blitzBlind: 100, //score to beat in blitz mode (2)
    mode: 0, //tutorial (0), boss (1), blitz (2)
    enemiesAreReady: [false, false, false, false], //whether each enemy can spawn
    menu:true,

    //sprites
    explosionList: [], //list for explosion sprites
    background: spriteLogic.createSprite(200,200),
    target: spriteLogic.createSprite(147,33)
  };

  //player
var player = {
    sprite: spriteLogic.createSprite(200, 100),
    isAlive: true, //if the player is alive
    isPowered: false //if the player has the power-up
};

  //background
game.background.setAnimation("copter/img/background.png", 400, 400, 3);
game.background.animationLogic.speed = 10;
game.target.setAnimation("copter/img/target.png", 72, 72, 2);
game.target.animationLogic.speed = 4;
game.target.scale = 0.9;
    //player
player.sprite.setAnimation("copter/img/copter.png", 180, 130, 4);
player.sprite.scale = 0.6;
player.sprite.boundingBoxType = "circle";
    //obstacles
      //missiles
var missile = {
  sprite: spriteLogic.createSprite(430,Math.floor(Math.random()*361)+20),
  tracker: spriteLogic.createSprite(430,430),
  respawn: true //wether missile is allowed to respawn
};
missile.sprite.setAnimation("copter/img/missile.png", 76, 28, 1);
missile.sprite.scale = 0.75;
missile.tracker.setAnimation("copter/img/tracker.png", 32, 32,2);
missile.tracker.animationLogic.speed = 2;
missile.tracker.scale = 0.6;
      //debris
var rock = {
  sprites: [],
  density: 2 //number of rocks active
}
rock.sprites.push(spriteLogic.createSprite(900,500));
rock.sprites.push(spriteLogic.createSprite(900,500));
rock.sprites.push(spriteLogic.createSprite(720,920));  
rock.sprites.forEach((e) => {
  e.setAnimation("copter/img/debris.png", 70, 55, 1);
});
rock.sprites.forEach((e) => {
  e.dr = 13;
});
      //satallite
var satallite ={
  orb: spriteLogic.createSprite(-10,1000),
  sat: spriteLogic.createSprite(360,25),
  lifetime: 0,
  isSpawned: false
};
satallite.sat.setAnimation("copter/img/sat.png", 160, 55, 1);
satallite.sat.boundingBoxType = 'circle';
satallite.orb.setAnimation("copter/img/orb.png", 64, 64, 3);
satallite.orb.boundingBoxType = 'circle';
satallite.orb.scale = 0.75;

    //menu
var menuName = spriteLogic.createSprite(200,45);
menuName.animationLogic.speed = 3;
menuName.setAnimation("copter/img/title.png", 350, 78, 3);
//s#3
function draw() {
  World = new Date();
  canvas.fillStyle = "#ff6200";
  canvas.fillRect(0,0,400,400);

  checkReset(); //for reset conditions
  if(game.menu){ //run menu
    checkHit(); //legacy easter egg
    clearExplosions();
    menuSelect();
    resetVals();
  }else{ //run game
    gameRun();
  }
  // LOOPING
//obstacles
//controls
  
  // DRAW SPRITES
  spriteLogic.draw("channel");

  //these are things we want to draw over sprites
  if(game.menu){
    canvas.font = "40px pixel";

    //highlight the current selection
    let pClr; //color of the play button
    let survival = '#b3b3b3';
    let blitz = "#b3b3b3";
    let tClr; //color of the tutorial button
    switch(game.mode){
      case 0:
        pClr = "#b3b3b3";
        tClr = "#ffffff";
        break;
      case 1:
        tClr = "#b3b3b3";
        pClr = "#ffffff";
        survival = pClr;
        break;
      case 2:
        tClr = "#b3b3b3";
        pClr = "#ffffff";
        blitz =pClr;
        break;
    }

    canvas.fillStyle = pClr;
    canvas.fillText("Play",165,175);
    canvas.font = "20px pixel";
    canvas.fillStyle = survival;
    canvas.fillText("Survival",185,235);
    canvas.fillStyle = blitz;
    canvas.fillText("Blitz",185,215);
    canvas.font = "40px pixel";
    canvas.fillStyle = tClr;
    canvas.fillText("Tutorial",135,295);
  }else{
    canvas.font = "20px pixel";
    canvas.fillStyle = "green";
    switch(game.mode){
        case 1:
          canvas.fillText("time: " + game.score,15,20);
      break;
        case 2:
          canvas.fillText("hits: "+(100-game.blitzBlind),15,20);
      break;
    }
    killPlayer(); //checks if player is dead then handles it
  }
  requestAnimationFrame(draw);
}
draw();

function killPlayer(){
    if(game.mode == 0){
        //respawn player in tutorial
            //handle x pos
        if(player.sprite.x < -75){
            player.sprite.x = 450;
        }else if(player.sprite.x > 475){
            player.sprite.x = -50;    
        }

            //handle y pos
        if(player.sprite.y < -75){
            player.sprite.y = 425;
        }else if(player.sprite.y > 475){
            player.sprite.y = -20;    
        }
        return;
    }
    if (player.sprite.x < -50 || player.sprite.x > 475 || player.sprite.y < -75 || player.sprite.y > 475){
        canvas.fillStyle = "black";
        canvas.fillRect(0,0,400,400);
        canvas.font = "50px pixel";
        canvas.fillStyle = "green";
        canvas.fillText("Game Over!", 50, 200);
        canvas.font = "15px pixel";
        canvas.fillText("press v to restart", 75, 220);
        switch(game.mode){
          case false:
            canvas.fillText("time: " + game.score,75,235);
            break;
          case true:
            canvas.fillText("hits: "+(100-game.blitzBlind),75,235);
            break;
       }
      player.isAlive = false;
    }
}

function createExplosion(x,y){
  game.explosionList.push(spriteLogic.createSprite(x,y));
  game.explosionList[game.explosionList.length-1].setAnimation("copter/img/boom.png", 96, 96, 9);
  game.explosionList[game.explosionList.length-1].animationLogic.speed = 16;
  game.explosionList[game.explosionList.length-1].lifetime = 36;
  game.explosionList[game.explosionList.length-1].boundingBoxType = "circle";
}

function movement(){
  // PLAYER CONTROLS
//upwards(space & W)
  switch(keyLogic.keyDown(" ")){
    case true:
      if(player.sprite.dy > 0){ // decelerate on space
        player.sprite.dy -= keyLogic.keyDown('w') ? 1.25:0.25; //decelerate fast when w pressed
        break;
      }
      player.sprite.dy = keyLogic.keyDown('w') ? -5:0; //if w pressed, ascend
      break;
    case false:
      if(game.mode == 0 && player.sprite.y >= 342){ // add floor to tutorial
        player.sprite.dy = 0;
        break;
      }
      player.sprite.dy += 1;
      break;
  }

  if(keyLogic.keyDown("a")){// a = left
    player.sprite.dx -= 0.35;
    player.sprite.rot =-20;
  }else if(keyLogic.keyDown("d")){// d = right
    player.sprite.dx += 0.35;  
    player.sprite.rot =20;
  }else{
    player.sprite.rot = 0;
  }
}

//main missile funct, responsible for missile traking, detonating and spawning at the right time.
function missileMain(){
  missile.tracker.visible = true;
  trackerFunct();

  if(!missile.respawn){//exit when missile cooldown
    return;
  }

  //rotation
  missile.sprite.rot = (Math.atan2(missile.sprite.dy, missile.sprite.dx)*180/3.14);
  
  //handle tracking
  if(player.sprite.x > missile.sprite.x){
    missile.sprite.dx += 0.22;
    missile.sprite.dx = Math.min(10,missile.sprite.dx); //clamp horizontal
  }else if(player.sprite.x < missile.sprite.x){
    missile.sprite.dx -= 0.45; 
    missile.sprite.dx = Math.max(-10,missile.sprite.dx); //clamp horizontal
  }

  if(player.sprite.y > missile.sprite.y){
    missile.sprite.dy += 0.22;
  }else if(player.sprite.y < missile.sprite.y){
    missile.sprite.dy -= 0.22; 
  }

  if(((missile.sprite.x < -350 || missile.sprite.x > 750) || ( missile.sprite.y < -350 || missile.sprite.y > 750))){
    missileSpawn(750);
  }
  if(player.sprite.isTouching(missile.sprite)){
    if(!player.isPowered){
      player.sprite.dx = (missile.sprite.dx/1.25) +6;
      game.combo = 0;
    }else{
      game.combo -= 3;  
    }

    missileSpawn(750);
    missile.respawn = false;
    setTimeout(()=>{
      missile.respawn = true;
    }, 1500);
 }
}

//funct that respawns the missile when called
function missileSpawn(x){
  missile.sprite.x = x;
  missile.sprite.y = Math.floor(Math.random()*51)+75;
  missile.sprite.dy = 0;
  missile.sprite.dx = 0;
}

function resetVals(){
    tip = "press E to shoot the target.\nhold SPACE to float."+
        " W and space will let you go up. A and D let you go left and"+
        " right. When you're ready press V to start.\nT to change tip";
        game.enemiesAreReady = [false,false,false,false,false];
        missile.respawn = true;
        game.blitzBlind = 100;
        game.time = World.getSeconds();
        game.background.visible = true;
        player.sprite.x = 200;
        player.sprite.y = 100;
        player.sprite.rot = 0;
        player.sprite.dy = 0;
        player.sprite.dx = 0;
        menuName.visible = true;
        game.target.x = 147;  
        game.target.y = 33;
        satallite.sat.y = -32;
        satallite.sat.dy = 0;
        satallite.sat.dr = 0;
        satallite.sat.rot = 0;
        rock.density = 2;
        bossbool = false;
        missile.tracker.visible = false;
}

function gameRun(){  
  menuName.visible = false;
  game.target.scale = 1;
  missile.sprite.rotateToDirection = true;

  if(player.isAlive){
    movement();
    game.score = World.getSeconds() - game.time;
  }
  
  spawnEnemies();
//s#1
  //handle explosions
  checkHit();
  enemyExplosionReset();
  updatePlayerPowerUp();
  clearExplosions();
    
  if(game.mode == 0){
    game.background.visible = false;
    canvas.strokeStyle = "#ff7824";
    canvas.lineWidth = 15;
    canvas.strokeRect(25,25,350,350);
    canvas.lineWidth = 5;
    canvas.strokeStyle = "#ff0000";
    canvas.strokeRect(5,250,390,145);

    canvas.fillStyle = "#091b3e";
    canvas.font = "15px pixel";
    let inx = 0;
    getLines(canvas, keyLogic.keyWentDown('t') ? changeTip():tip,400).forEach((e) => {
      canvas.fillText(e,5,15+inx*15);
      inx++;
    });
  }
}

//handles spawning in tutorial and base
function spawnEnemies(){
  if(game.mode == 0){
    for(let inx = 0;inx<game.enemiesAreReady.length;inx++){
      if(keyLogic.keyWentDown((inx+1)+"")){
        game.enemiesAreReady[inx] = !game.enemiesAreReady[inx];
      }
    }
    if(game.enemiesAreReady[0]){
      rockMain();
      rock.density = 3;
    }
    missile.tracker.visible = game.enemiesAreReady[1];
    if(game.enemiesAreReady[1]){
      missileMain();
    }
    if(game.enemiesAreReady[2]){
      satMain();
    }else{
      satallite.sat.y = -32;
      satallite.sat.rot = 0;
      satallite.sat.dr = 0;
    }
    return;
  }

  rockMain();
  if(World.getSeconds() - game.time >= 60){
    missileMain();
  }
  if(World.getSeconds() - game.time >= 90){
    rock.density = 3;
  }
  if(World.getSeconds() - game.time >= 120){
    satMain();
  }
}

function clearExplosions(){
  for(let inx = 0; inx < game.explosionList.length;inx++){
    if(game.explosionList[inx].dead == false){
      continue;
    }
    game.explosionList.splice(inx);
  }
}

function rockMain(){
  for(let rockInx = 0; rockInx < rock.density;rockInx++){
    if(rock.sprites[rockInx].x >= 700 || rock.sprites[rockInx].y >= 900){
      rock.sprites[rockInx].y = -150;
      rock.sprites[rockInx].x = -150;
      rockThrow(rockInx);
    }
    if(player.sprite.isTouching(rock.sprites[rockInx])){
      if(!player.isPowered){
        player.sprite.dy = (rock.sprites[rockInx].dy*1.5)+13;
        player.sprite.dx = (rock.sprites[rockInx].dx)+2;
        game.combo = 0;
      }else{
        game.combo -= 3; 
      }
    rock.sprites[rockInx].y = Math.floor(Math.random() * 101)-250;
    rock.sprites[rockInx].x = Math.floor(Math.random() * 101)-250;
    rockThrow(rockInx);
  }
 } 
}

function rockThrow(inx){
  rock.sprites[inx].dy = sigmoid(player.sprite.y/30)*(Math.floor(Math.random() * 6)+4)/2;
  rock.sprites[inx].dx = sigmoid(player.sprite.x/30)*(Math.floor(Math.random() * 6)+4)/2;
}  

function satMain(){
  if(satSpawn()){
    satShoot();
    animateSat();
  }
  beamInteract();
}

function satShoot(){
  satallite.orb.dx += tanh((player.sprite.x-satallite.orb.x)/50)*0.20;
  satallite.orb.dx = Math.min(satallite.orb.dx,8);
  satallite.orb.dx = Math.max(satallite.orb.dx,-8);
  satallite.orb.dy += 0.05+tanh((player.sprite.y-satallite.orb.y)/125)/20;
  if(satallite.orb.y >= 450 || satallite.orb.x <= -50){
    satallite.orb.dy = (tanh((satallite.orb.y-satallite.sat.y)/50)*2);
    satallite.orb.dx = (tanh((satallite.orb.x-satallite.sat.x)/50)*2);
    satallite.orb.y = satallite.sat.y;
    satallite.orb.x = satallite.sat.x;
  }
}

function satSpawn(){
  if(satallite.sat.y != 25){
    satallite.sat.dy = 3;
    return false;
  }
  return true;
}

function animateSat(){
  setTimeout(()=>{
    satSwitch();
  }, 10000);
  satallite.sat.dy = 0;
  satallite.sat.dr = 3.14*Math.cos(6.28/92*(satallite.lifetime)); //23 frame period w/ range [-46, 46]
  satallite.lifetime++;
}

function satSwitch(){
  satallite.lifetime = 0;
  satallite.sat.y = -32;
  satallite.sat.rot = 0;
  satallite.sat.dr = 0;
  satallite.sat.x = ((Math.floor(Math.random()*3)+1) * 160) - 120; //(1,40), (2,200), (3, 360)
}

function beamInteract(){
    if(satallite.orb.isTouching(player.sprite)){
      player.sprite.dx -= (player.sprite.dx*0.5)-satallite.orb.dx*0.15;
      player.sprite.dy -= player.sprite.dy*0.5-satallite.orb.dy*0.15;
  }
  if(satallite.orb.isTouching(missile.sprite)){
    missile.sprite.dx *= 1.25;
    missile.sprite.dx *= 1.25;
  }
  for(let rockInx = 0;rockInx<rock.length;rockInx++){
    if(satallite.orb.isTouching(rock.sprites[rockInx])){
      rock.sprites[rockInx].dx += satallite.orb.dx*0.1;
      rock.sprites[rockInx].dy += satallite.orb.dy*0.1;
    }
  }
}

function updatePlayerPowerUp(){
  if(game.combo >= 9){
    player.isPowered = true;
    player.sprite.setAnimation("copter/img/copterPowered.png", 220, 170, 3);
  }
  if(game.combo <= 0){
    player.isPowered = false;
    player.sprite.setAnimation("copter/img/copter.png", 180, 130, 4);
    game.combo = 0;
 }
}

function enemyExplosionReset(){
  if(touchingExplosion(missile.sprite)){
    missileSpawn(750);
  }
  for(let rockInx = 0;rockInx<rock.density;rockInx++){
    if(touchingExplosion(rock.sprites[rockInx])){
     rock.sprites[rockInx].y = Math.floor(Math.random() * 101)-250;
     rock.sprites[rockInx].x = Math.floor(Math.random() * 101)-250;
     rockThrow(rockInx);
  }
 }

 function touchingExplosion(sprite){ //fix
  for(let inx = 0; inx<game.explosionList.length; inx++){
    if(sprite.isTouching(game.explosionList[inx])){
      return true;
    }
  }

  return false;
 }

 if(touchingExplosion(satallite.orb)){
   satallite.orb.dx /= 1.25;
   satallite.orb.dy /= 1.25;
   for(let expInx = 0;expInx<game.explosionList.length;expInx++){
   if(game.explosionList[expInx].isTouching(satallite.orb)){
     game.explosionList[expInx].dx += satallite.orb.dy;
     game.explosionList[expInx].dy += satallite.orb.dx;
   }
  }
 }
 if(touchingExplosion(satallite.sat)){
   satSwitch();
 }
}

function changeTip(){
  switch(Math.floor(Math.random() * 5)){
    case 0:
    tip = "Evasive maneuvers! Hitting  9  targets"+
    " in a  row  without  getting  hit  gives  you  an  overshield!\nPress V to start.";
  
  break;
    case 1:
    tip = "Charge! hit  100  targets  in"+
    "  blitz  mode  to  win! Press V to start.";
  break;
    case 2:
    tip = "Explosion! Hitting  a  target  creates  an  explosion  that  can  break  obstacles. Press V to start.";
  break;
    case 3:
    tip = "Turning up the heat! Use  the  number  keys  to  toggle  specific  enemies  in  practice! Press V to start.";
  break;
    case 4:
    tip = "Danger zone! moving upwards is very slow, make sure to stay out of the redbox! Press V to start.";
  break;
  }
  return tip;
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

//the funct that controls the missile tracker
function trackerFunct(){
  //position
  missile.tracker.x = missile.sprite.x;
  missile.tracker.x = Math.max(50, missile.tracker.x);
  missile.tracker.x = Math.min(350, missile.tracker.x);
    
  missile.tracker.y = missile.sprite.y;
  missile.tracker.y = Math.max(50, missile.tracker.y);
  missile.tracker.y = Math.min(350, missile.tracker.y);

  //rotation
  switch(missile.sprite.x-missile.tracker.x < 0){
    case true:
   missile.tracker.rot = (Math.atan((missile.sprite.y-missile.tracker.y)/(missile.sprite.x-missile.tracker.x))*180/Math.PI)-90;
   break;
    case false:
   missile.tracker.rot = (Math.atan((missile.sprite.y-missile.tracker.y)/(missile.sprite.x-missile.tracker.x))*180/Math.PI)-270;
   break;
  }
 }

 //checks the reset conditions then handles them
function checkReset(){
  if(keyLogic.keyWentDown('v')){
    game.menu = true;
    player.isAlive = true;
    game.combo = 0;
  }
  if(game.mode != 2){
    return;
  }
  if(game.blitzBlind == 0){
    game.menu = true;
    player.isAlive = true;
    game.combo = 0;
  }
}

function menuSelect(){
    if(keyLogic.keyWentDown("ArrowDown")){
        game.mode--;
        if(game.mode < 0){
            game.mode = 2;
        }
    }
    if(keyLogic.keyWentDown("ArrowUp")){
        game.mode++;
        if(game.mode > 2){
            game.mode = 0;
        }
    }

    if(keyLogic.keyWentDown(" ") && game.menu){
        game.menu = false;
    }
    
}

function checkHit(){
  if(player.sprite.isTouching(game.target) && keyLogic.keyWentDown('e')){
    createExplosion(game.target.x,game.target.y);
    game.target.x = Math.floor(Math.random() * 361)+20;
    game.target.y = Math.floor(Math.random() * 241)+20;
    game.blitzBlind--;
    if(!game.menu && !player.isPowered){
        game.combo++;
    }
  }
}

function tanh(x){
  return (Math.pow(2.71828183,2*x)-1)/(Math.pow(2.71828183,2*x)+1);
}
//s#2

function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var inx = 1; inx < words.length; inx++) {
      var word = words[inx];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}