function setRift(){
channel = {
    game: {
            inLevel: false,
            score: 0,
            healthSprite: spriteLogic.createSprite(50, 25),
            ground: [spriteLogic.createSprite(200,365), spriteLogic.createSprite(600,364)],
            walls: [spriteLogic.createSprite(200,200), spriteLogic.createSprite(600,200)],
            portal: spriteLogic.createSprite(330,290)
        },
    level: {
            walls: [],
            plat: [],
            fire: [],
            book: spriteLogic.createSprite(200,500),
            enemies: [],
            boss: spriteLogic.createSprite(-400, 300),
            bossIsActive: false
        },
    player: {
            sprite: spriteLogic.createSprite(200,310),
            hasJumped: true,
            health: 100
        },

    setUp: function() {
        channel.game.healthSprite.animationLogic.speed = 0;
        channel.game.healthSprite.setAnimation("Rift/img/health.png", 44, 20, 10);
        channel.game.portal.setAnimation("Rift/img/portal.png", 88, 160, 8);
        channel.game.portal.animationLogic.speed = 4;
        channel.game.ground.forEach((e) => {
            e.setAnimation("Rift/img/floor.png", 400, 90, 1);
        });

        channel.level.boss.setAnimation("Rift/img/corrupted_slime.png", 290, 220, 2);
        channel.level.boss.animationLogic.speed = 1;
        channel.level.boss.scale = 1.2;
        channel.level.book.setAnimation("Rift/img/grimoire.png", 36, 60, 4);
        channel.level.book.animationLogic.speed = 1.5;

        channel.player.sprite.setAnimation("Rift/img/bell.png", 112, 192, 4);
        channel.player.sprite.animationLogic.speed = 2;
    },

    draw: function() {

        canvas.fillStyle = "tan";
        canvas.fillRect(0, 0, 400, 400);

        canvas.fillStyle = "crimson";
        canvas.fillRect(-5, 63, 405, 67);

        canvas.fillStyle = "black";
        canvas.fillRect((channel.game.inLevel ? 83:88), 15, 44, 20);

        canvas.fillStyle = "black";
        canvas.font = "20px pixel";
        canvas.fillText("Health: ", 10, 30);
        canvas.fillText("Grimoires: " + channel.game.score, 10, 50);
        channel.game.healthSprite.x = (channel.game.inLevel ? channel.player.sprite.x - 95:110);
        if((channel.player.health+1)%10 == 0){
            channel.player.health -= 1;
            channel.game.healthSprite.animationLogic.runAnimation();
        }

        channel.gravity();
        channel.controls();

        if(!channel.game.inLevel){
            channel.game.portal.y = 290;
            channel.game.walls.forEach(e => { e.dx = 0; });
            channel.game.ground.forEach(e => { e.dx = 0; });
            channel.game.walls[0].setAnimation("Rift/img/study.png", 400, 264, 1);
            channel.level.book.x = 500;
            channel.level.book.dx = 0;
            canvas.font = "20px pixel";
            canvas.fillStyle = "red";
            canvas.fillText("press Enter over the portal to start", 140, 30, 200);
            channel.level.boss.visible = false;
            channel.level.bossIsActive = false;
            canvas.save();
            canvas.translate(0, 0);
            channel.study();
        }else{
            channel.game.portal.y = 590;
            channel.game.walls.forEach(e => {
                e.setAnimation("Rift/img/dungeon.png", 400, 264, 1);
            });

            channel.relativeVel();
            channel.handleObstacles();

            if(channel.player.sprite.isTouching(channel.level.book)){
                channel.game.inLevel = false;
                channel.player.sprite.x = 200;
                channel.player.sprite.y = 310;
                channel.game.score++;
            }

            canvas.save();
            canvas.translate(-(channel.player.sprite.x-200), 0);
        }

        spriteLogic.draw("channel");

        if (channel.player.health <= 0) {
            channel.game.inLevel = false;
            canvas.fillStyle = "black";
            canvas.fillRect(0,0,400,400);
            canvas.fillStyle = "green";
            canvas.font = "50px pixel";
            canvas.fillText("Game Over!" , 75, 200);
            canvas.font = "17px pixel";
            canvas.fillText("the corruption is still unslain!" ,  105, 215);
            channel.player.sprite.x = 200;
        }else if(keyLogic.keyDown("Enter") && channel.player.sprite.isTouching(channel.game.portal)){
            channel.levelSelect(channel.game.score); 
        }

        canvas.restore();
        document.drawLoop = requestAnimationFrame(channel.draw);
    },

    handleObstacles: function() {
        channel.enemyMain();
        channel.fireMain();
        if(channel.player.sprite.isTouching(channel.level.boss)){
            channel.player.health -= 1;
        } 
    },

    relativeVel: function() {
        channel.level.book.dx = -(channel.player.sprite.dx);

        channel.level.walls.forEach((e) => { e.dx = -channel.player.sprite.dx; });
        channel.level.plat.forEach((e) => { e.dx = -channel.player.sprite.dx; });

        channel.level.enemies.forEach((e) => {
            e.dx -= channel.player.sprite.dx;
        });
        
        for(let inx = 0; inx <= 1;inx++){
            channel.game.walls[inx].dx = -channel.player.sprite.dx;
            channel.game.ground[inx].dx = -channel.player.sprite.dx;
            
            if(channel.game.walls[inx].x <= channel.player.sprite.x - 400){
                channel.game.walls[inx].x = channel.game.walls[Math.abs(inx-1)].x + 400;
                channel.game.ground[inx].x = channel.game.walls[Math.abs(inx-1)].x + 400;
            } else if(channel.game.walls[inx].x >= channel.player.sprite.x + 400) {

                channel.game.walls[inx].x = channel.game.walls[Math.abs(inx-1)].x - 400;
                channel.game.ground[inx].x = channel.game.walls[Math.abs(inx-1)].x - 400;  
            }
        }
    },

    controls: function() {

        if(keyLogic.keyDown('d')) {
            channel.player.sprite.dx = 5;
            channel.player.sprite.width = -112;
        } else if(keyLogic.keyDown('a')) {
            channel.player.sprite.width = 112;
            channel.player.sprite.dx = -5;
        } else {
            channel.player.sprite.dx = 0;
        }

        if(keyLogic.keyDown(" ") && !channel.player.hasJumped) {
            channel.player.sprite.dy  = -25;
            channel.player.hasJumped = true;
        }

        for(let i = 0; i < channel.level.walls.length; i++) {
            channel.collide(channel.player.sprite, channel.level.walls[i]);
        }
    },

    gravity: function() {
        channel.player.sprite.dy += (keyLogic.keyDown(" ") ? 1.25 : 2.5);
        channel.player.sprite.y += channel.player.sprite.dy;

        if(channel.player.sprite.y >= 310) {
            channel.player.sprite.y -= channel.player.sprite.dy;
            channel.player.sprite.dy = 0;
            channel.player.hasJumped = false;
        }

        channel.player.sprite.y -= channel.player.sprite.dy;
        channel.platMain();
    },

    platMain: function() {

        if(!channel.game.inLevel) return;

        for(let platInx = 0; platInx < channel.level.plat.length; platInx++) {
            channel.player.sprite.y += channel.player.sprite.dy;
            switch(channel.level.plat[platInx].type) {
                case "floor":
                    channel.level.plat[platInx].setAnimation("Rift/img/activated_sigil.png", 156, 48, 1);
                    if(channel.player.sprite.isTouching(channel.level.plat[platInx])) {
                        console.log(platInx);
                        channel.player.sprite.y -= channel.player.sprite.dy;
                        channel.player.sprite.dy = 0;
                        channel.player.hasJumped = false;
                    }
                    channel.player.sprite.y -= channel.player.sprite.dy;
                    continue;
                case "roof":
                    channel.level.plat[platInx].setAnimation("Rift/img/inverted_sigil.png", 156, 48, 1);
                    if(channel.player.sprite.isTouching(channel.level.plat[platInx])) {
                        channel.player.sprite.y -= channel.player.sprite.dy;
                        channel.player.sprite.dy = 0;
                    }
                    channel.player.sprite.y -= channel.player.sprite.dy;
                    continue;
            }
        }
    },

    enemyMain: function() {
        channel.level.boss.dx = (channel.level.bossIsActive ? 4.5 : 0);

        for(let enmInx = 0; enmInx < channel.level.enemies.length; enmInx++) {
            if(channel.level.enemies[enmInx].x < channel.player.sprite.x) {
                channel.level.enemies[enmInx].dx = 2;
                channel.level.enemies[enmInx].width = -120;
            } else if(channel.level.enemies[enmInx].x > channel.player.sprite.x) {
                channel.level.enemies[enmInx].dx = -2;
                channel.level.enemies[enmInx].width = 120;
            }

            for(let blocInx = 0; blocInx < channel.level.walls.length; blocInx++) {
                if(!channel.collide(channel.level.enemies[enmInx], channel.level.walls[blocInx], -channel.player.sprite.dx)) {
                    continue;
                }
                channel.level.enemies[enmInx].width = -channel.level.enemies[enmInx].width;
            }

            if(channel.player.sprite.isTouching(channel.level.enemies[enmInx])) {
                channel.player.health--;
            }
        }
    },

    fireMain: function() {
        for(let Inx = 0; Inx < channel.level.fire.length; Inx++) {
            channel.level.fire[Inx].dx = -channel.player.sprite.dx;
        }
    },

    levelSelect: function(levelNum) {
        switch(levelNum) {
            case 0: channel.lvl0(); break;
            case 1: channel.lvl1(); break;
            case 2: channel.lvl2(); break;
            case 3: channel.lvl3(); break;
            default:
                if(keyLogic.keyDown('1')) {
                    channel.lvl0();
                } else if(keyLogic.keyDown('2')) {
                    channel.lvl1();
                } else if(keyLogic.keyDown('3')) {
                    channel.lvl2();
                } else {
                    channel.levelSelect(randomNumber(0,3));
                }
                break;
        }
    },

    study: function() {
        channel.game.walls[0].x = 200;
        channel.game.walls[1].x = 600;
        channel.game.ground[0].x = 200;
        channel.game.ground[1].x = 600;
        channel.killSpriteList(channel.level.walls);
        channel.level.walls = [];
        channel.killSpriteList(channel.level.plat);
        channel.level.plat = [];
        channel.killSpriteList(channel.level.enemies);
        channel.level.enemies = [];
    },

    bookfunct: function(x, y) {
        channel.level.book.x = x;
        channel.level.book.y = y;
    },

    createWall: function(x, y, isTall) {
        let inx = channel.level.walls.length;
        channel.level.walls.push(spriteLogic.createSprite(200,200));
        channel.level.walls[inx].x = x;
        channel.level.walls[inx].y = y;
        channel.level.walls[inx].setAnimation("Rift/img/" + (isTall ? "barrier":"blockade") + ".png", 64, (isTall ? 480:240), 1);
    },

    createPlatform: function(x, y, type) {
        let inx = channel.level.plat.length;
        channel.level.plat.push(spriteLogic.createSprite(300,310));
        channel.level.plat[inx].type = "";
        channel.level.plat[inx].x = x;
        channel.level.plat[inx].y = y;
        channel.level.plat[inx].type = type;
    },

    createFire: function(x, y) {
        channel.level.fire.push(spriteLogic.createSprite(x, y));
        channel.level.fire[channel.level.fire.length-1].setAnimation("Rift/img/fire.png", 102, 30, 4);
    },

    createEnemy: function(x, y) {
        let inx = channel.level.enemies.length;
        channel.level.enemies.push(spriteLogic.createSprite(200,200));
        channel.level.enemies[inx].setAnimation("Rift/img/corrupted.png", 120, 120, 4);
        channel.level.enemies[inx].boundingBoxType = "circle";
        channel.level.enemies[inx].x = x;
        channel.level.enemies[inx].y = y;
    },

    lvl0: function() {
        channel.player.sprite.x = 200;
        channel.bookfunct(2180, 170);
        channel.createEnemy(580, 310);
        channel.createEnemy(1880, 310);
        channel.createEnemy(2180, 310);
        channel.createWall(0, 280, true);
        channel.createWall(485, 330, false);
        channel.createWall(1085, 330, false);
        channel.createWall(1380, 85, false);
        channel.createWall(1580, 360, false);
        channel.createWall(2280, 280, true);
        channel.createPlatform(400, 280, "floor");
        channel.createPlatform(785, 278, "floor");
        channel.createPlatform(1880, 260, "floor");
        channel.createPlatform(2180, 260, "floor");
        channel.createPlatform(1480, 310, "floor");
        channel.game.inLevel = true;
    },

    lvl1: function() {

    },

    lvl2: function() {
        
    },

    lvl3: function() {
        
    },


    collide: function(sprite, target, speed = 0) {
        sprite.x += sprite.dx;
        if(!sprite.isTouching(target)) {
            sprite.x -= sprite.dx;
            return false;
        }
        sprite.x -= sprite.dx;
        sprite.dx = speed;
        return true;
    },

    killSpriteList: function(arr) {
        arr.forEach((e) => {
            e.kill();
        });
    }
};
}
document.gameStart["Rift/"] = setRift;
