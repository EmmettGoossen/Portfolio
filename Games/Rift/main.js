function setRift(){
document.game = {
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
        let {game, level, player} = document.game;
        game.healthSprite.animationLogic.speed = 0;
        game.healthSprite.setAnimation("Rift/img/health.png", 44, 20, 10);
        game.portal.setAnimation("Rift/img/portal.png", 88, 160, 8);
        game.portal.animationLogic.speed = 4;
        game.ground.forEach((e) => {
            e.setAnimation("Rift/img/floor.png", 400, 90, 1);
        });

        level.boss.setAnimation("Rift/img/corrupted_slime.png", 290, 220, 2);
        level.boss.animationLogic.speed = 1;
        level.boss.scale = 1.2;
        level.book.setAnimation("Rift/img/grimoire.png", 36, 60, 4);
        level.book.animationLogic.speed = 1.5;

        player.sprite.setAnimation("Rift/img/bell.png", 112, 192, 4);
        player.sprite.animationLogic.speed = 2;
    },

    draw: function() {
        let current = document.game;
        let { game, level, player } = document.game;

        canvas.fillStyle = "tan";
        canvas.fillRect(0, 0, 400, 400);

        canvas.fillStyle = "crimson";
        canvas.fillRect(-5, 63, 405, 67);

        canvas.fillStyle = "black";
        canvas.fillRect((game.inLevel ? 83:88), 15, 44, 20);

        canvas.fillStyle = "black";
        canvas.font = "20px pixel";
        canvas.fillText("Health: ", 10, 30);
        canvas.fillText("Grimoires: " + game.score, 10, 50);
        game.healthSprite.x = (game.inLevel ? player.sprite.x - 95:110);
        if((player.health+1)%10 == 0){
            player.health -= 1;
            game.healthSprite.animationLogic.runAnimation();
        }

        current.gravity();
        current.controls();

        if(!game.inLevel){
            game.portal.y = 290;
            game.walls.forEach(e => { e.dx = 0; });
            game.ground.forEach(e => { e.dx = 0; });
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
            current.study();
        }else{
            game.portal.y = 590;
            game.walls.forEach(e => {
                e.setAnimation("Rift/img/dungeon.png", 400, 264, 1);
            });

            current.relativeVel();
            current.handleObstacles();

            if(player.sprite.isTouching(level.book)){
                game.inLevel = false;
                player.sprite.x = 200;
                player.sprite.y = 310;
                game.score++;
            }

            canvas.save();
            canvas.translate(-(player.sprite.x-200), 0);
        }

        spriteLogic.draw("channel");

        if (player.health <= 0) {
            game.inLevel = false;
            canvas.fillStyle = "black";
            canvas.fillRect(0,0,400,400);
            canvas.fillStyle = "green";
            canvas.font = "50px pixel";
            canvas.fillText("Game Over!" , 75, 200);
            canvas.font = "17px pixel";
            canvas.fillText("the corruption is still unslain!" ,  105, 215);
            player.sprite.x = 200;
        }else if(keyLogic.keyDown("Enter") && player.sprite.isTouching(game.portal)){
            current.levelSelect(game.score+1); 
        }

        canvas.restore();
        document.drawLoop = requestAnimationFrame(current.draw);
    },

    handleObstacles: function() {
        let current = document.game;
        let { level, player } = current;
        current.enemyMain();
        current.fireMain();
        if(player.sprite.isTouching(level.boss)){
            player.health -= 1;
        } 
    },

    relativeVel: function() {
        let { level, game, player } = document.game;
        level.book.dx = -(player.sprite.dx);

        level.walls.forEach((e) => { e.dx = -player.sprite.dx; });
        level.plat.forEach((e) => { e.dx = -player.sprite.dx; });

        level.enemies.forEach((e) => {
            e.dx -= player.sprite.dx;
        });
        
        for(let inx = 0; inx <= 1;inx++){
            game.walls[inx].dx = -player.sprite.dx;
            game.ground[inx].dx = -player.sprite.dx;
            
            if(game.walls[inx].x <= player.sprite.x - 400){

                game.walls[Math.abs(inx-1)].x + 400;
                game.ground[inx].x = game.walls[Math.abs(inx-1)].x + 400;
            } else if(game.walls[inx].x >= player.sprite.x + 400) {

                game.walls[inx].x = game.walls[Math.abs(inx-1)].x - 400;
                game.ground[inx].x = game.walls[Math.abs(inx-1)].x - 400;  
            }
        }
    },

    controls: function() {
        let current = document.game;
        let { level, player } = current;

        if(keyLogic.keyDown('d')) {
            player.sprite.dx = 5;
            player.sprite.width = -112;
        } else if(keyLogic.keyDown('a')) {
            player.sprite.width = 112;
            player.sprite.dx = -5;
        } else {
            player.sprite.dx = 0;
        }

        if(keyLogic.keyDown(" ") && !player.hasJumped) {
            player.sprite.dy  = -17;
            player.hasJumped = true;
        }

        for(let i = 0; i < level.walls.length; i++) {
            current.collide(player.sprite, level.walls[i]);
        }
    },

    gravity: function() {
        let current = document.game;
        let { player } = current;
        player.sprite.dy += (keyLogic.keyDown(" ") ? 1.25 : 1.5);
        player.sprite.y += player.sprite.dy;

        if(player.sprite.y >= 310) {
            player.sprite.y -= player.sprite.dy;
            player.sprite.dy = 0;
            player.hasJumped = false;
        }

        player.sprite.y -= player.sprite.dy;
        current.platMain();
    },

    platMain: function() {
        let { game, level, player } = document.game;

        if(!game.inLevel) return;

        for(let platInx = 0; platInx < level.plat.length; platInx++) {
            player.sprite.y += player.sprite.dy;
            switch(level.plat[platInx].type) {
                case "floor":
                    level.plat[platInx].setAnimation("Rift/img/activated_sigil.png", 156, 48, 1);
                    if(player.sprite.isTouching(level.plat[platInx])) {
                        player.sprite.y -= player.sprite.dy;
                        player.sprite.dy = 0;
                        player.hasJumped = false;
                    }
                    return;
                case "roof":
                    level.plat[platInx].setAnimation("Rift/img/inverted_sigil.png", 156, 48, 1);
                    if(player.sprite.isTouching(level.plat[platInx])) {
                        player.sprite.y -= player.sprite.dy;
                        player.sprite.dy = 0;
                    }
                    return;
            }
            player.sprite.y -= player.sprite.dy;
        }
    },

    enemyMain: function() {
        let current = document.game;
        let { level, player } = current;
        level.boss.dx = (level.bossIsActive ? 4.5 : 0);

        for(let enmInx = 0; enmInx < level.enemies.length; enmInx++) {
            if(level.enemies[enmInx].x < player.sprite.x) {
                level.enemies[enmInx].dx = 2;
                level.enemies[enmInx].width = -120;
            } else if(level.enemies[enmInx].x > player.sprite.x) {
                level.enemies[enmInx].dx = -2;
                level.enemies[enmInx].width = 120;
            }

            for(let blocInx = 0; blocInx < level.walls.length; blocInx++) {
                if(!current.collide(level.enemies[enmInx], level.walls[blocInx], -player.sprite.dx)) {
                    continue;
                }
                level.enemies[enmInx].width = -level.enemies[enmInx].width;
            }

            if(player.sprite.isTouching(level.enemies[enmInx])) {
                player.health--;
            }
        }
    },

    fireMain: function() {
        let { level, player } = document.game;
        for(let Inx = 0; Inx < level.fire.length; Inx++) {
            level.fire[Inx].dx = -player.sprite.dx;
        }
    },

    levelSelect: function(levelNum) {
        let current = document.game;
        switch(levelNum) {
            case 0: current.lvl0(); break;
            case 1: current.lvl1(); break;
            case 2: current.lvl2(); break;
            case 3: current.lvl3(); break;
            default:
                if(keyLogic.keyDown('1')) {
                    current.lvl0();
                } else if(keyLogic.keyDown('2')) {
                    current.lvl1();
                } else if(keyLogic.keyDown('3')) {
                    current.lvl2();
                } else {
                    current.levelSelect(randomNumber(0,3));
                }
                break;
        }
    },

    study: function() {
        let current = document.game;
        let { game, level } = current;
        game.walls[0].x = 200;
        game.walls[1].x = 600;
        game.ground[0].x = 200;
        game.ground[1].x = 600;
        current.killSpriteList(level.walls);
        level.walls = [];
        current.killSpriteList(level.plat);
        level.plat = [];
        current.killSpriteList(level.enemies);
        level.enemies = [];
    },

    bookfunct: function(x, y) {
        document.game.level.book.x = x;
        document.game.level.book.y = y;
    },

    createWall: function(x, y, isTall) {
        let level = document.game.level;
        let inx = level.walls.length;
        level.walls.push(spriteLogic.createSprite(200,200));
        level.walls[inx].x = x;
        level.walls[inx].y = y;
        level.walls[inx].setAnimation("Rift/img/" + (isTall ? "barrier":"blockade") + ".png", 64, (isTall ? 480:240), 1);
    },

    createPlatform: function(x, y, type) {
        let level = document.game.level;
        let inx = level.plat.length;
        level.plat.push(spriteLogic.createSprite(300,310));
        level.plat[inx].type = "";
        level.plat[inx].x = x;
        level.plat[inx].y = y;
        level.plat[inx].type = type;
    },

    createFire: function(x, y) {
        let level = document.game.level;
        level.fire.push(spriteLogic.createSprite(x, y));
        level.fire[level.fire.length-1].setAnimation("Rift/img/fire.png", 102, 30, 4);
    },

    createEnemy: function(x, y) {
        let level = document.game.level;
        let inx = level.enemies.length;
        level.enemies.push(spriteLogic.createSprite(200,200));
        level.enemies[inx].setAnimation("Rift/img/corrupted.png");
        level.enemies[inx].boundingBoxType = "circle";
        level.enemies[inx].x = x;
        level.enemies[inx].y = y;
    },

    lvl0: function() {
        let current = document.game;
        let { player } = current;
        player.sprite.x = 200;
        current.bookfunct(2180, 170);
        current.createEnemy(580, 310);
        current.createEnemy(1880, 310);
        current.createEnemy(2180, 310);
        current.createWall(0, 280, true);
        current.createWall(485, 330, false);
        current.createWall(1085, 330, false);
        current.createWall(1380, 85, false);
        current.createWall(1580, 360, false);
        current.createWall(2280, 280, true);
        current.createPlatform(400, 280, "floor");
        current.createPlatform(785, 278, "floor");
        current.createPlatform(1880, 260, "floor");
        current.createPlatform(2180, 260, "floor");
        current.createPlatform(1480, 310, "floor");
        current.game.inLevel = true;
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
        sprite.dx = -speed;
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
