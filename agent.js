// map actions to integers (i.e. array indices)
let mapping = [ "p", "a", "s", "d", "f"];

// random seq generator
function randSeqGen(seqLen=10) {
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

// Define the topology of the model.
const model = tf.sequential();
model.add(tf.layers.lstm({units: 8, inputShape: [10, 1]}));
model.add(tf.layers.dense({units: 5, activation: 'sigmoid'}));
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
const layers = model.layers

function layerOutputs(topInput) {
    let input = [layers[0].apply(topInput)];
    
    // passing Input to every layer and saving output as input for next layer    
    for (var i = 1; i < model.layers.length; i++) {
        input.push(layers[i].apply(input[i-1]));
    };
    return input;
}

model.predict(tf.tensor([0,1,2,3,4,0,1,2,3,4], [1, 10, 1], "int32")).print();

let outs = layerOutputs(tf.tensor([0,1,2,3,4,0,1,2,3,4], [1, 10, 1], "int32"));
console.log(outs[1].dataSync());

function computeNextMove(outs, ins) {
    let maxInd = tf.tensor1d(outs).argMax().dataSync();
    return ins.concat(tf.tensor1d(maxInd));
}

let trainSet = [];
for (let i = 0; i < 500; i++){
    trainSet.push(randSeqGen());
};

let trainIndex = 0;
let newMoves = computeNextMove(outs[1].dataSync(), tf.tensor1d(trainSet[trainIndex]));

function trainIteration(train, label) {
    console.log('Training model...');
    let input = tf.tensor(train, [1, train.length, 1]);
    input.print();
    let action = tf.tensor(label, [label.length, 1]);
    action.print();
    model.fit(
        input,
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
    let newMove = tf.tensor(trainSet[trainIndex], [1, trainSet[trainIndex].length, 1]);
    newMoves = computeNextMove(layerOutputs(newMove)[1].dataSync(), tf.tensor1d(trainSet[trainIndex]))
};

setInterval(function() {playAnimation()}, 5000);

function playAnimation() {
    let animSeq = newMoves.dataSync();
    var i = 0;
    (function loop() {
        let data = {"key": mapping[animSeq[i]]}
        keyAction(data);
        if (++i < animSeq.length) {
            setTimeout(loop, 250);  // call myself in 3 seconds time if required
        }
    })();
};