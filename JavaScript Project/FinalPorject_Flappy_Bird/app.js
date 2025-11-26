
let config = {
    renderer: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        },
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image("background", "assets/Background3.png");
    this.load.spritesheet("assets", "assets/SimpleStyle1.png",{
        frameWidth: 16,
        frameHeight: 16,
    });
    this.load.spritesheet("bird", "assets/Bird1-4.png",{
        frameWidth: 16,
        frameHeight: 16,
    });
}

var bird;
let hasLanded = false;
let cursors;
let hasBumped = false;
let isGameStarted = false;
let messageToPlayer;

function create() {

    cursors = this.input.keyboard.createCursorKeys();

    let background = this.add.image(0, 0, "background").setOrigin(0,0).setScale(2);
    
    // Creamos el suelo
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    background.setDisplaySize(gameWidth,gameHeight);
    background.setDepth(0);

    this.groundGroup = this.physics.add.staticGroup();

    const floorFrames = [40, 41, 42, 43];
    let frameCounter = 0;
    const TILE_SIZE = 16;
    const SCALE = 2.5;
    const scaledTileSize = TILE_SIZE * SCALE;
    const floorStartY = gameHeight - (scaledTileSize);
    
    for (let x = 0; x < gameWidth; x += scaledTileSize) {
        for (let y = floorStartY; y < gameHeight; y += scaledTileSize) {
            let frameIndex = floorFrames[frameCounter % floorFrames.length];
            let tile = this.groundGroup.create(x, y, 'assets', frameIndex);
            tile.setOrigin(0, 0);
            tile.setScale(SCALE);
            tile.refreshBody();
            frameCounter++;
        }
    }

    this.columnsGroup = this.physics.add.staticGroup();
    createGroundColumn(this, 100, floorStartY, 0, 8, SCALE, 2, 4);

    createSkyColumn(this, 150, 32, 24, SCALE, 2, 6);

    createGroundColumn(this, 350, floorStartY, 0, 8, SCALE, 2, 8);

    createSkyColumn(this, 350, 32, 24, SCALE, 2, 3);

    createGroundColumn(this, 500, floorStartY, 0, 8, SCALE, 2, 3);

    createSkyColumn(this, 550, 32, 24, SCALE, 2, 8);


    bird = this.physics.add.sprite(0,50, "bird").setScale(SCALE);
    bird.setBounce(0.2);
    bird.setCollideWorldBounds(true);

    this.physics.add.overlap(bird,this.groundGroup, () => (hasLanded = true), null, this);
    this.physics.add.overlap(bird,this.columnsGroup, () => (hasBumped = true), null, this);
    this.physics.add.collider(bird,this.groundGroup);
    this.physics.add.collider(bird,this.columnsGroup);

    messageToPlayer = this.add.text(
    0,
    0,
    `Instructions: Press space bar to start`,
    {
      fontFamily: '"Comic Sans MS", Times, serif',
      fontSize: "20px",
      color: "white",
      backgroundColor: "black",
    });
    Phaser.Display.Align.In.BottomCenter(messageToPlayer, background, 290, 345);
}

function createGroundColumn(scene, x, floorY, topFrame, bottomFrame, scale, width = 2, height = 2) {
    const TILE_SIZE = 16;
    const scaledSize = TILE_SIZE * scale;
    
    // Calcular posición inicial (desde arriba)
    const columnY = floorY - (scaledSize * height);
    
    // Crear tiles según el ancho y alto especificado
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            let frameToUse;
            
            // Si está en la fila superior, usar topFrame
            if (row === 0) {
                frameToUse = topFrame + col;
            } else if (row === 1) {
                // Si está en filas inferiores, usar bottomFrame
                frameToUse = bottomFrame + col;
            }
            else{
                frameToUse = bottomFrame + 8 + col;
            }
            
            let tile = scene.columnsGroup.create(
                x + (col * scaledSize), 
                columnY + (row * scaledSize), 
                'assets', 
                frameToUse
            );
            tile.setOrigin(0, 0);
            tile.setScale(scale);
            tile.setDepth(0);
            tile.refreshBody();
        }
    }
    
}

function createSkyColumn(scene, x, topFrame, bottomFrame, scale, width = 2, height = 2) {
    const TILE_SIZE = 16;
    const scaledSize = TILE_SIZE * scale;
    
    // Calcular posición inicial (desde arriba)
    const columnY = 0;
    
    // Crear tiles según el ancho y alto especificado
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            let frameToUse;
            
            // Si está en la fila superior, usar topFrame
            if (row === height - 1) {
                frameToUse = topFrame + col;
            } else if (row === height - 2) {
                // Si está en filas inferiores, usar bottomFrame
                frameToUse = bottomFrame + col;
            }
            else{
                frameToUse = bottomFrame - 8 + col;
            }
            
            let tile = scene.columnsGroup.create(
                x + (col * scaledSize), 
                columnY + (row * scaledSize), 
                'assets', 
                frameToUse
            );
            tile.setOrigin(0, 0);
            tile.setScale(scale);
            tile.setDepth(0);
            tile.refreshBody();
        }
    }
}

function update() {
    if (cursors.space.isDown && !isGameStarted) {
        isGameStarted = true;
        messageToPlayer.text = 'Instructions: Press the "^" button to stay upright\nAnd don\'t hit the columns or ground';
        messageToPlayer.x = 170;
    }

    if (!isGameStarted) {
        bird.setVelocityY(-160);
    }

    bird.body.velocity.x = 50;

    if (cursors.up.isDown && !hasLanded && !hasBumped){
        bird.setVelocityY(-160);
    }

    if (!hasLanded || !hasBumped) {
        bird.body.velocity.x = 50;
    }

    if (hasLanded || hasBumped || !isGameStarted){
        bird.body.velocity.x = 0;
    }

    if (hasLanded || hasBumped){
        messageToPlayer.text = `Oh no! You crashed!`;
        messageToPlayer.x = 320;
    }
    if (bird.x > 750) {
        bird.setVelocityY(40);
        messageToPlayer.text = `Congrats! You won!`;
        messageToPlayer.x = 320;
    }
}