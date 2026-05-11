class Enigmamaskine {
    constructor(plugboard, reflector, rotors) {
        this.plugboard = new Plugboard();
        this.reflector = new Reflector();
        this.rotors = [new Rotor1(), new Rotor2(), new Rotor3()];
    }
}

class Plugboard {
    constructor(connections) {
        this.connections = {};
    }
}

// RotorTemplate creates a template class for the reflector and rotor, where each can make their own modifications.
class RotorTemplate {
    constructor(wiring, notch, id, alphabet) {
        this.wiring = wiring;
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
    addHTML(htmlString, parent=document.getElementById("enigmaTableBody")) {
        parent.insertAdjacentHTML('beforeend', htmlString);
    }

    // Removes HTML from the table body.
    removeHTML(id) {
        const element = document.getElementById(id.toString());
        console.log(element + " removed");
        element.remove();
    }

    shiftArray(direction) {
        // Only rotate this instance.
        if (this.id == null) return;

        if (!Array.isArray(this.wiring) || this.wiring.length === 0) return;

        if (direction === "R") {
            this.wiring.unshift(this.wiring.pop());
            this.alphabet.unshift(this.alphabet.pop());
        }
        else if (direction === "L") {
            this.wiring.push(this.wiring.shift());
            this.alphabet.push(this.alphabet.shift());
        }
        
    }

}


class Reflector extends RotorTemplate {
    constructor(wiring, notch, id, alphabet) {
        super(wiring, notch, id, alphabet);
    }
}

class Rotor extends RotorTemplate {
    constructor(wiring, notch, id, alphabet) {
        super(wiring, notch, id, alphabet);
        this.wiring = Array.isArray(wiring) ? wiring : [];
        this.notch = notch;
    }
}



//////////////////////////////////////////////////////////////

let rotors = [];
let jsonData;


// Get the JSON data and store it in a global variable for later use in the application.
async function init() {
    const res = await fetch('../json/mechanicals.json');
    jsonData = await res.json();

    window.jsonData = jsonData;
}

init();

function addRotor(wiring, notch) {
    const wiringArray = Array.isArray(wiring) ? wiring : [];
    const secondRowValues = wiringArray.length === 10
        ? ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
        : Array.from({ length: wiringArray.length }, (_, index) => String.fromCharCode(65 + index));

    const rotor = new Rotor(wiring, notch, "rotor" + (rotors.length).toString() + "id", secondRowValues);
    const headerRow = `
        <tr>
            <td class="fillerCell"></td>
            <td colspan="26" class="headerRow"><select class="RRselector" id="${rotor.id}Selector"><option>ROTOR I</option><option>ROTOR II</option><option>ROTOR III</option><option>ROTOR IV</option><option>ROTOR V</option><option>ROTOR VI</option><option>ROTOR VII</option><option>ROTOR VIII</option></select></td>
            <td class="fillerCell"></td>
        </tr>`;
    
    const leftArrowCell = `<td rowspan="2"><button id="${rotor.id}Left" class="arrowButton">←</button></td>`;
    const rightArrowCell = `<td rowspan="2"><button id="${rotor.id}Right" class="arrowButton">→</button></td>`;

    const topCells = wiringArray.map(element => {
        const displayElement = wiringArray.length === 10 ? element.substring(1) : element;
        return `<td class="tableCell">${displayElement}</td>`;
    }).join('');

    const secondRowCells = secondRowValues.map((value) => {
        const notchClass = value === notch ? ' class="notchedCell tableCell"' : ' class="tableCell"';
        return `<td${notchClass}>${value}</td>`;
    }).join('');

    rotor.addHTML(`
        <div id="${rotor.id}">
            ${headerRow}
            <tr class="alphabetRow" id="${rotor.id}TopRow">
                ${leftArrowCell}
                ${topCells}
                ${rightArrowCell}
            </tr>
            <tr class="alphabetRow" id="${rotor.id}BottomRow">
                ${secondRowCells}
            </tr>
        </div>
    `);

    const leftButton = document.getElementById(`${rotor.id}Left`);
    const rightButton = document.getElementById(`${rotor.id}Right`);


    if (leftButton) {
        leftButton.addEventListener('click', (event) => {
            const buttonId = event.currentTarget.id;
            const id = buttonId.replace(/Left$/, '');
            rotor.shiftArray("L");
            tableShift(id, "L");
        });
    }

    if (rightButton) {
        rightButton.addEventListener('click', (event) => {
            const buttonId = event.currentTarget.id;
            const id = buttonId.replace(/Right$/, '');
            rotor.shiftArray("R");
            tableShift(id, "R");
        });
    }


    rotors.push(rotor);

}

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

function tableShift(id, direction) {
    const topRow = document.getElementById(`${id}TopRow`);
    const bottomRow = document.getElementById(`${id}BottomRow`);

    //Define the cells that need to be shifted. The bottom row does not have the first and last cells, so we ignore the slice there
    const topCells = Array.from(topRow.children).slice(1, -1);
    const bottomCells = Array.from(bottomRow.children);
    //If we shift to the right
    if (direction === "R") {
        //Insert the last cell before the first cell, disregarding the arrow cell
        topRow.insertBefore(topCells[topCells.length - 1], topCells[0]);
        bottomRow.insertBefore(bottomCells[bottomCells.length - 1], bottomCells[1]);
    }
    else if (direction === "L") {
        topRow.insertBefore(topCells[0], topRow.lastElementChild);
        bottomRow.insertBefore(bottomCells[0], bottomRow[bottomRow.length-1]);
        console.log(bottomCells[0]);
    }
    

}