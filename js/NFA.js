/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class NFAState extends State {
    constructor(automaton) {
        super(automaton);
    }

    canBeInitial() {
        return true;
    }
}

class NFATransition extends Transition {
    constructor(automaton, src, dst) {
        super(automaton, src, dst);
    }

    canBeTransit(what) {
        return true;
    }
}

class NFA extends Automaton{
    constructor() {
        super();
        this.getAlphabet().add(Alphabet_EPSILON);
    }

    createState() {
        return new NFAState(this);
    }

    createTransition(src, dst) {
        for (const transition of this.transitions) {
            if (transition.getSource() == src
               && transition.getDest() == dst) {
                return null;
            }
        }
        return new NFATransition(this, src, dst);
    }

    doPlay() {
        super.doPlay();
        let current = this.getCurrent();
        let data = current.advance(Alphabet_EPSILON);
        let traversed = data[1];
        let automaton = this;
        let step = 0;
        let timer = setInterval(function() {
            step++;
            if (step >= 10) {
                for (let t of traversed) {
                    t.setCursorExists(false);
                }
                automaton.setCurrent(data[0]);
                automaton.canvas.repaint();
                clearInterval(timer);
                return;
            }
            for (let t of traversed) {
                t.setCursorExists(true);
                t.setCursorProgress(step / 10);
            }
            automaton.canvas.repaint();
        }, 50);
    }
    testOne(test) {
        let str = '';
        let stateSet = this.getInitialStates();
        if (stateSet.size() == 0) {
          return [false, '**FAILURE** <No Initial State>'];
        }

        let exTerm, isTerm;
        for (let i = 0; i < test.length; i++) {
            let c = test.charAt(i);
            let lower_c = c.toLowerCase();
            str += lower_c;
            exTerm = (c != lower_c);
            let data = stateSet.advance(lower_c);
            stateSet = data[0];
            if (stateSet.size() == 0) {
                return [false, "**FAILURE** <String:'" + str + "', Expected:" + (exTerm ? "final" : "non-final") + ", Result:No transition>"];
            }
            isTerm = stateSet.hasFinal();
            if (exTerm != isTerm) {
                return [false, "**FAILURE** <String:'" + str + "', Expected:" + (exTerm ? "final" : "non-final") + ", Result:" + (isTerm ? "final" : "non-final") + ">"];
            }
        }
        return [true, "SUCCESS <String:'" + str + "', Expected:" + (exTerm ? "final" : "non-final") + ", Result:" + (isTerm ? "final" : "non-final") + ">"];
    }
}
