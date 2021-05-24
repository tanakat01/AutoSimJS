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
        let is_select = document.createElement('select');
//        console.log(['automaton', automaton, 'alphabet', alphabet]);
        is_select.size = alphabet.length + 2;
        is_select.multiple = true;
        is_select.style.overflow = 'hidden';
        let os_select = document.createElement('select');
        os_select.size = alphabet.length + 2;
        os_select.multiple = false;
        os_select.style.overflow = 'hidden';
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
      //
      let option_is = document.createElement('option');
      option_is.text = '\u{3000}' + 'Input Symbols    ►';
      option_is.onclick = function() {
        is_select.style.visibility = "visible";
      };
      //
      let option_os = document.createElement('option');
      option_os.text = '\u{3000}' + 'Output Symbols   ►';
      option_os.onclick = function() {
        os_select.style.visibility = "visible";
      };
      // 
        let option_delete = document.createElement('option');
        option_delete.text = '\u{3000}' + 'delete';
        option_delete.onclick = function() {
            automaton.remove(transition);
            canvas.hide_popup();
        };
        let select = document.createElement('select');
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
        if (canvas.select != null) {
            parent.removeChild(canvas.select);
        }
        canvas.select = select;
        parent.appendChild(select);
    }
}

class TuringMachine extends DFA {
    constructor() {
        super();
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
