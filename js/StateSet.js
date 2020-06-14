/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class StateSet {
    constructor(automaton) {
        this.automaton = automaton;
        this.states = [];
    }
    size() {
        return this.states.length;
    }
    contains(what) {
        return this.states.includes(what);
    }
    remove(what) {
        let i = this.states.indexOf(what);
        if (i >= 0) this.states.splice(i, 1);
    }
    add(state) {
        if(!this.states.includes(state)) {
            this.states.push(state);
        }
    }
    expose(g) {
        for (var state of this.states) 
            state.expose(g);
    }
    advance(what) {
        let ret = new StateSet(this.automaton);
        let used = new StateSet(this.automaton);
        let traversed = [];
        let transitions = this.automaton.getTransitions();

        if(what == Alphabet_EPSILON) {
            for(var state of this.states) {
                ret.add(state);
            }
        } else {
            // find transitions for selected character
            for(var transition of transitions) {
                if(transition.transitsOn(what)
                   && this.contains(transition.getSource())) {
                    ret.add(transition.getDest());
                    used.add(transition.getSource());
                    traversed.push(transition);
                }
            }

            // handle ELSE transitions
            for(var transition of transitions) {
                if(transition.transitsOn(Alphabet_ELSE)
                   && this.contains(transition.getSource())
                   && !used.contains(transition.getSource())) {
                    ret.add(transition.getDest());
                    traversed.push(transition);
                }
            }
        }

        // closure on EPSILON transitions
        let changed = true;
        while(changed) {
            changed = false;
            for(var transition of transitions) {
                if(transition.transitsOn(Alphabet_EPSILON)
                   && ret.contains(transition.getSource())) {
                    if(!ret.contains(transition.getDest())) {
                        ret.add(transition.getDest());
                        changed = true;
                    }
                    if(!traversed.contains(transition)) {
                        traversed.push(transition);
                    }
                }
            }
        }
        return [ret, traversed];
    }
    /*
      public Iterator<State> iterator() {
      return states.iterator();
      }
    */
}
