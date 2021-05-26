/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class TMTransition extends DFATransition {
    constructor(automaton, src, dst) {
        super(automaton, src, dst);
        this.direction = 1;
        this.output = Alphabet_ELSE;
    }
    determineLabelText() {
        let ret = super.determineLabelText() + ": ";
        if(this.output != Alphabet_ELSE || this.output == 0) {
            ret += this.output + ",";
        }
        ret += (this.direction == 1 ? ">" : "<");
        return ret;
    }
    showMenu(clientX, clientY) {
        let transition = this;
        let automaton = this.getAutomaton();
        let canvas = automaton.getCanvas();
        let parent = document.getElementById('popups');
        let alphabet = automaton.getAlphabet().toString();
        while (canvas.select.length > 0) {
            parent.removeChild(canvas.select.pop());
        }

        let is_select = document.createElement('select');
        //        console.log(['automaton', automaton, 'alphabet', alphabet]);
        is_select.size = alphabet.length;
        is_select.multiple = true;
        is_select.style.overflow = 'hidden';
        //
        for (let c of alphabet) {
            let option = document.createElement('option');
            //            let select_str = this.transitsOn(c) ? '✓' : '　';
            let select_str = this.transitsOn(c) ? '\u{2713}' : '\u{3000}';
            option.text = select_str + Alphabet.toString(c);
            option.disabled = (!this.transitsOn(c) && !this.canBeTransit(c));
            option.onclick = function() {
                if (!transition.transitsOn(c)) {
                    transition.addTransit(c);
                } else {
                    transition.removeTransit(c);
                }
                canvas.hide_popup();
            };
            is_select.appendChild(option);
        }
        let os_select = document.createElement('select');
        os_select.size = alphabet.length;
        os_select.multiple = false;
        os_select.style.visibility = 'hidden';
        os_select.style.overflow = 'hidden';
        for (let c of alphabet) {
            let option = document.createElement('option');
            //            let select_str = this.transitsOn(c) ? '✓' : '　';
            let select_str = (this.output == c) ? '\u{2713}' : '\u{3000}';
            option.text = select_str + (c == Alphabet_ELSE ? "no change" : Alphabet.toString(c));
            option.disabled = false;
            option.onclick = function() {
                transition.output = c;
                canvas.hide_popup();
            };
            os_select.appendChild(option);
        }
        let dir_select = document.createElement('select');
        dir_select.size = 2;
        dir_select.multiple = false;
        dir_select.style.visibility = 'hidden';
        dir_select.style.overflow = 'hidden';
        for (let dir of [-1, 1]) {
            let option = document.createElement('option');
            let select_str = this.direction == dir ? '\u{2713}' : '\u{3000}';
            option.text = select_str + (dir == 1 ? "Right" : "Left");
            option.disabled = false;
            option.onclick = function() {
                transition.direction = dir;
                canvas.hide_popup();
            };
            dir_select.appendChild(option);
        }
        
        
        //
        let option_is = document.createElement('option');
        option_is.text = '\u{3000}' +  'Input Symbols    \u{25BA}';
        option_is.onclick = function() {
            os_select.style.visibility = 'hidden';
            dir_select.style.visibility = 'hidden';
            is_select.style.visibility = 'visible';
        };
        //
        let option_os = document.createElement('option');
        option_os.text = '\u{3000}' +  'Output Symbols  \u{25BA}';
        option_os.onclick = function() {
            is_select.style.visibility = 'hidden';
            dir_select.style.visibility = 'hidden';
            os_select.style.visibility = "visible";
        };
        //
        let option_dir = document.createElement('option');
        option_dir.text = '\u{3000}' + 'Head Movement  \u{25BA}';
        option_dir.onclick = function() {
            is_select.style.visibility = 'hidden';
            os_select.style.visibility = "hidden";
            dir_select.style.visibility = "visible";
        };
        // 
        let option_delete = document.createElement('option');
        option_delete.text = '\u{3000}' + 'delete';
        option_delete.onclick = function() {
            automaton.remove(transition);
            canvas.hide_popup();
        };
        let select = document.createElement('select');
        select.appendChild(option_is);
        select.appendChild(option_os);
        select.appendChild(option_dir);
        select.appendChild(option_delete);
        // 
        let rect = canvas.jscanvas.getBoundingClientRect();
        let x = clientX + rect.left;
        let y = clientY + rect.top;
        select.style.left = x + "px";
        select.style.top = y + "px";
        select.style.position="fixed";
        select.style.visibility = "visible";
        select.style.display = "block";
        select.size = select.length;
        canvas.select.push(select);
        parent.appendChild(select);
        //
        is_select.style.left = (x + 120) + "px";
        is_select.style.top = y + "px";
        is_select.style.position="fixed";
        is_select.style.visibility = "hidden";
        canvas.select.push(is_select);
        parent.appendChild(is_select);
        //
        os_select.style.left = (x + 120) + "px";
        os_select.style.top = (y + 20) + "px";
        os_select.style.position="fixed";
        os_select.style.visibility = "hidden";
        canvas.select.push(os_select);
        parent.appendChild(os_select);
        //
        dir_select.style.left = (x + 120) + "px";
        dir_select.style.top = (y + 40) + "px";
        dir_select.style.position="fixed";
        dir_select.style.visibility = "hidden";
        canvas.select.push(dir_select);
        parent.appendChild(dir_select);
        //      canvas.select.push(os_select);
        //        parent.appendChild(os_select);
        //      canvas.select.push(dir_select);
        //        parent.appendChild(dir_select);
    }
    print(fout) {
        fout.print("transits "); fout.printlnGroup(this.transits);
        fout.print("offset "); fout.printlnGroup(this.offset_theta.toString());
        fout.print("direction "); fout.printlnGroup(this.direction > 0 ? "R" : "L");
        if (this.output != Alphabet_ELSE) {
            fout.print("output "); fout.printlnGroup(this.output);
        }
    }
    setKey(key, fin) {
        console.log('TMTransition key=' + key);
        if(key == "direction") {
            this.direction = (fin.readGroup() == "R" ? 1 : -1);
            return true;
        } else if(key == "output") {
            this.output = fin.readGroup();
            return true;
        } else {
            return super.setKey(key, fin);
        }
    }
}

class TuringTapeListener {
    constructor(automaton) {
        this.automaton = automaton;
        console.log('TuringTapeListener constructor');
    }
    positionClicked(tape, position) {
        console.log('TuringTapeListener position Clicked, position=', position);
        tape.setCursorPosition(position);
    }

    keyTyped(tape, what) {
        console.log('TuringTapeListener keyTyped, what=', what);
        if(what == Alphabet_EPSILON) return;
        if(what == Alphabet_ELSE) return;
        if(what == 'Backspace') {
            let cursor = tape.getCursorPosition();
            cursor = Math.max(0, cursor - 1);
            tape.write(cursor, ' ');
            tape.setCursorPosition(cursor);
            return;
        }
        if(what.length > 1) return;
        let cursor = tape.getCursorPosition();
        tape.write(cursor, what);
        tape.setCursorPosition(cursor + 1);
    }
}

class TuringTape extends Tape {
    constructor(canvas) {
        super(canvas);
    }
    reset() {
        this.contents = new TapeContents();
        this.representation.computeSize();
        this.setHeadPosition(2);
        this.setCursorPosition(2);
        this.setShowHead(true);
        this.repaint();
    }
}

class TuringMachine extends DFA {
    constructor() {
        super();
        this.getAlphabet().add(Alphabet_BLANK);
        console.log('TuringMachine constructor');
        this.tape_listener = new TuringTapeListener(this);
        console.log('end of tape listener');
    }
    setTape(tape) {
        let tapecanvas = document.getElementById('tapecanvas');
        this.tape = new TuringTape(tapecanvas);
        this.tape.reset();
        this.canvas.setTape(this.tape);
        this.tape.addTapeListener(this.tape_listener);
        console.log('tape=', tape);
    }
    setToolBoxTape(toolbox, tape) {
        console.log('toolsbox' + toolbox + ',tape=', tape);
    }
    createTransition(src, dst) {
        for(const transition of this.transitions) {
            if(transition.getSource() == src
               && transition.getDest() == dst) {
                return null;
            }
        }
        return new TMTransition(this, src, dst);
    }
}
