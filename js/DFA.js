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
        if(what == Alphabet.EPSILON) return false;

        for(const transition of this.automaton.transitions) {
            if(this != transition
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
        for(const transition of this.transitions) {
            if(transition.getSource() == src
               && transition.getDest() == dst) {
                return null;
            }
        }
        return new DFATransition(this, src, dst);
    }
}
