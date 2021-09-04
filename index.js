// main thread of work
new Promise((resolve, reject) => {
    // creating the new data object
    let data = [];
    for (let i = 0; i < 4; i += 0.033) {
        let sign = (-1) ** Math.round(Math.random());
        let noise = Math.min(Math.random() / Math.random(), 40) * sign;
        let y = Math.exp(i) + noise;
        data.push({
            x: i,
            y: y,
        });
    }

    // resolving and returning this new data object
    resolve(data);
})
    .then((data) => {
        // converting the data objects into tensors
        let xTensor = tf.tensor2d(
            data.map((d) => d.x),
            [data.length, 1]
        );
        let yTensor = tf.tensor2d(
            data.map((d) => d.y),
            [data.length, 1]
        );

        // returning the new data
        return { x: xTensor, y: yTensor };
    })
    .then((tensors) => {
        // normalizing the data
        return new Promise((resolve, reject) => {
            // finding the min and max values of the data
            tensors.xRange = { min: tensors.x.min(), max: tensors.x.max() };
            tensors.yRange = { min: tensors.y.min(), max: tensors.y.max() };

            // min max normalizing the data
            tensors.xNorm = tensors.x
                .sub(tensors.xRange.min)
                .div(tensors.xRange.max.sub(tensors.xRange.min));
            tensors.yNorm = tensors.y
                .sub(tensors.yRange.min)
                .div(tensors.yRange.max.sub(tensors.yRange.min));

            // resolving with the updated tensor object
            resolve(tensors);
        });
    })
    .then((tensors) => {
        // initializing the model
        return new Promise((resolve, reject) => {
            // creating a new model object
            tensors.model = tf.sequential();

            // adding in an input layer
            tensors.model.add(
                tf.layers.dense({
                    inputShape: [1],
                    units: 1,
                    weights: [tf.tensor([-1], [1, 1]), tf.tensor([-0.4])], // starting values of teh gradient descent
                })
            );

            // adding in an output layer
            tensors.model.add(
                tf.layers.dense({
                    units: 1,
                    weights: [tf.tensor([-0.5], [1, 1]), tf.tensor([-0.2])], // starting values of the gradient descent
                })
            );

            // resolving with the model object
            resolve(tensors);
        });
    })
    .then((tensors) => {
        // train the model
        return new Promise((resolve, reject) => {
            // preparing the model to be trained
            tensors.model.compile({
                optimizer: tf.train.adam(),
                loss: tf.losses.meanSquaredError,
                metrics: ["mse"],
            });

            // setting the batch and epoch size
            tensors.batchSize = 20;
            tensors.epochs = 15;

            async function train_model() {
                // training the model
                await tensors.model.fit(tensors.xNorm, tensors.yNorm, {
                    batchSize: tensors.batchSize,
                    epochs: tensors.epochs,
                    callbacks: tfvis.show.fitCallbacks(
                        { name: "Training Performance" },
                        ["loss", "mse"],
                        { height: 200, callbacks: ["onEpochEnd"] }
                    ),
                });

                // returning the new trained model
                return tensors;
            }

            // resolving with the updated model
            resolve(train_model());
        });
    })
    .then((tensors) => {
        // run predictions through the model
        return new Promise((resolve, reject) => {
            // running the old x values through the model
            let preds = tensors.model.predict(tensors.xNorm);

            // un normalizing the predictions
            tensors.preds = preds
                .mul(tensors.yRange.max.sub(tensors.yRange.min))
                .add(tensors.yRange.min);

            // resolving with the predictions
            resolve(tensors);
        });
    })
    .then((tensors) => {
        // graphing the true data and the modeled data
        return new Promise((resolve, reject) => {
            // creating the original data object
            const originalPoints = [];
            tensors.y.dataSync().map((y, index) => {
                originalPoints.push({ x: tensors.x.dataSync()[index], y: y });
            });
            console.log(originalPoints);

            // creating the predicted data object
            const predictedPoints = [];
            tensors.preds.dataSync().map((y, index) => {
                predictedPoints.push({ x: tensors.x.dataSync()[index], y: y });
            });
            console.log(predictedPoints);

            // rendering the scatter plot
            tfvis.render.scatterplot(
                { name: "Model Predictions vs Original Data" },
                {
                    values: [originalPoints, predictedPoints],
                    series: ["original", "predicted"],
                },
                {
                    xLabel: "x",
                    yLabel: "y",
                    height: 300,
                }
            );

            console.log(
                tensors.model.weights.forEach((item) => {
                    return item.val.print();
                })
            );
            // resolving with nothing since we are done
            resolve();
        });
    });
