// Classes: Enigmamaskine, Plugboard, Reflector, RotorTemplate, Rotor 1

class Enigmamaskine {
    constructor() {
        this.plugboard = new Plugboard();
        this.reflector = new Reflector();
        this.rotors = [new Rotor1(), new Rotor2(), new Rotor3()];
    }
}

class Plugboard {
    constructor() {
        this.connections = {};
    }
}

// RotorTemplate is a base class for both Rotor and Reflector, as they share some common properties and methods.
class RotorTemplate {
    constructor(wiring, notch, id) {
        this.wiring = [];
        this.notch = 0;
        this.id = id;
    }

    //
    elementFromHTML(htmlString) {
        const template = document.createElement('template');
        template.innerHTML = htmlString.trim();
        return template.content.firstChild;
    }

    addHTML(htmlString, parent=document.body) {
        parent.appendChild(this.elementFromHTML(htmlString));
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

    rotate(direction) {
        if (direction === "R") {
            this.wiring.unshift(this.wiring.pop());
        }
        else if (direction === "L") {
            this.wiring.push(this.wiring.shift());
        }
    }
}


class Reflector extends RotorTemplate {
    constructor() {
        super();
        this.mapping = {};
    }
}

class Rotor extends RotorTemplate {
    constructor(wiring, notch, id) {
        super(wiring, notch, id);
        this.position = 0;
    }
}

let rotors = [];

function addRotor(wiring, notch, id) {
    const rotor = new Rotor(wiring, notch, id);
    rotors.push(rotor);
}


fetch('../json/mechanicals.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => console.error('Error fetching mechanicals.json:', error));
