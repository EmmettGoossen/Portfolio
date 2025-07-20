function setCopter(){
channel = {
// GAME SETUP
  //world
  game: {
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
    target: spriteLogic.createSprite(147,35),

    //display
    title: spriteLogic.createSprite(200,45),
    tip: "press E to shoot the target.\nhold SPACE to float."+
  " W and space will let you go up. A and D let you go left and"+
  " right. When you're ready press V to start.\nT to change tip"
  },

  //player
  player: {
    sprite: spriteLogic.createSprite(200, 100),
    isAlive: true, //if the player is alive
    isPowered: false //if the player has the power-up
  },

  missile: {
    sprite: spriteLogic.createSprite(430,Math.floor(Math.random()*361)+20),
    tracker: spriteLogic.createSprite(430,430),
    respawn: true //wether missile is allowed to respawn
  },

  rock: {
  sprites: [],
  density: 2 //number of rocks active
  },

  satallite: {
    orb: spriteLogic.createSprite(-10,1000),
    sat: spriteLogic.createSprite(360,25),
    lifetime: 0
  },

  setUp: function(){
    //background
    channel.game.background.setAnimation("copter/img/background.png", 400, 400, 3);
    channel.game.background.animationLogic.speed = 10;
    channel.game.target.setAnimation("copter/img/target.png", 72, 72, 2);
    channel.game.target.animationLogic.speed = 4;
    channel.game.target.scale = 0.9;
    
    //title
    channel.game.title.animationLogic.speed = 3;
    channel.game.title.setAnimation("copter/img/title.png", 350, 78, 3);

    //player
    channel.player.sprite.setAnimation("copter/img/copter.png", 180, 130, 4);
    channel.player.sprite.scale = 0.6;
    channel.player.sprite.boundingBoxType = "circle";

    //missile
    channel.missile.sprite.setAnimation("copter/img/missile.png", 76, 28, 1);
    channel.missile.sprite.scale = 0.75;
    channel.missile.tracker.setAnimation("copter/img/tracker.png", 32, 32,2);
    channel.missile.tracker.animationLogic.speed = 2;
    channel.missile.tracker.scale = 0.6;

    //rocks
    channel.rock.sprites.push(spriteLogic.createSprite(900,500));
    channel.rock.sprites.push(spriteLogic.createSprite(900,500));
    channel.rock.sprites.push(spriteLogic.createSprite(720,920));  
    channel.rock.sprites.forEach((e) => {
      e.setAnimation("copter/img/debris.png", 70, 55, 1);
    });
    channel.rock.sprites.forEach((e) => {
      e.dr = 13;
    });

    //satalite
    channel.satallite.sat.setAnimation("copter/img/sat.png", 160, 55, 1);
    channel.satallite.sat.boundingBoxType = 'circle';
    channel.satallite.orb.setAnimation("copter/img/orb.png", 64, 64, 3);
    channel.satallite.orb.boundingBoxType = 'circle';
    channel.satallite.orb.scale = 0.75;
  },

//s#3
  draw: function() {
    
    canvas.fillStyle = "#ff6200";
    canvas.fillRect(0,0,400,400);

    channel.checkReset(); //for reset conditions
    if(channel.game.menu){ //run menu
      channel.checkHit(); //legacy easter egg
      channel.clearExplosions();
      channel.menuSelect();
      channel.resetVals();
    }else{ //run game
      channel.gameRun();
    }
    // LOOPING
  //obstacles
  //controls
    
    // DRAW SPRITES
    spriteLogic.draw("channel");

    //these are things we want to draw over sprites
    if(channel.game.menu){
      canvas.font = "40px pixel";

      //highlight the current selection
      let pClr; //color of the play button
      let survival = '#b3b3b3';
      let blitz = "#b3b3b3";
      let tClr; //color of the tutorial button
      switch(channel.game.mode){
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
      switch(channel.game.mode){
          case 1:
            canvas.fillText("time: " + channel.game.score,15,20);
        break;
          case 2:
            canvas.fillText("hits: "+(100-channel.game.blitzBlind),15,20);
        break;
      }
      channel.killPlayer(); //checks if player is dead then handles it
    }
    document.drawLoop = requestAnimationFrame(channel.draw);
  },


  killPlayer: function(){
      if(channel.game.mode == 0){
        //respawn player in tutorial
          //handle x pos
        if(channel.player.sprite.x < -75){
          channel.player.sprite.x = 450;
        }else if(channel.player.sprite.x > 475){
         channel.player.sprite.x = -50;    
        }

            //handle y pos
        if(channel.player.sprite.y < -75){
          channel.player.sprite.y = 425;
        }else if(channel.player.sprite.y > 475){
          channel.player.sprite.y = -20;    
        }
        return;
      }
      if (channel.player.sprite.x < -50 || channel.player.sprite.x > 475 || channel.player.sprite.y < -75 || channel.player.sprite.y > 475){
        canvas.fillStyle = "black";
        canvas.fillRect(0,0,400,400);
        canvas.font = "50px pixel";
        canvas.fillStyle = "green";
        canvas.fillText("Game Over!", 50, 200);
        canvas.font = "15px pixel";
        canvas.fillText("press v to restart", 75, 220);
        switch(channel.game.mode){
          case false:
            canvas.fillText("time: " + channel.game.score,75,235);
            break;
          case true:
            canvas.fillText("hits: "+(100-channel.game.blitzBlind),75,235);
            break;
        }
        channel.player.isAlive = false;
      }
  },

  createExplosion: function(x,y){
    channel.game.explosionList.push(spriteLogic.createSprite(x,y));
    channel.game.explosionList[channel.game.explosionList.length-1].setAnimation("copter/img/boom.png", 96, 96, 9);
    channel.game.explosionList[channel.game.explosionList.length-1].animationLogic.speed = 16;
    channel.game.explosionList[channel.game.explosionList.length-1].lifetime = 36;
    channel.game.explosionList[channel.game.explosionList.length-1].boundingBoxType = "circle";
  },

  movement: function(){
    // PLAYER CONTROLS
    //upwards(space & W)
    switch(keyLogic.keyDown(" ")){
      case true:
        if(channel.player.sprite.dy > 0){ // decelerate on space
          channel.player.sprite.dy -= keyLogic.keyDown('w') ? 1.25:0.25; //decelerate fast when w pressed
          break;
        }
        channel.player.sprite.dy = keyLogic.keyDown('w') ? -5:0; //if w pressed, ascend
        break;
      case false:
        if(channel.game.mode == 0 && channel.player.sprite.y >= 342){ // add floor to tutorial
          channel.player.sprite.dy = 0;
          break;
        }
        channel.player.sprite.dy += 1;
        break;
    }

    if(keyLogic.keyDown("a")){// a = left
      channel.player.sprite.dx -= 0.35;
      channel.player.sprite.rot =-20;
    }else if(keyLogic.keyDown("d")){// d = right
      channel.player.sprite.dx += 0.35;  
      channel.player.sprite.rot =20;
    }else{
      channel.player.sprite.rot = 0;
    }
  },

//main missile funct, responsible for missile traking, detonating and spawning at the right time.
  missileMain: function(){
    channel.missile.tracker.visible = true;
    channel.trackerFunct();

    if(!channel.missile.respawn){//exit when missile cooldown
      return;
    }

  //rotation
    channel.missile.sprite.rot = (Math.atan2(channel.missile.sprite.dy, channel.missile.sprite.dx)*180/3.14);
  
  //handle tracking
    if(channel.player.sprite.x > channel.missile.sprite.x){
      channel.missile.sprite.dx += 0.22;
      channel.missile.sprite.dx = Math.min(10,channel.missile.sprite.dx); //clamp horizontal
    }else if(channel.player.sprite.x < channel.missile.sprite.x){
      channel.missile.sprite.dx -= 0.45; 
      channel.missile.sprite.dx = Math.max(-10,channel.missile.sprite.dx); //clamp horizontal
    }

    if(channel.player.sprite.y > channel.missile.sprite.y){
      channel.missile.sprite.dy += 0.22;
    }else if(channel.player.sprite.y < channel.missile.sprite.y){
      channel.missile.sprite.dy -= 0.22; 
    }

    if(((channel.missile.sprite.x < -350 || channel.missile.sprite.x > 750) || ( channel.missile.sprite.y < -350 || channel.missile.sprite.y > 750))){
      channel.missileSpawn(750);
    }
    if(channel.player.sprite.isTouching(channel.missile.sprite)){
      if(!channel.player.isPowered){
        channel.player.sprite.dx = (channel.missile.sprite.dx/1.25) +6;
        channel.game.combo = 0;
      }else{
        channel.game.combo -= 3;  
      }

      channel.missileSpawn(750);
      channel.missile.respawn = false;
      setTimeout(()=>{
        channel.missile.respawn = true;
      }, 1500);
    }
  },

//funct that respawns the missile when called
  missileSpawn: function(x){
    channel.missile.sprite.x = x;
    channel.missile.sprite.y = Math.floor(Math.random()*51)+75;
    channel.missile.sprite.dy = 0;
    channel.missile.sprite.dx = 0;
  },

  resetVals: function(){
    channel.game.tip = "press E to shoot the target.\nhold SPACE to float."+
          " W and space will let you go up. A and D let you go left and"+
          " right. When you're ready press V to start.\nT to change tip";
    channel.game.enemiesAreReady = [false,false,false,false,false];
    channel.missile.respawn = true;
    channel.game.blitzBlind = 100;
    channel.game.time = Date.now()/1000;
    channel.game.background.visible = true;
    channel.player.sprite.x = 200;
    channel.player.sprite.y = 100;
    channel.player.sprite.rot = 0;
    channel.player.sprite.dy = 0;
    channel.player.sprite.dx = 0;
    channel.game.title.visible = true;
    channel.game.target.x = 147;  
    channel.game.target.y = 50;
    channel.satallite.sat.y = -32;
    channel.satallite.sat.dy = 0;
    channel.satallite.sat.dr = 0;
    channel.satallite.sat.rot = 0;
    channel.rock.density = 2;
    channel.missile.tracker.visible = false;
  },

  gameRun: function(){
    channel.game.title.visible = false;
    channel.game.target.scale = 1;
    channel.missile.sprite.rotateToDirection = true;

    if(channel.player.isAlive){
      channel.movement();
      channel.game.score = Math.floor(Date.now()/1000 - channel.game.time);
    }
    
    channel.spawnEnemies();
//s#1
  //handle explosions
    channel.checkHit();
    channel.enemyExplosionReset();
    channel.updatePlayerPowerUp();
    channel.clearExplosions();

    if(channel.game.mode == 0){
      channel.game.background.visible = false;
      canvas.strokeStyle = "#ff7824";
      canvas.lineWidth = 15;
      canvas.strokeRect(25,25,350,350);
      canvas.lineWidth = 5;
      canvas.strokeStyle = "#ff0000";
      canvas.strokeRect(5,250,390,145);

      canvas.fillStyle = "#091b3e";
      canvas.font = "15px pixel";
      let inx = 0;
      channel.getLines(canvas, keyLogic.keyWentDown('t') ? channel.changeTip():channel.game.tip,400).forEach((e) => {
        canvas.fillText(e,5,15+inx*15);
        inx++;
      });
    }
  },

//handles spawning in tutorial and base
  spawnEnemies: function(){
    if(channel.game.mode == 0){
      for(let inx = 0;inx<channel.game.enemiesAreReady.length;inx++){
        if(keyLogic.keyWentDown((inx+1)+"")){
          channel.game.enemiesAreReady[inx] = !channel.game.enemiesAreReady[inx];
        }
      }
      if(channel.game.enemiesAreReady[0]){
        channel.rockMain();
        channel.rock.density = 3;
      }
      channel.missile.tracker.visible = channel.game.enemiesAreReady[1];
      if(channel.game.enemiesAreReady[1]){
        channel.missileMain();
      }
      if(channel.game.enemiesAreReady[2]){
        channel.satMain();
      }else{
        channel.satallite.sat.y = -32;
        channel.satallite.sat.rot = 0;
        channel.satallite.sat.dr = 0;
      }
      return;
    }

    channel.rockMain();
    if(Date.now()/1000 - channel.game.time >= 60){
      channel.missileMain();
    }
    if(Date.now()/1000 - channel.game.time >= 90){
      channel.rock.density = 3;
    }
    if(Date.now()/1000 - channel.game.time >= 120){
      channel.satMain();
    }
  },

  clearExplosions: function(){
    for(let inx = 0; inx < channel.game.explosionList.length;inx++){
      if(channel.game.explosionList[inx].dead == false){
        continue;
      }
      channel.game.explosionList.splice(inx);
    }
  },

  rockMain: function(){
    for(let rockInx = 0; rockInx < channel.rock.density;rockInx++){
      if(channel.rock.sprites[rockInx].x >= 700 || channel.rock.sprites[rockInx].y >= 900){
        channel.rock.sprites[rockInx].y = -150;
        channel.rock.sprites[rockInx].x = -150;
        channel.rockThrow(rockInx);
      }
      if(channel.player.sprite.isTouching(channel.rock.sprites[rockInx])){
        if(!channel.player.isPowered){
          channel.player.sprite.dy = (channel.rock.sprites[rockInx].dy*1.5)+13;
          channel.player.sprite.dx = (channel.rock.sprites[rockInx].dx)+2;
          channel.game.combo = 0;
        }else{
          channel.game.combo -= 3; 
        }
      channel.rock.sprites[rockInx].y = Math.floor(Math.random() * 101)-250;
      channel.rock.sprites[rockInx].x = Math.floor(Math.random() * 101)-250;
      channel.rockThrow(rockInx);
      }
    } 
  },

  rockThrow: function(inx){
    channel.rock.sprites[inx].dy = channel.sigmoid(channel.player.sprite.y/30)*(Math.floor(Math.random() * 6)+4)/2;
    channel.rock.sprites[inx].dx = channel.sigmoid(channel.player.sprite.x/30)*(Math.floor(Math.random() * 6)+4)/2;
  },

  satMain: function(){
    if(channel.satSpawn()){
      channel.satShoot();
      channel.animateSat();
    }
    channel.beamInteract();
    if(channel.satallite.lifetime >= 1300){
      channel.satSwitch();
    }
  },

  satShoot: function(){
    channel.satallite.orb.dx += Math.tanh((channel.player.sprite.x-channel.satallite.orb.x)/50)*0.20;
    channel.satallite.orb.dx = Math.min(channel.satallite.orb.dx,8);
    channel.satallite.orb.dx = Math.max(channel.satallite.orb.dx,-8);
    channel.satallite.orb.dy += 0.05+Math.tanh((channel.player.sprite.y-channel.satallite.orb.y)/125)/20;
    if(channel.satallite.orb.y >= 450 || channel.satallite.orb.x <= -50){
      channel.satallite.orb.dy = (Math.tanh((channel.satallite.orb.y-channel.satallite.sat.y)/50)*2);
      channel.satallite.orb.dx = (Math.tanh((channel.satallite.orb.x-channel.satallite.sat.x)/50)*2);
      channel.satallite.orb.y = channel.satallite.sat.y;
      channel.satallite.orb.x = channel.satallite.sat.x;
    }
  },

  satSpawn: function(){
    if(channel.satallite.sat.y != 25){
      channel.satallite.sat.dy = 3;
      return false;
    }
    return true;
  },

  animateSat: function(){
    channel.satallite.sat.dy = 0;
    channel.satallite.sat.dr = 3.14*Math.cos(6.28/92*(channel.satallite.lifetime)); //23 frame period w/ range [-46, 46]
    channel.satallite.lifetime++;
  },

  satSwitch: function(){
    channel.satallite.lifetime = 0;
    channel.satallite.sat.y = -32;
    channel.satallite.sat.rot = 0;
    channel.satallite.sat.dr = 0;
    channel.satallite.sat.x = ((Math.floor(Math.random()*3)+1) * 160) - 120; //(1,40), (2,200), (3, 360)
  },

  beamInteract: function(){
    if(channel.satallite.orb.isTouching(channel.player.sprite)){
      channel.player.sprite.dx /= 1.25;
      channel.player.sprite.dy /= 1.1;
    }
    if(channel.satallite.orb.isTouching(channel.missile.sprite)){
      channel.missile.sprite.dx *= 1.25;
      channel.missile.sprite.dy *= 1.25;
    }
    for(let rockInx = 0; rockInx<channel.rock.length;rockInx++){
      if(channel.satallite.orb.isTouching(channel.rock.sprites[rockInx])){
        channel.rock.sprites[rockInx].dx += channel.satallite.orb.dx;
        channel.rock.sprites[rockInx].dy += channel.satallite.orb.dy;
      }
    }
    if(channel.touchingExplosion(channel.satallite.orb)){
      channel.satallite.orb.dx /= 1.25;
      channel.satallite.orb.dy /= 1.25;
      for(let expInx = 0;expInx<channel.game.explosionList.length;expInx++){
        if(channel.game.explosionList[expInx].isTouching(channel.satallite.orb)){
          channel.game.explosionList[expInx].dx += channel.satallite.orb.dy;
          channel.game.explosionList[expInx].dy += channel.satallite.orb.dx;
        }
      }
    }
  },

  updatePlayerPowerUp: function(){
    if(channel.game.combo >= 9){
      channel.player.isPowered = true;
      channel.player.sprite.setAnimation("copter/img/copterPowered.png", 220, 170, 3);
    }
    if(channel.game.combo <= 0){
      channel.player.isPowered = false;
      channel.player.sprite.setAnimation("copter/img/copter.png", 180, 130, 4);
      channel.game.combo = 0;
    }
  },

  enemyExplosionReset: function(){
    if(channel.touchingExplosion(channel.missile.sprite)){
      channel.missileSpawn(750);
    }
    for(let rockInx = 0;rockInx<channel.rock.density;rockInx++){
      if(channel.touchingExplosion(channel.rock.sprites[rockInx])){
        channel.rock.sprites[rockInx].y = Math.floor(Math.random() * 101)-250;
        channel.rock.sprites[rockInx].x = Math.floor(Math.random() * 101)-250;
        channel.rockThrow(rockInx);
      }
    }
    if(channel.touchingExplosion(channel.satallite.sat)){
      channel.satSwitch();
    }
  },

  touchingExplosion: function(sprite){ //fix
    
    for(let inx = 0; inx<channel.game.explosionList.length; inx++){
      if(sprite.isTouching(channel.game.explosionList[inx])){
        return true;
      }
    }

    return false;
  },

  changeTip: function(){
    switch(Math.floor(Math.random() * 5)){
      case 0:
      channel.game.tip = "Evasive maneuvers! Hitting  9  targets"+
      " in a  row  without  getting  hit  gives  you  an  overshield!\nPress V to start.";
      
    break;
      case 1:
      channel.game.tip = "Charge! hit  100  targets  in"+
      "  blitz  mode  to  win! Press V to start.";
    break;
      case 2:
      channel.game.tip = "Explosion! Hitting  a  target  creates  an  explosion  that  can  break  obstacles. Press V to start.";
    break;
      case 3:
      channel.game.tip = "Turning up the heat! Use  the  number  keys  to  toggle  specific  enemies  in  practice! Press V to start.";
    break;
      case 4:
      channel.game.tip = "Danger zone! moving upwards is very slow, make sure to stay out of the redbox! Press V to start.";
    break;
    }
    return channel.game.tip;
  },

  sigmoid: function(z) {
    return 1 / (1 + Math.exp(-z));
  },

//the funct that controls the missile tracker
  trackerFunct: function(){
  //position
    channel.missile.tracker.x = channel.missile.sprite.x;
    channel.missile.tracker.x = Math.max(50, channel.missile.tracker.x);
    channel.missile.tracker.x = Math.min(350, channel.missile.tracker.x);

    channel.missile.tracker.y = channel.missile.sprite.y;
    channel.missile.tracker.y = Math.max(50, channel.missile.tracker.y);
    channel.missile.tracker.y = Math.min(350, channel.missile.tracker.y);

    //rotation
    switch(channel.missile.sprite.x-channel.missile.tracker.x < 0){
      case true:
     channel.missile.tracker.rot = (Math.atan((channel.missile.sprite.y-channel.missile.tracker.y)/(channel.missile.sprite.x-channel.missile.tracker.x))*180/Math.PI)-90;
     break;
      case false:
     channel.missile.tracker.rot = (Math.atan((channel.missile.sprite.y-channel.missile.tracker.y)/(channel.missile.sprite.x-channel.missile.tracker.x))*180/Math.PI)-270;
     break;
    }
  },

 //checks the reset conditions then handles them
  checkReset: function(){
    if(keyLogic.keyWentDown('v')){
      channel.game.menu = true;
      channel.player.isAlive = true;
      channel.game.combo = 0;
    }

    if(channel.game.blitzBlind == 0 && channel.game.mode != 2){
      channel.game.menu = true;
      channel.player.isAlive = true;
      channel.game.combo = 0;
    }
  },

  menuSelect: function(){
    if(keyLogic.keyWentDown("ArrowDown")){
      channel.game.mode--;
      if(channel.game.mode < 0){
        channel.game.mode = 2;
      }
    }
    if(keyLogic.keyWentDown("ArrowUp")){
      channel.game.mode++;
      if(channel.game.mode > 2){
        channel.game.mode = 0;
      }
    }

    if(keyLogic.keyWentDown(" ") && channel.game.menu){
      channel.game.menu = false;
    }   
  },

  checkHit: function(){
    if(channel.player.sprite.isTouching(channel.game.target) && keyLogic.keyWentDown('e')){
      channel.createExplosion(channel.game.target.x,channel.game.target.y);
      channel.game.target.x = Math.floor(Math.random() * 361)+20;
      channel.game.target.y = Math.floor(Math.random() * 241)+20;
      channel.game.blitzBlind--;
      if(!channel.game.menu && !channel.player.isPowered){
        channel.game.combo++;
      }
    }
  },
//s#2

  getLines: function(ctx, text, maxWidth) {
    let words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let inx = 1; inx < words.length; inx++) {
      let word = words[inx];
      let width = ctx.measureText(currentLine + " " + word).width;
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
};
}
document.gameStart['copter/'] = setCopter;