new Promise((resolve) => {
    const getRandom = () => {
        return tf.randomNormal([1], 0, 10).dataSync()[0];
    };
    // creating the system of equations to solve
    // we want to create something with 3 equations and 3 unknowns
    // ax + by + cz = d
    let a = tf.tensor([getRandom(), getRandom(), getRandom()], [3, 1]);
    a.print();
    let b = tf.tensor([getRandom(), getRandom(), getRandom()], [3, 1]);
    b.print();
    let c = tf.tensor([getRandom(), getRandom(), getRandom()], [3, 1]);
    c.print();
    let d = tf.tensor([getRandom(), getRandom(), getRandom()], [3, 1]);
    d.print();

    // creating the variables that we want to solve for and
    // setting the starting values for them
    let x = tf.variable(tf.tensor([getRandom()]));
    let y = tf.variable(tf.tensor([getRandom()]));
    let z = tf.variable(tf.tensor([getRandom()]));

    // creating the function from the tensors
    const func = (a, b, c) => {
        return a.mul(x).add(b.mul(y)).add(c.mul(z));
    };

    // creating our loss optimizing function
    const mae = (d, d_hat) => {
        return d_hat.sub(d).square().mean();
    };

    // setting the learning rate and the optimization function
    // we are going with the adam optimization function since it
    // adaptively updates the learning rate which leads to slower
    // iteration time, but better performance in the long
    // run when we are trying to estimate the parameters; by using
    // adam, we have a much better and more consitent time converging
    // to the true values of the varibles
    const learnRate = 0.1;
    console.log(`learn rate: ${learnRate}`);
    const optimizer = tf.train.adam(learnRate);

    // running the gradient descent on the system
    for (let i = 0; i < i + 2; i++) {
        // initializing our error term and significance
        let error_rounded;
        let sigfigs = 10000;

        // running the optimizer for our variables
        optimizer.minimize(() => {
            error = mae(d, func(a, b, c));
            error_rounded = Math.round(error.dataSync()[0] * sigfigs) / sigfigs;
            return error;
        });

        // logging iteration milestones
        if (i % 100 === 0) {
            console.log(`iterations: ${i}, error: ${error_rounded}`);
        }

        // breaking if our error is zero to a specific significance
        // or the iteration count is 5000 iterations
        if (error_rounded === 0 || !error_rounded || i === 5000) {
            let final_message = ``;
            final_message += `iterations: ${i} \n`;
            final_message += `error term: ${error_rounded} \n`;
            final_message += `formula: ${x.dataSync()}*a + ${y.dataSync()}*b + ${z.dataSync()}*c = d`;
            console.log(final_message);
            break;
        }
    }

    // resolving the promise
    resolve();
});
