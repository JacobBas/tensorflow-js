// IMPORTS
import * as _Preact from "https://cdn.skypack.dev/preact@10.4.7";
import * as _Hooks from "https://cdn.skypack.dev/preact@10.4.7/hooks";
import htm from "https://cdn.skypack.dev/htm@3.0.4";
import "https://cdnjs.cloudflare.com/ajax/libs/uuid/8.1.0/uuidv4.min.js";

// EXPORTS
export const html = htm.bind(_Preact.h);
export const Preact = _Preact;
export const Hooks = _Hooks;

// PAGE FUNCTION
const Page = () => {
    // setting the state
    const [premium, setPremium] = _Hooks.useState([
        [8000, 10000],
        [7000, 4000],
    ]);
    const [exposure, setExposure] = _Hooks.useState([
        [10, 20],
        [10, 10],
    ]);
    const [loss, setLoss] = _Hooks.useState([
        [9000, 10000],
        [4000, 3000],
    ]);
    const [currentRels, setCurrentRels] = _Hooks.useState({
        male: 1.0,
        female: 0.5,
        urban: 1.0,
        rural: 1.25,
    });
    const [lossCost, setLossCost] = _Hooks.useState([
        [1, 1],
        [1, 1],
    ]);
    const [lossRatios, setLossRatios] = _Hooks.useState([
        [1, 1],
        [1, 1],
    ]);
    const [baseSeg, setBaseSeg] = _Hooks.useState([0, 0]);
    const [lossRatioRel, setLossRatioRel] = _Hooks.useState([
        [1, 1],
        [1, 1],
    ]);
    const [solvedMessage, setSolvedMessage] = _Hooks.useState("");

    // handler functions
    const solveRels = () => {
        new Promise((resolve) => {
            // creating the system of equations to solve
            // we want to create something with 3 equations and 3 unknowns
            // ax + by + cz = d
            let baseRate = tf.tensor(
                [
                    lossCost[0][0] + lossCost[0][1],
                    lossCost[1][0] + lossCost[1][1],
                    lossCost[0][0] + lossCost[1][0],
                    lossCost[0][1] + lossCost[1][1],
                ],
                [4, 1]
            );
            let male_urban = tf.tensor([lossCost[0][0], 0, 0, 0], [4, 1]);
            let male_rural = tf.tensor([lossCost[0][0], 0, 0, 0], [4, 1]);
            let female_urban = tf.tensor([0, lossCost[0][0], 0, 0], [4, 1]);
            let female_rural = tf.tensor([0, lossCost[0][0], 0, 0], [4, 1]);
            let urban_male = tf.tensor([0, 0, lossCost[0][0], 0], [4, 1]);
            let urban_female = tf.tensor([0, 0, lossCost[0][0], 0], [4, 1]);
            let rural_male = tf.tensor([0, 0, 0, lossCost[0][0]], [4, 1]);
            let rural_female = tf.tensor([0, 0, 0, lossCost[0][0]], [4, 1]);

            // creating the variables that we want to solve for and
            // setting the starting values for them
            let male_rel = tf.variable(tf.tensor([currentRels.male]));
            let female_rel = tf.variable(tf.tensor([currentRels.female]));
            let urban_rel = tf.variable(tf.tensor([currentRels.urban]));
            let rural_rel = tf.variable(tf.tensor([currentRels.rural]));

            // creating the function from the tensors
            function func() {
                let item1 = male_urban.mul(male_rel).mul(urban_rel);
                let item2 = male_rural.mul(male_rel).mul(rural_rel);
                let item3 = female_urban.mul(female_rel).mul(urban_rel);
                let item4 = female_rural.mul(female_rel).mul(rural_rel);
                let item5 = urban_male.mul(male_rel).mul(urban_rel);
                let item6 = urban_female.mul(female_rel).mul(urban_rel);
                let item7 = rural_male.mul(male_rel).mul(rural_rel);
                let item8 = rural_female.mul(female_rel).mul(rural_rel);

                return item1.add(item2).add(item3).add(item4).add(item5).add(item6).add(item7).add(item8);
            }

            // creating our loss optimizing function
            const mse = (baseRate, baseRate_hat) => {
                return baseRate_hat.sub(baseRate).square().mean();
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
                    let error = mse(baseRate, func());
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
                    final_message += `iterations:    ${i} \n`;
                    final_message += `squared error: ${error_rounded} \n`;
                    final_message += `male rel:      ${Math.round(1000 * male_rel.dataSync()) / 1000} \n`;
                    final_message += `female rel:    ${Math.round(1000 * female_rel.dataSync()) / 1000} \n`;
                    final_message += `urban rel:     ${Math.round(1000 * urban_rel.dataSync()) / 1000} \n`;
                    final_message += `rural rel:     ${Math.round(1000 * rural_rel.dataSync()) / 1000} \n`;
                    setSolvedMessage(final_message);
                    break;
                }
            }

            // resolving the promise
            resolve();
        });
    };

    // reactive effects
    _Hooks.useEffect(() => {
        setLossCost([
            [
                Math.round((100 * loss[0][0]) / exposure[0][0]) / 100,
                Math.round((100 * loss[0][1]) / exposure[0][1]) / 100,
            ],
            [
                Math.round((100 * loss[1][0]) / exposure[1][0]) / 100,
                Math.round((100 * loss[1][1]) / exposure[1][1]) / 100,
            ],
        ]);
    }, [loss, exposure]);

    _Hooks.useEffect(() => {
        setLossRatios([
            [
                Math.round((1000 * loss[0][0]) / premium[0][0]) / 1000,
                Math.round((1000 * loss[0][1]) / premium[0][1]) / 1000,
            ],
            [
                Math.round((1000 * loss[1][0]) / premium[1][0]) / 1000,
                Math.round((1000 * loss[1][1]) / premium[1][1]) / 1000,
            ],
        ]);
    }, [premium, loss]);

    _Hooks.useEffect(() => {
        setLossRatioRel([
            [
                Math.round((1000 * lossRatios[0][0]) / lossRatios[baseSeg[0]][baseSeg[1]]) / 1000,
                Math.round((1000 * lossRatios[0][1]) / lossRatios[baseSeg[0]][baseSeg[1]]) / 1000,
            ],
            [
                Math.round((1000 * lossRatios[1][0]) / lossRatios[baseSeg[0]][baseSeg[1]]) / 1000,
                Math.round((1000 * lossRatios[1][1]) / lossRatios[baseSeg[0]][baseSeg[1]]) / 1000,
            ],
        ]);
    }, [lossRatios, baseSeg]);

    // returning the html
    return html`
        <h1>Minimum Biased Procedure</h1>

        <div class="tables-container">
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th colspan="3">Premium Table</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Urban</th>
                        <th>Rural</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>
                            <input
                                type="number"
                                value=${premium[0][0]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_premium = [...premium];
                                    new_premium[0][0] = e.target.value;
                                    setPremium(new_premium);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value=${premium[0][1]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_premium = [...premium];
                                    new_premium[0][1] = e.target.value;
                                    setPremium(new_premium);
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>
                            <input
                                type="number"
                                value=${premium[1][0]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_premium = [...premium];
                                    new_premium[1][0] = e.target.value;
                                    setPremium(new_premium);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value=${premium[1][1]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_premium = [...premium];
                                    new_premium[1][1] = e.target.value;
                                    setPremium(new_premium);
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="matrix-table">
                <thead>
                    <tr>
                        <th colspan="3">Exposure Table</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Urban</th>
                        <th>Rural</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>
                            <input
                                type="number"
                                value=${exposure[0][0]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_exposure = [...exposure];
                                    new_exposure[0][0] = e.target.value;
                                    setExposure(new_exposure);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value=${exposure[0][1]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_exposure = [...exposure];
                                    new_exposure[0][1] = e.target.value;
                                    setExposure(new_exposure);
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>
                            <input
                                type="number"
                                value=${exposure[1][0]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_exposure = [...exposure];
                                    new_exposure[1][0] = e.target.value;
                                    setExposure(new_exposure);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value=${exposure[1][1]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_exposure = [...exposure];
                                    new_exposure[1][1] = e.target.value;
                                    setExposure(new_exposure);
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="matrix-table">
                <thead>
                    <tr>
                        <th colspan="3">Loss Table</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Urban</th>
                        <th>Rural</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>
                            <input
                                type="number"
                                value=${loss[0][0]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_loss = [...loss];
                                    new_loss[0][0] = e.target.value;
                                    setLoss(new_loss);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value=${loss[0][1]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_loss = [...loss];
                                    new_loss[0][1] = e.target.value;
                                    setLoss(new_loss);
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>
                            <input
                                type="number"
                                value=${loss[1][0]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_loss = [...loss];
                                    new_loss[1][0] = e.target.value;
                                    setLoss(new_loss);
                                }}
                            />
                        </td>
                        <td>
                            <input
                                type="number"
                                value=${loss[1][1]}
                                onInput=${(e) => {
                                    e.preventDefault();
                                    let new_loss = [...loss];
                                    new_loss[1][1] = e.target.value;
                                    setLoss(new_loss);
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="matrix-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Current Relativity</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>
                            <input
                                type="number"
                                value=${currentRels.male}
                                step=".01"
                                onInput=${(e) => {
                                    e.preventDefault();
                                    setCurrentRels({
                                        ...currentRels,
                                        male: e.target.value,
                                    });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>
                            <input
                                type="number"
                                value=${currentRels.female}
                                step=".01"
                                onInput=${(e) => {
                                    e.preventDefault();
                                    setCurrentRels({
                                        ...currentRels,
                                        female: e.target.value,
                                    });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Urban</th>
                        <td>
                            <input
                                type="number"
                                value=${currentRels.urban}
                                step=".01"
                                onInput=${(e) => {
                                    e.preventDefault();
                                    setCurrentRels({
                                        ...currentRels,
                                        urban: e.target.value,
                                    });
                                }}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th>Rural</th>
                        <td>
                            <input
                                type="number"
                                value=${currentRels.rural}
                                step=".01"
                                onInput=${(e) => {
                                    e.preventDefault();
                                    setCurrentRels({
                                        ...currentRels,
                                        rural: e.target.value,
                                    });
                                }}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table class="matrix-table">
                <thead>
                    <tr>
                        <th colspan="3">Loss Cost/Pure Premium Table</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Urban</th>
                        <th>Rural</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>${lossCost[0][0]}</td>
                        <td>${lossCost[0][1]}</td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>${lossCost[1][0]}</td>
                        <td>${lossCost[1][1]}</td>
                    </tr>
                </tbody>
            </table>

            <table class="matrix-table">
                <thead>
                    <tr>
                        <th colspan="3">Loss Ratio Table</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Urban</th>
                        <th>Rural</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>${lossRatios[0][0]}</td>
                        <td>${lossRatios[0][1]}</td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>${lossRatios[1][0]}</td>
                        <td>${lossRatios[1][1]}</td>
                    </tr>
                </tbody>
            </table>

            <table class="matrix-table">
                <thead>
                    <tr>
                        <th colspan="3">Loss Ratio Relativity Table</th>
                    </tr>
                    <tr>
                        <th></th>
                        <th>Urban</th>
                        <th>Rural</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>Male</th>
                        <td>${lossRatioRel[0][0]}</td>
                        <td>${lossRatioRel[0][1]}</td>
                    </tr>
                    <tr>
                        <th>Female</th>
                        <td>${lossRatioRel[1][0]}</td>
                        <td>${lossRatioRel[1][1]}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="calculations">
            <h2>Starting equations</h2>
            <div class="function-container">
                <p class="function">
                    ${lossCost[0][0]} + ${lossCost[0][1]} = ${lossCost[0][0]} * (male * urban + male * rural) =
                    ${lossCost[0][0]} * (${currentRels.male} * ${currentRels.urban} + ${currentRels.male} *
                    ${currentRels.rural})
                </p>
                <p class="function">
                    ${lossCost[1][0]} + ${lossCost[1][1]} = ${lossCost[0][0]} * (female * urban + female * rural) =
                    ${lossCost[0][0]} * (${currentRels.female} * ${currentRels.urban} + ${currentRels.female} *
                    ${currentRels.rural})
                </p>
                <p class="function">
                    ${lossCost[0][0]} + ${lossCost[1][0]} = ${lossCost[0][0]} * (urban * male + urban * female) =
                    ${lossCost[0][0]} * (${currentRels.urban} * ${currentRels.male} + ${currentRels.urban} *
                    ${currentRels.female})
                </p>
                <p class="function">
                    ${lossCost[0][1]} + ${lossCost[1][1]} = ${lossCost[0][0]} * (rural * male + rural * female) =
                    ${lossCost[0][0]} * (${currentRels.rural} * ${currentRels.male} + ${currentRels.rural} *
                    ${currentRels.female})
                </p>
            </div>

            <div class="function-container" style=${{ marginTop: "2rem", paddingTop: "1rem" }}>
                <button onClick=${solveRels}>Solve for relativities</button>
                <pre class="function">${solvedMessage}</pre>
            </div>
        </div>
    `;
};

// RENDERING THE PAGE
_Preact.render(html`<${Page} />`, document.getElementById("root"));
