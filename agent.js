// map actions to integers (i.e. array indices)
let mapping = [ "p", "a", "s", "d", "f"];
const numOfMoves = 5;
const numOfDims = 2; // For gaussian random

// random seq generator
function randSeqGen(seqLen) {
    let output = [];
    for (let i = 0; i < seqLen; i++ ){
        output.push(Math.floor(Math.random() * mapping.length));
    };
    return output;
};

function randLabGen(seqLen=5) {
    let output = [];
    for (let i = 0; i < seqLen; i++ ){
        output.push(0);
    };
    let index = Math.floor(Math.random() * seqLen-1)
    output[index] = 1;
    return output;
};

function randGaussian(numOfDims) {
    return tf.randomNormal([1, numOfDims]);
}

// Define the topology of the model.
const model = tf.sequential();
model.add(tf.layers.dense({units: Math.ceil(numOfMoves), inputShape: [numOfDims], activation: 'relu'}));
model.add(tf.layers.dense({units: Math.ceil(numOfMoves*5), activation: 'relu'}));
model.add(tf.layers.dense({units: Math.ceil(numOfMoves*10), activation: 'relu'}));
model.add(tf.layers.dense({units: numOfMoves*mapping.length, activation: 'sigmoid'}));
model.add(tf.layers.dense({units: 1, activation: 'sigmoid'}));

// Compile model to prepare for training.
const learningRate = 0.1; //4e-3;
// const optimizer = tf.train.rmsprop(learningRate);
model.compile({
  loss: tf.metrics.binaryCrossentropy,
  optimizer: 'adam',
  metrics: ['acc']
});

// get all the layers of the model
const layers = model.layers;
const numOfLayers = layers.length;
const moveLayer = numOfLayers - 1;

function layerOutputs(topInput) {
    let input = [topInput];
    
    // passing Input to every layer and saving output as input for next layer    
    for (var i = 0; i < model.layers.length; i++) {
        input.push(layers[i].apply(input[i]));
        // console.log('Name:' ,layers[i].name);
        // console.log('Units:' ,layers[i].units);
        // console.log('Out Shape:' ,layers[i].outputShape);
    };
    return input;
}


let initialSeed = randGaussian(numOfDims);
model.predict(initialSeed).print();

let outs = layerOutputs(initialSeed);
console.log(outs[moveLayer].dataSync());

function extractMoves(outs) {
    return tf.tensor2d(outs, [numOfMoves, mapping.length]).argMax(axis=1);
}

let trainSet = [];
for (let i = 0; i < 500; i++){
    trainSet.push(randGaussian(numOfDims));
};

let trainIndex = 0;
let newMoves = extractMoves(outs[moveLayer].dataSync());

function trainIteration(train, label) {
    console.log('Training model...');
    train.print();
    let action = tf.tensor(label, [label.length, 1]);
    action.print();
    model.fit(
        train,
        action, 
        {
            epochs: 1,
            callbacks: {
            onEpochEnd: async (epoch, logs) => {
                // Update the UI to display the current loss and accuracy values.
                console.log({"epoch: ": epoch + 1,
                "logs.loss: ": logs.loss.toFixed(4),
                "logs.acc: ": logs.acc.toFixed(4)});
            },
            }
        }
    );
    trainIndex += 1;
    newMoves = extractMoves(layerOutputs(trainSet[trainIndex])[moveLayer].dataSync());
};

setInterval(function() {playAnimation()}, 5000);

function playAnimation() {
    let animSeq = newMoves.dataSync();
    var i = 0;
    (function loop() {
        let data = {"key": mapping[animSeq[i]]}
        keyAction(data);
        if (++i < animSeq.length) {
            setTimeout(loop, 100);
        }
    })();
};