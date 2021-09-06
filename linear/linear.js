// walkthrough for this here: https://js.tensorflow.org/api/latest/#train.sgd
new Promise((resolve) => {
    // creating the data
    let data = [];
    for (let i = 0; i < 4; i += 0.04) {
        let sign = (-1) ** Math.round(Math.random());
        let noise = Math.min(Math.random() / Math.random(), 20) * sign;
        let y = Math.exp(i) + noise;
        data.push({
            x: i,
            y: y,
        });
    }

    resolve(data);
})
    .then((data) => {
        // creating the tensors from the data
        console.log();
        let xTensor = tf.tensor(
            data.map((d) => {
                return [d.x];
            })
        );

        let yTensor = tf.tensor(
            data.map((d) => {
                return [d.y];
            })
        );

        // returning out the tensors
        return { x: xTensor, y: yTensor };
    })
    .then((tensors) => {
        // defining the initial slope and intercept
        let slope = tf.variable(tf.tensor([0]));
        let intercept = tf.variable(tf.tensor([0]));
        // creating the function y = mx + b
        const f = (x) => {
            return x.mul(slope).add(intercept);
        };

        // creating the loss function
        const mse = (y_hat, y) => {
            return y_hat.sub(y).square().mean();
        };

        // setting the learning rate
        const learnRate = 0.1;
        // setting the descent optimizer
        const optimizer = tf.train.sgd(learnRate);

        // training the model
        let errors = [];
        for (let i = 0; i < 150; i++) {
            optimizer.minimize(() => {
                error = mse(f(tensors.x), tensors.y);
                errors.push(error.dataSync());
                return error;
            });
        }

        // returning out the finalized values
        return {
            x: tensors.x.dataSync(),
            y: tensors.y.dataSync(),
            y_hat: f(tensors.x).dataSync(),
            slope: slope.dataSync(),
            intercept: intercept.dataSync(),
            errors: errors,
        };
    })
    .then((final) => {
        // creating the plot data
        const plot_data = [];
        final.x.forEach((_, i) => {
            plot_data.push({ x: final.x[i], y: final.y[i], y_hat: final.y_hat[i] });
        });

        // plotting the data to the screen using d3.js
        let svg = d3.create("svg").attr("height", "600").attr("width", " 800");

        // creating the x range and axis
        let x_range = d3
            .scaleLinear()
            .domain([0, d3.max(final.x, (d) => d)])
            .range([0, 750]);
        svg.append("g")
            .attr("transform", `translate(40, ${500 - 40})`)
            .call(
                d3
                    .axisBottom(x_range)
                    .ticks(750 / 50)
                    .tickSizeOuter(0)
            );

        // creating the y range and axis
        let y_range = d3
            .scaleLinear()
            .domain([d3.max(final.y, (d) => d), 0])
            .range([0, 500 - 50]);
        svg.append("g")
            .attr("transform", `translate(40, 10)`)
            .call(
                d3
                    .axisLeft(y_range)
                    .ticks(500 / 50)
                    .tickSizeOuter(0)
            );

        // plotting the true points
        svg.append("g")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("fill", "none")
            .selectAll("cirlce")
            .data(plot_data)
            .join("circle")
            .attr("cx", (d) => x_range(d.x) + 40)
            .attr("cy", (d) => y_range(d.y) + 10)
            .attr("r", 3);

        // plotiting the fitted points
        svg.append("g")
            .attr("stroke", "orange")
            .attr("stroke-width", 3)
            .attr("fill", "none")
            .selectAll("cirlce")
            .data(plot_data)
            .join("circle")
            .attr("cx", (d) => x_range(d.x) + 40)
            .attr("cy", (d) => y_range(d.y_hat) + 10)
            .attr("r", 3);

        // adding chart to the DOM
        document.getElementById("chart").appendChild(svg.node());
        console.log(final);
    });
