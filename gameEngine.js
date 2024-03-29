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


// helpers
function degToRad(deg) {
    return deg*3.14159265359/180;
};

// create ground
var ground = Bodies.rectangle(400, 510, 810, 60, { isStatic: true });

// create dog
var body = Bodies.rectangle(300, 50, 100, 20, {label: 'body'});
var head = Bodies.rectangle(350, 30, 50, 20, { angle: degToRad(-45), label: 'head' });
// Body.rotate(head, -120);
var backLeg = Bodies.rectangle(250, 60, 50, 20, { angle: degToRad(-90), label: 'backLeg' });
// Body.rotate(backLeg, -130);
var frontLeg = Bodies.rectangle(350, 60, 50, 20, { angle: degToRad(90), label: 'frontLeg' });
// Body.rotate(frontLeg, 130);

var dog = Body.create({
    parts: [backLeg, body, frontLeg, head]
});

// add all of the bodies to the world
World.add(engine.world, [dog, ground]);

// run the engine
Engine.run(engine);

// run the renderer
Render.run(render);

// drop the Dog
Body.setPosition(dog, Matter.Vector.create(250, 0));

// controls
document.addEventListener("keydown", keyAction);

// initialize keypress timer
let prevKeyPress = new Date();
let timeElapsed = 0;
let tempTime = 0;

// calculate time elapsed since last key press
function timeElapsedKey() {
    tempTime = new Date();
    timeElapsed = tempTime - prevKeyPress;
    
    // console.log("time elapsed (ms): ", timeElapsed);
    
    // update keypress timer
    prevKeyPress = new Date();
    return timeElapsed;
}


function resetLegs(){
    Body.setAngle(backLeg, degToRad(-90));
    Body.setAngle(frontLeg, degToRad(90));
};

function resetBody(){
    resetLegs();
    Body.setPosition(dog, Matter.Vector.create(250, 400));
};


let goodDances = [];

function keyAction(e) {
    if (e.key == "d") {
        Body.rotate(frontLeg, degToRad(45));
    } else if (e.key == "a") {
        Body.rotate(backLeg, -degToRad(45));
    } else if (e.key == "f") {
        Body.rotate(frontLeg, -degToRad(45));
    } else if (e.key == "s") {
        Body.rotate(backLeg, degToRad(45));
    } else if (e.key == " ") {
        resetBody();
    } else if (e.key == "b") {
        updateData({x: trainSet[trainIndex].dataSync()[0], 
            y: trainSet[trainIndex].dataSync()[1]},
            1);
        trainIteration(trainSet[trainIndex], [0]);
        resetBody();
    } else if (e.key == "g") {
        updateData({x: trainSet[trainIndex].dataSync()[0], 
            y: trainSet[trainIndex].dataSync()[1]},
            0);
        goodDances.push(trainSet[trainIndex]);
        trainIteration(trainSet[trainIndex], [1]);
        resetBody();
    }

    // update timer if known key was pressed
    if (mapping.includes(e.key)) {
        timeElapsedKey();
    }
}