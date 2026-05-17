class Enigmamaskine {
    constructor(plugboard, reflector, rotors) {
        this.plugboard = plugboard;
        this.reflector = reflector;
        this.rotors = rotors;
    }
}

// RotorTemplate creates a template class for the reflector and rotor, where each can make their own modifications.
class RotorTemplate {
    constructor(wiring, notch, id, alphabet) {
        this.wiring = Array.isArray(wiring) ? wiring : [];
        this.notch = notch;
        this.id = id;
        this.alphabet = Array.isArray(alphabet) ? alphabet : [];

    }

    // Not important right now
    elementFromHTML(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
    }

    // Injects HTML into the table body, which allows for a dynamic encryption.
    addHTML(htmlString, parent) {
        parent.insertAdjacentHTML('beforeend', htmlString);
    }

    // Removes HTML from the table body.
    removeHTML(id) {

        // Finds the appropriate element by id, and removes it from the table body.
        const element = document.getElementById(id.toString());
        console.log(element + " removed");
        element.remove();

        // Removes the rotor from the rotors array.
        for (let i = 0; i < rotors.length; i++) {
            if (rotors[i].id === id) {
                rotors.splice(i, 1);
                break;
            }
        }
    }

    shiftRotor(shift, id) {
        // Find the rotor rotor that needs to be shifted by id.
        const rotor = rotors.find((r) => r.id === id);

        if (rotor) {
            const shiftedWiring = rotor.wiring.slice(shift).concat(rotor.wiring.slice(0, shift));
            const shiftedAlphabet = rotor.alphabet.slice(shift).concat(rotor.alphabet.slice(0, shift));
            rotor.wiring = shiftedWiring;
            rotor.alphabet = shiftedAlphabet;
        }
    }

}

class Plugboard {
    constructor(connections=[], alphabet=jsonData.rotors.alphabet) {
        this.connections = Array.isArray(connections) ? connections : [];
        this.alphabet = Array.isArray(alphabet) ? alphabet : [];
    }

     // Injects HTML into the table body, which allows for a dynamic encryption.
    addHTML(htmlString, parent) {
        parent.insertAdjacentHTML('beforeend', htmlString);
    }
}

class Reflector extends RotorTemplate {
    constructor(wiring, alphabet) {
        super(wiring, null, "reflectorId", alphabet);
        this.wiring = Array.isArray(wiring) ? wiring : [];
        this.notch = null;
        this.alphabet = Array.isArray(alphabet) ? alphabet : [];
        
    }
}

class Rotor extends RotorTemplate {
    constructor(wiring, notch, id, alphabet) {
        super(wiring, notch, id, alphabet);
        this.wiring = Array.isArray(wiring) ? wiring : [];
        this.notch = notch;
        this.id = id;
        this.alphabet = Array.isArray(alphabet) ? alphabet : [];
    }
}

//////////////////////////////////////////////////////////////

let mainPlugboard;
let mainReflector;
let rotors = [];
let jsonData;
const inputField = document.getElementById("inputField");
const outputDiv = document.getElementById("OutputDiv");
let inputText = "";
let outputText = "";
var inputFieldSize = 0;



// Get the JSON data and store it in a global variable for later use in the application.
async function init() {
    // Wait for the promise
    const res = await fetch('../json/mechanicals.json');
    // Set the variable equal to the response of the promise, which is the JSON data.
    jsonData = await res.json();

    // Also set this value, so i can access it in the console.
    window.jsonData = jsonData;
    generateTable();
}

init();

// Function that adds a rotor to the bottom of the table according to the wiring and notch parameters. Id and alphabet are generated automatically.
function addRotor(wiring, notch, alphabet) {

    /// Create the table including boxes, arrows and header.

    // If the wiring is not an array, we set it to an empty array to avoid errors.
    const wiringArray = Array.isArray(wiring) ? wiring : [];

    // Create rotor object using the Rotor class, which is mainly controlled by the RotorTemplate class. Id and alphabet are generated automatically.
    const rotor = new Rotor(wiring, notch, "rotor" + (rotors.length).toString() + "id", alphabet);

    // Define the HTML for the header row. The selector gets an id based on the rotor id.
    const headerRow = `
        <tr>
            <td class="fillerCell"></td>
            <td colspan="26" class="headerRow">
                <select class="RRselector" id="${rotor.id}Selector">
                    <option value="rotor.historical.I">ROTOR I</option>
                    <option value="rotor.historical.II">ROTOR II</option>
                    <option value="rotor.historical.III">ROTOR III</option>
                    <option value="rotor.historical.IV">ROTOR IV</option>
                    <option value="rotor.historical.V">ROTOR V</option>
                    <option value="rotor.historical.VI">ROTOR VI</option>
                    <option value="rotor.historical.VII">ROTOR VII</option>
                    <option value="rotor.historical.VIII">ROTOR VIII</option>
                </select>
            </td>
            <td class="fillerCell"></td>
        </tr>`;
    
    // Define the HTML for the arrow cells, that turn the rotors and/or reflectors, with specific ids for each rotors arrow.
    const leftArrowCell = `<td rowspan="2"><button id="${rotor.id}Left" class="arrowButton">←</button></td>`;
    const rightArrowCell = `<td rowspan="2"><button id="${rotor.id}Right" class="arrowButton">→</button></td>`;

    // Generates the top row of cells based on the json data. if its 10 long its replaced with numbers.
    const topCells = wiringArray.map(element => {
        const displayElement = wiringArray.length === 10 ? element.substring(1) : element;
        return `<td class="tableCell">${displayElement}</td>`;
    }).join('');

    // Creates the second row of cells, where the cell with the value equal to the notch gets a different class.
    const secondRowCells = alphabet.map((value) => {
        const notchClass = value === notch ? ' class="notchedCell tableCell"' : ' class="tableCell"';
        return `<td${notchClass}>${value}</td>`;
    }).join('');

    // Add the html to the table body in the correct structure.
    rotor.addHTML(`
        <tbody id="${rotor.id}">
            ${headerRow}
            <tr class="alphabetRow" id="${rotor.id}TopRow">
                ${leftArrowCell}
                ${topCells}
                ${rightArrowCell}
            </tr>
            <tr class="alphabetRow" id="${rotor.id}BottomRow">
                ${secondRowCells}
            </tr>
        </tbody>
    `, document.getElementById("enigmaTable"));

    /// Modify the rotor object to include the appropriate event listeners for the arrows and selector.
    const leftArrow = document.getElementById(`${rotor.id}Left`);
    const rightArrow = document.getElementById(`${rotor.id}Right`);

    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            // Step rotor of rotor.id once to the left
            stepRotor(1, rotor.id);
        });
    }

    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            // Step rotor of rotor.id 25 times to the left, which is the same as stepping it once to the right.
            stepRotor(25, rotor.id);
        });
    }

    // Adds eventlistener to the selector which updates the rotor according to the selected value.
    const selector = document.getElementById(`${rotor.id}Selector`);
    if (selector) {
        selector.addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            updateRotorFromArray(rotor, jsonData.rotors.historical[selectedValue.split('.').pop()].wiring, jsonData.rotors.alphabet, jsonData.rotors.historical[selectedValue.split('.').pop()].notch);
            console.log("Rotor update attempted!");
        });
    }

    rotors.push(rotor);

}

// Function that adds a relfector with the appropriate wiring and alphabet. The structure is appended to the last element in the enigmaTable.
function addReflector(wiring, alphabet) {

    const wiringArray = Array.isArray(wiring) ? wiring : [];

    const reflector = new Reflector(wiring, alphabet);

    // Define the HTML for the header row. The selector gets an id based on the reflector id.
    const headerRow = `
        <tr>
            <td class="fillerCell"></td>
            <td colspan="26" class="headerRow">
                <select class="RRselector" id="${reflector.id}Selector">
                    <option value="reflector.historical.A" >REFLECTOR A</option>
                    <option value="reflector.historical.B" >REFLECTOR B</option>
                    <option value="reflector.historical.C" >REFLECTOR C</option>
                </select>
            </td>
            <td class="fillerCell"></td>
        </tr>`; 

    // Define arrow cells, which are the same as for the rotors, but with the reflector id instead of the rotor id.
    const leftArrowCell = `<td rowspan="2"><button id="${reflector.id}Left" class="arrowButton">←</button></td>`;
    const rightArrowCell = `<td rowspan="2"><button id="${reflector.id}Right" class="arrowButton">→</button></td>`;

    // Generate the cells for the top and bottom row, which are based on the wiring and alphabet arrays respectively.
    const alphabetCells = alphabet.map(element => `<td class="tableCell">${element}</td>`).join('');
    const wiringCells = wiring.map(element => `<td class="tableCell">${element}</td>`).join('');

    // The html that will be injected to create the reflector.
    reflector.addHTML(`
        <tbody id="${reflector.id}">
            ${headerRow}
            <tr class="alphabetRow" id="${reflector.id}TopRow">
                ${leftArrowCell}
                ${alphabetCells}
                ${rightArrowCell}
            </tr>
            <tr class="alphabetRow" id="${reflector.id}BottomRow">
                ${wiringCells}
            </tr>
        </tbody>
    `, document.getElementById("enigmaTable"));

    // Get the arrows to add eventlisteners
    const leftArrow = document.getElementById(`${reflector.id}Left`);
    const rightArrow = document.getElementById(`${reflector.id}Right`);

    // Add eventlisteners and functionality, namely stepping in accordance to direction.
    if (leftArrow) {
        leftArrow.addEventListener('click', () => {
            // Step reflector of reflector.id once to the left
            stepReflector(1, reflector.id);
        });
    }

    if (rightArrow) {
        rightArrow.addEventListener('click', () => {
            // Step reflector of reflector.id 25 times to the left, which is the same as stepping it once to the right.
            stepReflector(25, reflector.id);
        });
    }

    // Add eventlistener to the selector so it updates on reselection.
    const selector = document.getElementById(`${reflector.id}Selector`);

    if (selector) {
        selector.addEventListener('change', (event) => {
            const selectedValue = event.target.value;
            updateRotorFromArray(reflector, jsonData.reflectors.historical[selectedValue.split('.').pop()].wiring, jsonData.reflectors.alphabet, jsonData.reflectors.historical[selectedValue.split('.').pop()].notch);
        });
    }

    // Once the reflector is created it is assigned to the following global variable.
    mainReflector = reflector;

}

// Function that generates the plugboard, has a baseRow and tableRow.
function addPlugboard() {
    const plugboard = new Plugboard();

    const baseRow = jsonData.rotors.alphabet.map(element => `<td class="baseCell">${element}</td>`).join('');
    const connectionRow = jsonData.rotors.alphabet.map(element => `<td class="tableCell">${element}</td>`).join('');

    plugboard.addHTML(`
        <tbody id="plugboardId">
            <tr class="baseRow" id="plugboardBaseRow">
                <td class="fillerCell"></td>
                ${baseRow}
                <td class="fillerCell"></td>
            </tr>
            <tr class="alphabetRow" id="plugboardConnectionRow">
                <td class="fillerCell"></td>
                ${connectionRow}
                <td class="fillerCell"></td>
            </tr>
        </tbody>
    `, document.getElementById("enigmaTable"));

    mainPlugboard = plugboard;

    // Add click event listeners only to the top baseRow.
    const baseRowCells = document.querySelectorAll('#plugboardBaseRow .baseCell');
    
    const addRowListeners = (cells) => {
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const letter = cell.textContent;

                // If no connection yet, add this letter and select the cell
                if (plugboard.connections.length === 0) {
                    plugboard.connections.push(letter);
                    cell.classList.add('selectedCell');
                } else {
                    // If there's already one connection, swap and remove previous selection
                    const firstLetter = plugboard.connections[0];
                    const firstCell = Array.from(baseRowCells).find(c => c.textContent === firstLetter);

                    if (firstCell) {
                        firstCell.classList.remove('selectedCell');
                    }

                    // Swap the letters in the alphabet array
                    const firstIndex = plugboard.alphabet.indexOf(firstLetter);
                    const secondIndex = plugboard.alphabet.indexOf(letter);

                    if (firstIndex !== -1 && secondIndex !== -1) {
                        [plugboard.alphabet[firstIndex], plugboard.alphabet[secondIndex]] = [plugboard.alphabet[secondIndex], plugboard.alphabet[firstIndex]];

                        // Update only the top baseRow to reflect the swap
                        baseRowCells.forEach((cell, index) => {
                            cell.textContent = plugboard.alphabet[index];
                        });
                    }

                    plugboard.connections = [];
                }

                    outputText = "";
                    for (const char of inputText) {
                        const encryptedChar = encryptLetter(char.toUpperCase());
                        outputText += encryptedChar ? encryptedChar : char;
                    }
                    outputDiv.textContent = outputText;

            });
        });
    };

    addRowListeners(baseRowCells);

}


/// All of these encrypts and decrypt functions do 2 things, check if the parameters are valid.
/// If they are, they find the letter in the appropriate row, and finds it in the opposite, and returns that index. The reflector is slightly different, compared to the rotors.

function encryptRotor(rotor, position) {
    if (!rotor || position < 0 || position >= rotor.wiring.length) return null;

    return rotor.alphabet.indexOf(rotor.wiring[position]);
}

function decryptRotor(rotor, position) {
    if (!rotor || position < 0 || position >= rotor.wiring.length) return null;

    return rotor.wiring.indexOf(rotor.alphabet[position]);
}

function encryptReflector(reflector, position) {
    if (!reflector || position < 0 || position >= reflector.wiring.length) return null;

    return reflector.wiring.indexOf(reflector.alphabet[position]);
}

function decryptReflector(reflector, position) {
    if (!reflector || position < 0 || position >= reflector.wiring.length) return null;

    return reflector.alphabet.indexOf(reflector.wiring[position]);
}

function encryptPlugboard(plugboard, position) {
    if (!plugboard || position < 0 || position >= plugboard.alphabet.length) return null;

    return plugboard.alphabet.indexOf(jsonData.reflectors.alphabet[position]);
}

function decryptPlugboard(plugboard, position) {
    if (!plugboard || position < 0 || position >= plugboard.alphabet.length) return null;

    return jsonData.reflectors.alphabet.indexOf(plugboard.alphabet[position]);
}

// Updates the cells in the table according to a new input of wiring and alphabet, on the rotor in the rotor parameter
function updateRotorFromArray(rotor, wiring, alphabet, newNotch) {
    // Preliminary checks to ensure that the elements exist.
    if (!rotor || !Array.isArray(wiring) || !Array.isArray(alphabet)) return;

    // Update the rotor object with the new wiring and alphabet.
    rotor.wiring = wiring;
    rotor.alphabet = alphabet;

    // Declare the elements as variables
    const topRow = document.getElementById(`${rotor.id}TopRow`);
    const bottomRow = document.getElementById(`${rotor.id}BottomRow`);
    // Check if they exist
    if (!topRow || !bottomRow) return;

    // Make a for loop equal to the amount of elements in the wiring, and update the text content of the appropriate cells in the table according to the new wiring and alphabet. The selector is used to determine which rotor is being updated, and thus which cells should be updated.
    for (let i = 0; i < rotor.wiring.length; i++) {
        // Assign the new data
        topRow.children[i+1].textContent = wiring[i];
        bottomRow.children[i].textContent = alphabet[i];
        // Assigns the correct classes after the shift, so the notched cell is still higlighted. Should a new notch be provided, it will update the array accordinlgy.
        if (newNotch) {
        bottomRow.children[i].className = alphabet[i] === newNotch ? 'notchedCell tableCell' : 'tableCell';
        rotor.notch = newNotch;
        } else {
        bottomRow.children[i].className = alphabet[i] === rotor.notch ? 'notchedCell tableCell' : 'tableCell';
        }

    }

    outputText = "";
    for (const char of inputText) {
        const encryptedChar = encryptLetter(char.toUpperCase());
        outputText += encryptedChar ? encryptedChar : char;
    }
    outputDiv.textContent = outputText === "" ? "Output will appear here" : outputText;

}

// Combines the object function of stepping the array, with the function of updating the rotor from an array. This should rotate the rotor x steps to the left.
function stepRotor(steps, id) {
    let rotor;

    // Go from rotor id to rotor object.
    for (let i = 0; i < rotors.length; i++) {
        if (rotors[i].id === id) {
            rotor = rotors[i];
            break;
        }
    }

    // Shift the wiring and alphabet arrays in the correct rotor object.
    const shiftedWiring = rotor.wiring.slice(steps).concat(rotor.wiring.slice(0, steps));
    const shiftedAlphabet = rotor.alphabet.slice(steps).concat(rotor.alphabet.slice(0, steps));
    // Now update the table according to the new and updated arrays.
    updateRotorFromArray(rotor, shiftedWiring, shiftedAlphabet);
}

function stepReflector(steps, id) {
    let reflector;

    // Make the shift, which is the same as for the rotors, but on the main reflector object.
    const shiftedWiring = mainReflector.wiring.slice(steps).concat(mainReflector.wiring.slice(0, steps));
    const shiftedAlphabet = mainReflector.alphabet.slice(steps).concat(mainReflector.alphabet.slice(0, steps));

    updateRotorFromArray(mainReflector, shiftedWiring, shiftedAlphabet);
}

function generateTable() {

    const enigmaMachine = new Enigmamaskine();

    enigmaMachine.plugboard = addPlugboard();
    enigmaMachine.rotors = [
        addRotor(jsonData.rotors.historical.I.wiring, jsonData.rotors.historical.I.notch, jsonData.rotors.alphabet),
        addRotor(jsonData.rotors.historical.II.wiring, jsonData.rotors.historical.II.notch, jsonData.rotors.alphabet),
        addRotor(jsonData.rotors.historical.III.wiring, jsonData.rotors.historical.III.notch, jsonData.rotors.alphabet)
    ];
    enigmaMachine.reflector = addReflector(jsonData.reflectors.historical.A.wiring, jsonData.reflectors.alphabet);

    enigmaMachine.plugboard = mainPlugboard
    enigmaMachine.rotors = rotors;
    enigmaMachine.reflector = mainReflector;

    updateRotorFromArray(mainReflector, jsonData.reflectors.historical.A.wiring, jsonData.reflectors.alphabet, null);
    updateRotorFromArray(rotors[0], jsonData.rotors.historical.I.wiring, jsonData.rotors.alphabet, jsonData.rotors.historical.I.notch);
    updateRotorFromArray(rotors[1], jsonData.rotors.historical.II.wiring, jsonData.rotors.alphabet, jsonData.rotors.historical.II.notch);
    updateRotorFromArray(rotors[2], jsonData.rotors.historical.III.wiring, jsonData.rotors.alphabet, jsonData.rotors.historical.III.notch);

    mainEnigmaMachine = enigmaMachine;

}

function encryptLetter(letter) {
    // Remove the class from all cells (HTMLCollection is live, so loop until none remain)
    let encrypting = document.getElementsByClassName("encryptingCell");
    let decrypting = document.getElementsByClassName("decryptingCell");
    while (decrypting.length) {
        decrypting[0].classList.remove("decryptingCell");
    }
    while (encrypting.length) {
        encrypting[0].classList.remove("encryptingCell");
    }
    // This function should take a letter, and encrypt it according to the current configuration of the machine. It should return the encrypted letter.
    // First we need to find the index of the letter in the plugboard alphabet.
    var foo = mainEnigmaMachine.plugboard.alphabet.indexOf(letter);
    if (foo === -1) return null;

    // Deletes all previous lines in connectorLayer, so only the current encryption process is visualized.
    purgeConnectorLayer(); 

    // All following document.getElementById... are for the visualisation of the encryption, where the cells that are currently being encrypted are highlighted with a different class. The +1 and -1 are to account for the filler cell in the beginning of each row.
    document.getElementById("plugboardBaseRow").children[foo+1].classList.add("encryptingCell")
    document.getElementById("plugboardConnectionRow").children[foo+1].classList.add("encryptingCell")
    drawLineBetween("plugboardBaseRow", foo+1, "plugboardConnectionRow", foo+1, { hideStart: 8, hideEnd: 8, color:"#92221f"});

    drawLineBetween("plugboardConnectionRow", foo+1, rotors[0].id + "TopRow", foo+1, { hideStart: 8, hideEnd: 8, color:"#92221f"});
    drawLineBetween("rotor0idTopRow", foo+1, "rotor0idBottomRow", encryptRotor(mainEnigmaMachine.rotors[0], foo), { hideStart: 8, hideEnd: 8, color:"#92221f"});
    document.getElementById(rotors[0].id + "TopRow").children[foo+1].classList.add("encryptingCell")
    foo=encryptRotor(mainEnigmaMachine.rotors[0], foo);console.log("After rotor 0: " + foo);
    document.getElementById(rotors[0].id + "BottomRow").children[foo].classList.add("encryptingCell")

    drawLineBetween(rotors[0].id + "BottomRow", foo, rotors[1].id + "TopRow", foo+1, { hideStart: 8, hideEnd: 8, color:"#92221f"});
    drawLineBetween(rotors[1].id + "TopRow", foo+1, rotors[1].id + "BottomRow", encryptRotor(mainEnigmaMachine.rotors[1], foo), { hideStart: 8, hideEnd: 8, color:"#92221f"});
    document.getElementById(rotors[1].id + "TopRow").children[foo+1].classList.add("encryptingCell")
    foo=encryptRotor(mainEnigmaMachine.rotors[1], foo);console.log("After rotor 1: " + foo);
    document.getElementById(rotors[1].id + "BottomRow").children[foo].classList.add("encryptingCell")

    drawLineBetween(rotors[1].id + "BottomRow", foo, rotors[2].id + "TopRow", foo+1, { hideStart: 8, hideEnd: 8, color:"#92221f"});
    drawLineBetween(rotors[2].id + "TopRow", foo+1, rotors[2].id + "BottomRow", encryptRotor(mainEnigmaMachine.rotors[2], foo), { hideStart: 8, hideEnd: 8, color:"#92221f"});
    document.getElementById(rotors[2].id + "TopRow").children[foo+1].classList.add("encryptingCell")
    foo=encryptRotor(mainEnigmaMachine.rotors[2], foo);console.log("After rotor 2: " + foo);
    document.getElementById(rotors[2].id + "BottomRow").children[foo].classList.add("encryptingCell")

    drawLineBetween(rotors[2].id + "BottomRow", foo, mainEnigmaMachine.reflector.id + "BottomRow", foo, { hideStart: 8, hideEnd: 8, color:"#92221f"});
    drawLineBetween(mainEnigmaMachine.reflector.id + "BottomRow", foo, mainEnigmaMachine.reflector.id + "TopRow", encryptReflector(mainEnigmaMachine.reflector, foo)+1, { hideStart: 8, hideEnd: 8, color:"#92221f"});
    document.getElementById(mainEnigmaMachine.reflector.id + "BottomRow").children[foo].classList.add("encryptingCell")
    foo=encryptReflector(mainEnigmaMachine.reflector, foo);console.log("After reflector: " + foo);
    document.getElementById(mainEnigmaMachine.reflector.id + "TopRow").children[foo+1].classList.add("decryptingCell")

    drawLineBetween(mainEnigmaMachine.reflector.id + "TopRow", foo+1, rotors[2].id + "BottomRow", foo, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    drawLineBetween(rotors[2].id + "BottomRow", foo, rotors[2].id + "TopRow", decryptRotor(mainEnigmaMachine.rotors[2], foo)+1, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    document.getElementById(rotors[2].id + "BottomRow").children[foo].classList.add("decryptingCell")
    foo=decryptRotor(mainEnigmaMachine.rotors[2], foo);console.log("After rotor 2: " + foo);
    document.getElementById(rotors[2].id + "TopRow").children[foo+1].classList.add("decryptingCell")

    drawLineBetween(rotors[2].id + "TopRow", foo+1, rotors[1].id + "BottomRow", foo, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    drawLineBetween(rotors[1].id + "BottomRow", foo, rotors[1].id + "TopRow", decryptRotor(mainEnigmaMachine.rotors[1], foo)+1, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    document.getElementById(rotors[1].id + "BottomRow").children[foo].classList.add("decryptingCell")
    foo=decryptRotor(mainEnigmaMachine.rotors[1], foo);console.log("After rotor 1: " + foo);
    document.getElementById(rotors[1].id + "TopRow").children[foo+1].classList.add("decryptingCell")

    drawLineBetween(rotors[1].id + "TopRow", foo+1, rotors[0].id + "BottomRow", foo, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    drawLineBetween(rotors[0].id + "BottomRow", foo, rotors[0].id + "TopRow", decryptRotor(mainEnigmaMachine.rotors[0], foo)+1, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    document.getElementById(rotors[0].id + "BottomRow").children[foo].classList.add("decryptingCell")
    foo=decryptRotor(mainEnigmaMachine.rotors[0], foo);console.log("After rotor 0: " + foo);
    document.getElementById(rotors[0].id + "TopRow").children[foo+1].classList.add("decryptingCell")

    drawLineBetween(rotors[0].id + "TopRow", foo+1, "plugboardConnectionRow", foo+1, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});
    document.getElementById("plugboardConnectionRow").children[foo+1].classList.add("decryptingCell")
    foo=decryptPlugboard(mainEnigmaMachine.plugboard, foo);console.log("After plugboard: " + foo);
    document.getElementById("plugboardBaseRow").children[foo+1].classList.add("decryptingCell")
    drawLineBetween("plugboardConnectionRow", foo+1, "plugboardBaseRow", foo+1, { hideStart: 8, hideEnd: 8, color:"#2b9b14"});

    console.log("From " + letter + " to " + jsonData.reflectors.alphabet[foo]);
    return jsonData.reflectors.alphabet[foo];

}


inputField.addEventListener("input", (event) => {
    inputText = event.target.value;
    // Detect adding or removing characters by comparing previous size
    const newSize = inputText.length;
    const topRotor = rotors[0];
    const autoRotateCheckbox = document.getElementById("autoRotateCheck");
    // Only auto-rotate when the checkbox exists and is checked
    if (autoRotateCheckbox && autoRotateCheckbox.checked && typeof inputFieldSize === 'number' && topRotor) {
        const diff = newSize - inputFieldSize;
        if (diff > 0) {
            // added letters: step left once per added character
            for (let i = 0; i < diff; i++) stepRotor(1, topRotor.id);
        } else if (diff < 0) {
            // removed letters: step right once per removed character (25 left == 1 right)
            for (let i = 0; i < -diff; i++) stepRotor(25, topRotor.id);
        }
    }
    inputFieldSize = newSize;
    if (inputText === "") {
        outputDiv.textContent = "Output will appear here";
        return;
    }
    outputText = "";
    for (const char of inputText) {
        const encryptedChar = encryptLetter(char.toUpperCase());
        outputText += encryptedChar ? encryptedChar : char;
    }
    outputDiv.textContent = outputText;
});




//////

///// Drawing lines for animation - Mostly if not fully AI generated.

/////




// Ensure SVG covers the whole document and uses page coordinates
function ensureFullPageSVG() {
  const svg = document.getElementById("connectorLayer") ||
              document.body.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
  svg.id = "connectorLayer";
  svg.style.position = "absolute";
  svg.style.top = "0";
  svg.style.left = "0";
  svg.style.pointerEvents = "none";
  svg.style.zIndex = "9999";

  // Set SVG pixel dimensions to full document size so page coordinates map 1:1
  const w = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
  const h = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight);
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  return svg;
}

function getCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY
  };
}

function clearSVG(svg) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
}

// small helper: test whether a string is a valid CSS color (works for hex, rgb(), named colors, etc.)
function isValidCssColor(value) {
  if (!value || typeof value !== "string") return false;
  const s = new Option().style;
  s.color = "";
  s.color = value;
  return s.color !== "";
}

// Ensure the SVG exists and matches document size. Does NOT clear existing children.
function ensureFullPageSVG() {
  let svg = document.getElementById("connectorLayer");
  if (!svg) {
    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.id = "connectorLayer";
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.pointerEvents = "none";
    svg.style.zIndex = "9999";
    document.body.appendChild(svg);
  }

  const w = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
  const h = Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight);
  svg.setAttribute("width", w);
  svg.setAttribute("height", h);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);

  // ensure defs exists for masks
  let defs = svg.querySelector("defs");
  if (!defs) {
    defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    svg.appendChild(defs);
  }
  return svg;
}

function getCenter(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY
  };
}

function isValidCssColor(value) {
  if (!value || typeof value !== "string") return false;
  const s = new Option().style;
  s.color = "";
  s.color = value;
  return s.color !== "";
}

// Remove everything inside the connectorLayer (lines, masks, defs)
function purgeConnectorLayer() {
  const svg = document.getElementById("connectorLayer");
  if (!svg) return;
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  // recreate defs so future draws don't need to check
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  svg.appendChild(defs);
}

// Remove a single connector by id (id returned by drawLineBetween)
function removeConnector(connectorId) {
  const svg = document.getElementById("connectorLayer");
  if (!svg) return;
  const el = svg.querySelector(`[data-connector-id="${connectorId}"]`);
  if (el) el.remove();
  // also remove mask/defs with matching id if present
  const defs = svg.querySelector("defs");
  if (defs) {
    const mask = defs.querySelector(`#${connectorId}-mask`);
    if (mask) mask.remove();
  }
}

// Draw a single connector and append it to the SVG. Returns the connector id string.
function drawLineBetween(rowId1, colIndex1, rowId2, colIndex2, opts = {}) {
  const svg = ensureFullPageSVG();

  const row1 = document.getElementById(rowId1);
  const row2 = document.getElementById(rowId2);
  if (!row1 || !row2) return null;

  const cells1 = row1.querySelectorAll("td, th");
  const cells2 = row2.querySelectorAll("td, th");
  const cell1 = cells1[colIndex1];
  const cell2 = cells2[colIndex2];
  if (!cell1 || !cell2) return null;

  const p1 = getCenter(cell1);
  const p2 = getCenter(cell2);

  // unique connector id
  const connectorId = `connector-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // color handling
  const requestedColor = opts.color ?? opts.stroke ?? "red";
  const strokeColor = isValidCssColor(requestedColor) ? requestedColor : "red";
  const strokeW = opts.strokeWidth || 2;

  // create the line element
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", p1.x);
  line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x);
  line.setAttribute("y2", p2.y);
  line.setAttribute("stroke", strokeColor);
  line.setAttribute("stroke-width", strokeW);
  line.setAttribute("stroke-linecap", "butt");
  line.setAttribute("fill", "none");
  line.setAttribute("data-connector-id", connectorId);

  svg.appendChild(line);

  // create mask to hide ends (robust approach)
  requestAnimationFrame(() => {
    const total = line.getTotalLength();
    let hideStart = (typeof opts.hideStart === "number") ? opts.hideStart : null;
    let hideEnd   = (typeof opts.hideEnd   === "number") ? opts.hideEnd   : null;

    if (hideStart == null && typeof opts.hideStartPercent === "number") {
      hideStart = Math.max(0, Math.min(1, opts.hideStartPercent)) * total;
    }
    if (hideEnd == null && typeof opts.hideEndPercent === "number") {
      hideEnd = Math.max(0, Math.min(1, opts.hideEndPercent)) * total;
    }
    if (hideStart == null) hideStart = 5;
    if (hideEnd == null)   hideEnd   = 5;

    hideStart = Math.max(0, Math.min(hideStart, total));
    hideEnd   = Math.max(0, Math.min(hideEnd, total - hideStart));

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    const maskId = `${connectorId}-mask`;

    const mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
    mask.setAttribute("id", maskId);
    mask.setAttribute("maskUnits", "userSpaceOnUse");

    const whiteRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    whiteRect.setAttribute("x", 0);
    whiteRect.setAttribute("y", 0);
    whiteRect.setAttribute("width", Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth));
    whiteRect.setAttribute("height", Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight));
    whiteRect.setAttribute("fill", "white");
    mask.appendChild(whiteRect);

    function makeBlackRect(centerX, centerY, lengthAlong, thickness) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", -lengthAlong / 2);
      rect.setAttribute("y", -thickness / 2);
      rect.setAttribute("width", lengthAlong);
      rect.setAttribute("height", thickness);
      rect.setAttribute("fill", "black");
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      rect.setAttribute("transform", `translate(${centerX} ${centerY}) rotate(${angle})`);
      return rect;
    }

    const thickness = Math.max(strokeW + 2, strokeW * 1.5);

    const startCenterX = p1.x + ux * (hideStart / 2);
    const startCenterY = p1.y + uy * (hideStart / 2);
    const endCenterX = p2.x - ux * (hideEnd / 2);
    const endCenterY = p2.y - uy * (hideEnd / 2);

    if (hideStart > 0.5) mask.appendChild(makeBlackRect(startCenterX, startCenterY, hideStart, thickness));
    if (hideEnd > 0.5)   mask.appendChild(makeBlackRect(endCenterX, endCenterY, hideEnd, thickness));

    const defs = svg.querySelector("defs");
    defs.appendChild(mask);

    // apply mask to the line
    line.setAttribute("mask", `url(#${maskId})`);
  });

  return connectorId;
}

// keep svg sized on resize/scroll
let redrawTimer;
function redrawWrapper(...args) {
  clearTimeout(redrawTimer);
  redrawTimer = setTimeout(() => {
    ensureFullPageSVG();
    // if you want to automatically redraw connectors on resize/scroll,
    // you can store connector specs and re-run drawLineBetween for each.
  }, 50);
}
window.addEventListener("resize", redrawWrapper);
window.addEventListener("scroll", redrawWrapper);

