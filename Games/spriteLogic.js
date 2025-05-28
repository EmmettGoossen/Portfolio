//make a sudo library
let globalSpriteData = {
    ctx: null, //host canvas element
    spriteDrawList: [] //array holiding all sprite.draw callbacks
};

document.spriteLogic = {

    globalSpriteData: null,

createSprite: (x=0, y=0, scale=1, Width=50, Height=50, src='')=>{
    let sprite = {
        //meta data
        id:globalSpriteData.spriteDrawList.length,
        lifetime: -1,
        visible: true,
        dead: false,

        //kinematic data
        x: x,
        y: y,
        dx: 0,
        dy: 0,

        //rotational data
        rot: 0,
        dr: 0,

        //sizing data
        scale: scale,
        width: Width,
        height: Height,

        //bounding box data
        boundingBoxType: "box",

        //animation object
        animationLogic: {
            //sprite animation info
            img: new Image(),
            speed: 24,
            frameCount: 4,
            spriteWidth: Width,
            spriteHeight: Height,

            //animation driver data
            rowLength: 0,
            frame: 0, //current frame
            nextInterval: null, //interval ID for next frame
                //position on the src img for the frame
            imageX: 0,
            imageY: 0,
            getFrameCoords: (frame) => {
                let self = sprite.animationLogic;
                return [self.spriteWidth * (frame%self.rowLength), self.spriteHeight * Math.floor(frame/self.rowLength)];
            },

            getRowLen: ()=>{
                return sprite.animationLogic.img.naturalWidth/sprite.animationLogic.spriteWidth;
            },

            runAnimation: () => {
                let self = sprite.animationLogic;
                if(self.frame >= self.frameCount){
                    self.frame = 0;
                }
                
                let temp = self.getFrameCoords(self.frame);
                self.imageX = temp[0];
                self.imageY = temp[1];
                self.frame++;
            },
            updatePos: (id) => {
                //change id if sprite died
                sprite.id = id;

                //posUpdate
                sprite.rot += sprite.dr;
                sprite.x += sprite.dx;
                sprite.y += sprite.dy;

                //kill sprite when lifetime = ~0
                sprite.lifetime--;
                if(Math.ceil(sprite.lifetime) == 0){
                    sprite.kill();
                }
            },
            draw: (id) => {
                //update values
                sprite.animationLogic.updatePos(id);

                if(!sprite.visible || sprite.dead){
                    return;
                }

                globalSpriteData.ctx.save();
                //rotate image
                globalSpriteData.ctx.translate(sprite.x, sprite.y);
                globalSpriteData.ctx.rotate((sprite.rot * Math.PI / 180)%360);

                //flip image
                if(sprite.width < 0 || sprite.height){
                    globalSpriteData.ctx.scale(sprite.width/Math.abs(sprite.width), sprite.height/Math.abs(sprite.height));
                }else{
                    globalSpriteData.ctx.scale(1, 1);
                }

                //draw image
                globalSpriteData.ctx.drawImage(
                    sprite.animationLogic.img,
                    sprite.animationLogic.imageX,
                    sprite.animationLogic.imageY,
                    sprite.animationLogic.spriteWidth,
                    sprite.animationLogic.spriteHeight,
                    -sprite.width*sprite.scale/2,
                    -sprite.height*sprite.scale/2,
                    sprite.width*sprite.scale,
                    sprite.height*sprite.scale
                    );
                
                //rotate image back
                globalSpriteData.ctx.restore();
            }
        },//animationLogic end 

        //setters
        setAnimation: (src, width, height, frames) => {
            sprite.animationLogic.img.src = src;
            
            sprite.animationLogic.img.onload = () => {
            //pixel dimentions
                sprite.animationLogic.spriteWidth = width;
                sprite.width = width;
                sprite.animationLogic.spriteHeight = height;
                sprite.height = height;

            //frame dimentions
                sprite.animationLogic.rowLength = sprite.animationLogic.getRowLen();
                let colLength = sprite.animationLogic.img.naturalHeight/sprite.animationLogic.spriteHeight;
                sprite.animationLogic.frameCount = frames;

            //run animation
            if(sprite.animationLogic.speed <= 0){
                clearInterval(sprite.animationLogic.nextInterval);
                return;
            }

            sprite.animationLogic.nextInterval = setInterval(
                sprite.animationLogic.runAnimation,
                1000/sprite.animationLogic.speed,
                sprite.animationLogic.frame);
            };
        },

        

        setBoundingBoxType: (type) => {
            sprite.boundingBoxType = type;
        },

        //methods
        isTouching: (sprite2) => {
            //order the bounds lexographically
            let box1 = (sprite.boundingBoxType<sprite2.boundingBoxType)?sprite:sprite2;
            let box2 = (box1.boundingBoxType==sprite.boundingBoxType)?sprite2:sprite;
            let width = Math.abs(sprite.width);
            let height = Math.abs(sprite.height);
            let width2 = Math.abs(sprite2.width);
            let height2 = Math.abs(sprite2.height);


            switch(box1.boundingBoxType+box2.boundingBoxType){
                case "boxbox":
                    //check if boxes intersect on both planes
                    if(sprite.x-width/2 >= sprite2.x+width2/2 || sprite.x+width/2 <= sprite2.x-width2/2){
                        return false;
                    }
                    if(sprite.y-sprite.height/2 >= sprite2.y+sprite2.height/2 || sprite.y+sprite.height/2 <= sprite2.y-sprite2.height/2){
                        return false;
                    }
                    return true;
                case "boxcircle":
                    //find closest point to circle center
                    let Xn = Math.max(box1.x-box1.width/2, Math.min(box2.x, box1.x+box1.width/2));
                    let Yn = Math.max(box1.y+box1.height/2, Math.min(box2.y, box1.y+box1.height/2));
                    let R = Math.max(box2.width, box2.height);

                    if((sprite.x-sprite2.x)**2 + (sprite.y-sprite2.y)**2 <= ((R)/2)**2){
                        return true;
                    }

                    return false;
                case "circlecircle":
                    //if the dist btwn the centers is less than or equal to the sum of the radii
                    let R1 =  Math.max(box1.width, box1.height);
                    let R2 =  Math.max(box2.width, box2.height);

                    if(((sprite.x-sprite2.x)**2 + (sprite.y-sprite2.y)**2)**0.5 <= (R1/4 + R2/4)){
                        return true;
                    }
                    return false;
                default:
                    return false;
            };
        },

        //deconstructor
        kill: () => {
            globalSpriteData.spriteDrawList.splice(sprite.id);
            clearInterval(sprite.animationLogic.nextInterval);
            sprite.boundingBoxType = "";
            sprite.dead = true; //javascript does allow dealloc, so manual garbage collection necessary
        }
    }//object definition end

    sprite.animationLogic.img.src = src;
    sprite.animationLogic.img.onload = () => {
        sprite.animationLogic.nextInterval = setInterval(
            sprite.animationLogic.runAnimation,
            1000/sprite.animationLogic.speed,
            sprite.animationLogic.frame)};

    globalSpriteData.spriteDrawList.push(sprite.animationLogic.draw); //make the sprite draw when called
    return sprite;
},

draw: (canvas)=>{
    globalSpriteData.ctx = document.getElementById(canvas).getContext("2d");
    let count = 0;
    globalSpriteData.spriteDrawList.forEach((e) => {
        e(count);
        count++;
    });
}
}//library def end

document.spriteLogic.globalSpriteData = globalSpriteData;