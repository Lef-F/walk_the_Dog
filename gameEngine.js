// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Bodies = Matter.Bodies;

// create an engine
var engine = Engine.create();

var canvas = document.getElementById("game");

// create a renderer
var render = Render.create({
    element: canvas,
    engine: engine,
    options: {
        height: 500,
        width: 500
    }
});

// create ground
var ground = Bodies.rectangle(400, 510, 810, 60, { isStatic: true });

// create dog
var body = Bodies.rectangle(300, 50, 100, 20);
var head = Bodies.rectangle(350, 30, 50, 20);
Body.rotate(head, -120);
var backLeg = Bodies.rectangle(250, 60, 50, 20);
Body.rotate(backLeg, -130);
var frontLeg = Bodies.rectangle(350, 60, 50, 20);
Body.rotate(frontLeg, 130);

var dog = Body.create({
    parts: [backLeg, body, frontLeg, head]
});

// add all of the bodies to the world
World.add(engine.world, [dog, ground]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

// helpers
function degToRad(deg) {
    return deg*3.14159265359/180;
}

// controls
document.addEventListener("keydown", keyAction);

function keyAction(e) {
    if (e.key == "d") {
        Body.rotate(frontLeg, degToRad(50));
        // Body.rotate(frontLeg, -degToRad(50));
    } else if (e.key == "a") {
        Body.rotate(backLeg, -degToRad(50));
        // Body.rotate(backLeg, degToRad(50));
    }
}