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
        [800, 1000],
        [700, 400],
    ]);
    const [loss, setLoss] = _Hooks.useState([
        [900, 1000],
        [400, 300],
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

    // reactive effects
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
                Math.round(
                    (1000 * lossRatios[0][0]) / lossRatios[baseSeg[0]][baseSeg[1]]
                ) / 1000,
                Math.round(
                    (1000 * lossRatios[0][1]) / lossRatios[baseSeg[0]][baseSeg[1]]
                ) / 1000,
            ],
            [
                Math.round(
                    (1000 * lossRatios[1][0]) / lossRatios[baseSeg[0]][baseSeg[1]]
                ) / 1000,
                Math.round(
                    (1000 * lossRatios[1][1]) / lossRatios[baseSeg[0]][baseSeg[1]]
                ) / 1000,
            ],
        ]);
    }, [lossRatios, baseSeg]);

    // returning the html
    return html`
        <h1>Minimum Biased Procedure</h1>

        <table>
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

        <table>
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

        <table>
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

        <table>
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
    `;
};

// RENDERING THE PAGE
_Preact.render(html`<${Page} />`, document.getElementById("root"));
