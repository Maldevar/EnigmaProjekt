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

// RotorTemplate is a base class for both Rotor and Reflector, as they share some common properties and methods.
class RotorTemplate {
    constructor(wiring, notch, id, alphabet) {
        this.wiring = [];
        this.notch = 0;
        this.id = id;
        this.alphabet = Array.isArray(alphabet) ? alphabet : [];

    }

    //
    elementFromHTML(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
    }

    addHTML(htmlString, parent=document.getElementById("enigmaTableBody")) {
        parent.insertAdjacentHTML('beforeend', htmlString);
    }

    removeHTML(id) {
        const element = document.getElementById(id.toString());
        console.log(element + " removed");
        element.remove();
    }

    updateText(id, newText) {
        const element = document.getElementById(id.toString());
        if (element) {
            element.textContent = newText;
        }
    }

    rotate(id, direction) {
        // Only rotate if the id matches this rotor/reflector
        if (this.id == null || id == null || this.id.toString() !== id.toString()) return;

        if (!Array.isArray(this.wiring) || this.wiring.length === 0) return;

        if (direction === "R") {
            this.wiring.unshift(this.wiring.pop());
        }
        else if (direction === "L") {
            this.wiring.push(this.wiring.shift());
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
        ${headerRow}
        <tr class="alphabetRow">
            ${leftArrowCell}
            ${topCells}
            ${rightArrowCell}
        </tr>
        <tr class="alphabetRow">${secondRowCells}</tr>
    `);

    const leftButton = document.getElementById(`${rotor.id}Left`);
    const rightButton = document.getElementById(`${rotor.id}Right`);

    const shiftRowCells = (cells, direction) => {
        if (!cells || cells.length === 0) return;

        const state = cells.map((cell) => ({
            text: cell.textContent,
            className: cell.className
        }));

        if (direction === "R") {
            state.unshift(state.pop());
        } else if (direction === "L") {
            state.push(state.shift());
        }

        cells.forEach((cell, index) => {
            cell.textContent = state[index].text;
            cell.className = state[index].className;
        });
    };

    const updateRotorTable = (id, direction) => {
        const leftBtn = document.getElementById(`${id}Left`);
        if (!leftBtn) return;

        const firstRow = leftBtn.closest('tr');
        const secondRow = firstRow ? firstRow.nextElementSibling : null;

        if (!firstRow || !secondRow) return;

        const firstRowCells = Array.from(firstRow.querySelectorAll('td.tableCell'));
        const secondRowCells = Array.from(secondRow.querySelectorAll('td.tableCell'));

        shiftRowCells(firstRowCells, direction);
        shiftRowCells(secondRowCells, direction);
    };

    if (leftButton) {
        leftButton.addEventListener('click', (event) => {
            const buttonId = event.currentTarget.id;
            const id = buttonId.replace(/Left$/, '');
            rotor.rotate(id, "L");
            updateRotorTable(id, "L");
        });
    }

    if (rightButton) {
        rightButton.addEventListener('click', (event) => {
            const buttonId = event.currentTarget.id;
            const id = buttonId.replace(/Right$/, '');
            rotor.rotate(id, "R");
            updateRotorTable(id, "R");
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