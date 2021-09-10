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
    const [premium, setPremium] = _Hooks.useState([
        [800, 1000],
        [700, 400],
    ]);
    const [loss, setLoss] = _Hooks.useState([
        [900, 1000],
        [400, 300],
    ]);

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
                    <th>Male</th>
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
                    <td><input type="number" value=${loss[0][0]} /></td>
                    <td><input type="number" value=${loss[0][1]} /></td>
                </tr>
                <tr>
                    <th>Male</th>
                    <td><input type="number" value=${loss[1][0]} /></td>
                    <td><input type="number" value=${loss[1][1]} /></td>
                </tr>
            </tbody>
        </table>
    `;
};

// RENDERING THE PAGE
_Preact.render(html`<${Page} />`, document.getElementById("root"));
