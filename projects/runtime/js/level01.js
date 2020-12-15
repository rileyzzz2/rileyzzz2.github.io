var level01 = function (window) {

    window.opspark = window.opspark || {};

    var draw = window.opspark.draw;
    var createjs = window.createjs;

    window.opspark.runLevelInGame = function(game) {
        // some useful constants 
        var groundY = game.groundY;

        // this data will allow us to define all of the
        // behavior of our game
        var levelData = {
            "name": "Robot Romp",
            "number": 1, 
            "speed": -3,
            "gameItems": [
                { "type": "sawblade", "x": 400, "y": groundY },
                { "type": "sawblade", "x": 600, "y": groundY },
                { "type": "sawblade", "x": 900, "y": groundY },
                { "type": "god", "x": 1000, "y": groundY / 2},
                { "type": "gamer fuel", "x": 1200, "y": groundY / 1.5}
            ],
            "enemies": [
                { "x": 400, "y": groundY - 10 },
                { "x": 800, "y": groundY - 100 },
                { "x": 1200, "y": groundY - 50 }
            ]
        };
        window.levelData = levelData;
        // set this to true or false depending on if you want to see hitzones
        game.setDebugMode(true);

        // BEGIN EDITING YOUR CODE HERE

        function obstacle(x, y) {
            var hitZoneSize = 25;
            var damageFromObstacle = 10;
            var sawBladeHitZone = game.createObstacle(hitZoneSize, damageFromObstacle);

            sawBladeHitZone.x = x;
            sawBladeHitZone.y = y;

            var obstacleImage = draw.bitmap('img/sawblade.png');
            obstacleImage.x = -25;
            obstacleImage.y = -25;

            sawBladeHitZone.addChild(obstacleImage);

            game.addGameItem(sawBladeHitZone);
        }

        function bruh(x, y) {
            var hitZoneSize = 50;
            var damageFromObstacle = 100;
            var sawBladeHitZone = game.createObstacle(hitZoneSize, damageFromObstacle);

            sawBladeHitZone.x = x;
            sawBladeHitZone.y = y;

            var obstacleImage = draw.bitmap('img/phil.png');
            obstacleImage.x = -50;
            obstacleImage.y = -50;
            obstacleImage.scaleX = obstacleImage.scaleY = 0.4;

            sawBladeHitZone.addChild(obstacleImage);

            game.addGameItem(sawBladeHitZone);
        }

        function createEnemy(x, y) {
            var enemy = game.createGameItem('enemy',25);
            var redSquare = draw.rect(50,50,'red');
            redSquare.x = -25;
            redSquare.y = -25;
            enemy.addChild(redSquare);
            enemy.x = x;
            enemy.y = y;
            game.addGameItem(enemy);

            enemy.velocityX = -2;
            enemy.rotationalVelocity = 10;

            enemy.onPlayerCollision = function() {
                game.changeIntegrity(-10);
            };

            enemy.onProjectileCollision = function() {
                game.increaseScore(100);
                enemy.fadeOut();
            }
        }
        
        function gamer(x, y) {
            var aaaa = game.createGameItem('gamerfuel', 50);
            var img = draw.bitmap('img/pizza.png');
            img.x = -50;
            img.y = -40;
            img.scaleX = img.scaleY = 0.2;
            aaaa.addChild(img);

            // var redSquare = draw.rect(50,50,'blue');
            // redSquare.x = -25;
            // redSquare.y = -25;
            // aaaa.addChild(redSquare);

            aaaa.x = x;
            aaaa.y = y;
            game.addGameItem(aaaa);

            aaaa.velocityX = -2;

            aaaa.onPlayerCollision = function() {
                game.increaseScore(100);
                enemy.fadeOut();
            };
        }

        for(let i = 0; i < levelData.gameItems.length; i++) {
            let item = levelData.gameItems[i];
            if(item.type == "sawblade")
                obstacle(item.x, item.y);
            else if (item.type == "god")
                bruh(item.x, item.y);
            else if (item.type == "gamer fuel")
                gamer(item.x, item.y);
        }

        for(let i = 0; i < levelData.enemies.length; i++) {
            let item = levelData.enemies[i];
            createEnemy(item.x, item.y);
        }



        // DO NOT EDIT CODE BELOW HERE
    }
};

// DON'T REMOVE THIS CODE //////////////////////////////////////////////////////
if((typeof process !== 'undefined') &&
    (typeof process.versions.node !== 'undefined')) {
    // here, export any references you need for tests //
    module.exports = level01;
}
