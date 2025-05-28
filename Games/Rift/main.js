//libraries
const keyLogic = document.keyLogic;
const spriteLogic = document.spriteLogic;
const canvas = document.getElementById("channel").getContext("2d");

//game data
var game = {
    //meta data
    inlevel: false, //in the library or the level
    score: 0, 

    //display
    healthSprite: spriteLogic.createSprite(50, 25), //display for health


    //environment
    ground: [spriteLogic.createSprite(200,365), spriteLogic.createSprite(600,364)], //ground
    walls: [spriteLogic.createSprite(200,200), spriteLogic.createSprite(600,200)], //background
    portal: spriteLogic.createSprite(330,290)
};
game.healthSprite.animationLogic.speed = 0;
game.healthSprite.setAnimation("Rift/img/health.png", 44, 20, 10);
game.portal.setAnimation("Rift/img/portal.png", 88, 160, 8);
game.portal.animationLogic.speed = 4;

game.ground.forEach((e) => {
    e.setAnimation("Rift/img/floor.png", 400, 90, 1);
});

var level = { //the current level blueprint
    walls: [],
    plat: [],
    fire: [],
    book: spriteLogic.createSprite(200,500),
    enemies: [],
    boss: spriteLogic.createSprite(-400, 300),
    bossIsActive: false
}
level.boss.setAnimation("Rift/img/corrupted_slime.png", 290, 220, 2)
level.boss.animationLogic.speed = 1;
level.book.setAnimation("Rift/img/grimoire.png", 36, 60, 4);
level.book.animationLogic.speed = 1.5;

var player = {
    sprite: spriteLogic.createSprite(200,310),
    hasJumped: true,
    health: 100
}

player.sprite.setAnimation("Rift/img/bell.png", 112, 192, 4);
player.sprite.animationLogic.speed = 2;

function draw() {
    //pre-sprite display
        //background
    canvas.fillStyle = "tan";
    canvas.fillRect(0, 0, 400, 400);
        //divider
    canvas.fillStyle = "crimson";
    canvas.fillRect(-5, 63, 405, 67);

        //health backdrop
    canvas.fillStyle = "black";
    canvas.fillRect((game.inLevel ? 83:88), 15, 44, 20);
        //scoreboard
    canvas.fillStyle = "black";
    canvas.font = "20px pixel";
    canvas.fillText("Health: ", 10, 30);
    canvas.fillText("Grimoires: " + game.score, 10, 50);
    game.healthSprite.x = (game.inLevel ? player.sprite.x - 95:110);
    if((player.health+1)%10 == 0){
        player.health -= 1;
        game.healthSprite.animationLogic.runAnimation();
    }

    //motion
    gravity();
    controls();

    if(!game.inLevel){
        game.portal.y = 290;
        game.walls.forEach(e => {
            e.dx = 0;
        });

        game.ground.forEach(e => {
            e.dx = 0;
        });
        game.walls[0].setAnimation("Rift/img/study.png", 400, 264, 1);
        level.book.x = 500;
        level.book.dx = 0;
        canvas.font = "20px pixel";
        canvas.fillStyle = "red";
        canvas.fillText("press Enter over the portal to start", 140, 30, 200);
        level.boss.visible = false;
        level.bossIsActive = false;
        canvas.save();
        canvas.translate(0, 0);
        study();
    }else{
        game.portal.y = 590;
        game.walls.forEach(e => {
            e.setAnimation("Rift/img/dungeon.png", 400, 264, 1);
        });

        relativeVel(); //handles the relative velocity of the world
        handleObstacles(); //call all main enemy functions

        if(player.sprite.isTouching(level.book)){
            game.inLevel = false;
            player.sprite.x = 200;
            player.sprite.y = 310;
            game.score++;
        }

        canvas.save();
        canvas.translate(-(player.sprite.x-200), 0);
    }

  // DRAW SPRITES
  spriteLogic.draw("channel");
  

  // if health runs out
  // show Game over
  if (player.health <= 0) {
    game.inlevel = false;
    canvas.fillStyle = "black";
    canvas.fillRect(0,0,400,400);
    canvas.fillStyle = "green";
    canvas.font = "50px pixel";
    canvas.fillText("Game Over!" , 75, 200);
    canvas.font = "17px pixel";
    canvas.fillText("the corruption is still unslain!" ,  105, 215);
    player.sprite.x = 200;
  }else if(keyLogic.keyWentDown("Enter") && player.sprite.isTouching(game.portal)){
   levelSelect(game.score+1); 
  }

  canvas.restore();
  requestAnimationFrame(draw);
}

draw();

function handleObstacles(){
    enemyMain();
    fireMain();
    if(player.sprite.isTouching(level.boss)){
        player.health -= 1;
    } 
}

function relativeVel(){
    level.book.dx = -(player.sprite.dx);

    //objects relative velocity
    level.walls.forEach((e) => {
        e.dx = -player.sprite.dx;
    });
    level.plat.forEach((e) => {
        e.dx = -player.sprite.dx;
    });

    //enemies relative velocity
    level.enemies.forEach((e) => {
        e.dx -= player.sprite.dx; //subtract bc we expect dx != 0
    });
    
    for(let inx = 0; inx <= 1;inx++){
        //relative velocity for the environment
        game.walls[inx].dx = -player.sprite.dx;
        game.ground[inx].dx = -player.sprite.dx;
        
        //recycle the same 4 sprites as environment
        if(game.walls[inx].x <= player.sprite.x - 400){//push left -> right
            game.walls[inx].x = game.walls[Math.abs(inx-1)].x + 400;
            game.ground[inx].x = game.walls[Math.abs(inx-1)].x + 400;
        }else if(game.walls[inx].x >= player.sprite.x + 400){//push right -> left
            game.walls[inx].x = game.walls[Math.abs(inx-1)].x - 400;
            game.ground[inx].x = game.walls[Math.abs(inx-1)].x - 400;  
        }
    }
}

function controls(){

    if(keyLogic.keyDown('d')){ //d = left
        player.sprite.dx = 5;
        player.sprite.width = -112;
         //make the sprite turn
    }else if(keyLogic.keyDown('a')){//a = right
        player.sprite.width = 112;
        player.sprite.dx = -5;
    }else{
        player.sprite.dx = 0;
    }

    //Space
    if(keyLogic.keyDown(" ") && !hasJumped){
        player.sprite.dy  = -17;
        hasJumped = true;
    }

    //blockadephys
    for(var i=0;i<level.walls.length;i++){
        collide(player.sprite, level.walls[i]);
    }
}
function gravity(){
    player.sprite.dy += (keyLogic.keyDown(" ") ? 0.75:1);
    player.sprite.y += player.sprite.dy;
    if(player.sprite.y >= 310){
        player.sprite.y -= player.sprite.dy;
        player.sprite.dy = 0;
        hasJumped = false;
    }
    player.sprite.y -= player.sprite.dy;
    //platforms
    platMain();
}

function platMain(){
    if(!game.inLevel){
        return;
    }

    for(var platInx = 0;platInx < level.plat.length;platInx++){
        player.sprite.y += player.sprite.dy;
        switch(level.plat[platInx].type){
            case "floor":
                level.plat[platInx].setAnimation("Rift/img/activated_sigil.png", 156, 48, 1);
                if(player.sprite.isTouching(level.plat[platInx])){
                    player.sprite.y -= player.sprite.dy;
                    player.sprite.dy = 0;
                    hasJumped = false;
                }
                return;
            case "roof":
                level.plat[platInx].setAnimation("Rift/img/inverted_sigil.png", 156, 48, 1);
                if(player.sprite.isTouching(level.plat[platInx])){
                    player.sprite.y -= player.sprite.dy;
                    player.sprite.dy = 0;
                }
                return;
        }
        player.sprite.y -= player.sprite.dy;
    }
}


function enemyMain(){
  //enemy interations
    //chase player
      //boss
    level.boss.dx = (level.bossIsActive ? 4.5:0);

      //basic
    for(var enmInx = 0;enmInx < level.enemies.length;enmInx++){
        if(level.enemies[enmInx].x < player.sprite.x){
            level.enemies[enmInx].dx = 2;
            level.enemies[enmInx].width = -120; //make the sprite turn
        }else if(level.enemies[enmInx].x > player.sprite.x){
            level.enemies[enmInx].dx = -2; 
            level.enemies[enmInx].width = 120;
        }

        //blockadePhys
        for(var blocInx = 0;blocInx < level.walls.length;blocInx++){
            if(!collide(level.enemies[enmInx], level.walls[blocInx], -player.sprite.dx)){
                continue;
            }

            //make the sprite turn
            level.enemies[enmInx].width = -level.enemies[enmInx].width;
            
        }    
        //attack player
        if(player.sprite.isTouching(level.enemies[enmInx])){
            player.health--;
        } 
    }
}


function fireMain(){
  for(var Inx = 0; Inx<level.fire.length;Inx++){
    level.fire[Inx].dx = -(player.sprite.dx);
  }
}

function levelSelect(level){
  switch(level){
  case 0:
  lvl0();  
    break;
  case 1:
  lvl1();
    break;
  case 2:
  lvl2();
    break;
  case 3:
  lvl3();
    break;
  default:
  if(keyLogic.keyDown('1')){
    lvl0();
  }else if(keyLogic.keyDown('2')){
    lvl1();
  }else if(keyLogic.keyDown('3')){
    lvl2();
  }else{
    levelSelect(randomNumber(0,3));
  }
    break;
  }
}

function study(){
    game.walls[0].x = 200;
    game.walls[1].x = 600;
    game.ground[0].x = 200;
    game.ground[1].x = 600;
    killSpriteList(level.walls);
    level.walls = [];
    killSpriteList(level.plat);
    level.plat = [];
    killSpriteList(level.enemies);
    level.enemies = [];
}

function bookfunct(x,y){
  level.book.x = x;
  level.book.y = y;
}

function createWall(x, y, isTall){
    let inx = level.walls.length;
    level.walls.push(spriteLogic.createSprite(200,200));
    level.walls[inx].x = x;
    level.walls[inx].y = y;
    level.walls[inx].setAnimation("Rift/img/" + (isTall ? "barrier":"blockade") + ".png", 64, (isTall ? 480:240), 1);
}

function createPlatform(x, y, type){
    let inx = level.plat.length;
    level.plat.push(spriteLogic.createSprite(300,310));
    level.plat[inx].type = "";
    level.plat[inx].x = x;
    level.plat[inx].y = y;
    level.plat[inx].type = type;
}

function createFire(x, y){
    level.fire.add(spriteLogic.createSprite(x, y));
    level.fire[level.fire.length-1].setAnimation("Rift/img/fire.png", 102, 30, 4);
}

function createEnemy(x, y){
    let inx = level.enemies.length;
    level.enemies.push(spriteLogic.createSprite(200,200));
    level.enemies[inx].setAnimation("Rift/img/corrupted.png");
    level.enemies[inx].boundingBoxType = "circle";
    level.enemies[inx].x = x;
    level.enemies[inx].y = y;
}

function lvl0(){
    //player
player.sprite.x = 200;
    //grimoire
bookfunct(2180, 170);
    //enemies
createEnemy(580, 310);
createEnemy(1880, 310);
createEnemy(2180, 310);
    //blockades
createWall(0, 280, true);
createWall(485, 330, false);
createWall(1085, 330, false);
createWall(1380, 85, false);
createWall(1580, 360, false);
createWall(2280, 280, true);
    //platforms
createPlatform(400, 280, "floor");
createPlatform(785, 278, "floor");
createPlatform(1880, 260, "floor");
createPlatform(2180, 260, "floor");
createPlatform(1480, 310, "floor");
game.inLevel = true;
}

function lvl1(){
    //player
player.sprite.x = 200;
    //grimoire
bookfunct(3600,310);
    //enemies
createEnemy(1000, 313);
createEnemy(2000, 313);
createEnemy(2800, 313);
createEnemy(3400, 313);
    //blockades
createWall(0, 280, true);
createWall(485, 330, false);
createWall(3800, 280, true);
    //platforms
createPlatform(400, 280, "floor");
createPlatform(1200, 278, "floor");
createPlatform(2000, 278, "floor");
createPlatform(2800, 278, "floor");
game.inLevel = true;
}

function lvl2(){
    //player
player.sprite.x = 200;
level.boss.visible = true;
level.bossIsActive = true;
    //grimoire
bookfunct(3400,280);
    //blockades
createWall(0,0,280,false,"wall_1");
createWall(1,450,75,false,"wall");
createWall(2,1250,380,false,"wall");
createWall(3,2050,380,false,"wall");
createWall(4,2850,380,false,"wall");
createWall(5,3650,380,false,"wall_1");
    //platforms
game.inLevel = true;
}

function lvl3(){
    //player
player.sprite.x = 200;
    //grimoire
bookfunct(3400,10);
    //enemies
    //blockades
createWall(0,0,280,false,"wall_1");
createWall(1,3650,380,false,"wall_1");
createWall(2,500,380,false,"wall");
    //platforms
createPlatform(0,3450,300,false,false);
createPlatform(1,655,300,true,true);
    //magicBooks
magicBookFunct2(0,655,230);
    //fires
game.inLevel = true;
}

function collide(sprite, target, speed=0){
    sprite.x += sprite.dx;
    if(!sprite.isTouching(target)){
        sprite.x -= sprite.dx;
        return false;
    }

    sprite.x -= sprite.dx;
    sprite.dx = -speed;
    return true;
}

function killSpriteList(arr){
    arr.forEach((e) => {
        e.kill();
    });
}