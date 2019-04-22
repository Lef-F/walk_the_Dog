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

model.predict(tf.tensor([0,1,2,3,4,0,1,2,3,4], [1, 10, 1], "int32")).print();

// // get all the layers of the model
// const layers = model.layers

// // second model
// const model2 = tf.model({
//   inputs: layers[0].input, 
//   outputs: layers[0].output
// })

// model2.predict(tf.tensor([0,1,2,3,4,0,1,2,3,4], [1, 10, 1], "int32")).print();

let trainSet = [];
for (let i = 0; i < 500; i++){
    trainSet.push(randSeqGen());
};

let trainIndex = 0;

function trainIteration(train, label) {
    console.log('Training model...');
    tf.tensor(train, [train.length, 1]).print();
    tf.tensor(label, [label.length, 1]).print();
    model.fit(
        tf.tensor(train, [1, train.length, 1]),
        tf.tensor(label, [label.length, 1]), 
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
};

setInterval(function() {playAnimation(trainSet[trainIndex])}, 5000);

function playAnimation(animSeq) {
    var i = 0;
    (function loop() {
        let data = {"key": mapping[animSeq[i]]}
        keyAction(data);
        if (++i < animSeq.length) {
            setTimeout(loop, 250);  // call myself in 3 seconds time if required
        }
    })();
};