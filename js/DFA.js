/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class DFAState extends State {
    constructor(automaton) {
        super(automaton);
    }

    canBeInitial() {
        return this.isInitial() || this.automaton.getInitialStates().size() == 0;
    }
}

class DFATransition extends Transition {
    constructor(automaton, src, dst) {
        super(automaton, src, dst);
    }

    canBeTransit(what) {
        if (what == Alphabet_EPSILON) return false;
        for (const transition of this.automaton.transitions) {
            if (this != transition
               && transition.getSource() == this.getSource()
               && transition.transitsOn(what)) {
                return false;
            }
        }
        return true;
    }
}

class DFA extends Automaton{
    constructor() {
        super();
    }

    createState() {
        return new DFAState(this);
    }

    createTransition(src, dst) {
        for (const transition of this.transitions) {
            if (transition.getSource() == src
               && transition.getDest() == dst) {
                return null;
            }
        }
        return new DFATransition(this, src, dst);
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
                return [false, "**FAILURE** <String:'" + str + "', Expected:" + (exTerm ? "terminal" : "non-terminal") + ", Result:No transition>"];
            }
            isTerm = stateSet.hasFinal();
            if (exTerm != isTerm) {
                return [false, "**FAILURE** <String:'" + str + "', Expected:" + (exTerm ? "terminal" : "non-terminal") + ", Result:" + (isTerm ? "terminal" : "non-terminal") + ">"];
            }
        }
        return [true, "SUCCESS <String:'" + str + "', Expected:" + (exTerm ? "terminal" : "non-terminal") + ", Result:" + (isTerm ? "terminal" : "non-terminal") + ">"];
    }
}
