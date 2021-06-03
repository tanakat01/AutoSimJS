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
        if (!this.states.includes(state)) {
            this.states.push(state);
        }
    }

    expose(g) {
        for (let state of this.states) 
            state.expose(g);
    }

    advance(what) {
        let ret = new StateSet(this.automaton);
        let used = new StateSet(this.automaton);
        let traversed = [];
        let outputs = [];
        let directions = [];
        let transitions = this.automaton.getTransitions();
        if (what == Alphabet_EPSILON) {
            for (let state of this.states) {
                ret.add(state);
            }
        } else {
            // find transitions for selected character
            for (let transition of transitions) {
                if (transition.transitsOn(what)
                   && this.contains(transition.getSource())) {
                    ret.add(transition.getDest());
                    used.add(transition.getSource());
                    traversed.push(transition);
                    outputs.push(transition.getOutput());
                    directions.push(transition.getDirection());
                }
            }

            // handle ELSE transitions
            for (let transition of transitions) {
                if (transition.transitsOn(Alphabet_ELSE)
                   && this.contains(transition.getSource())
                   && !used.contains(transition.getSource())) {
                    ret.add(transition.getDest());
                    traversed.push(transition);
                    outputs.push(transition.getOutput());
                    directions.push(transition.getDirection());
                }
            }
        }
        // closure on EPSILON transitions
        let changed = true;
        while (changed) {
            changed = false;
            for (let transition of transitions) {
                if (transition.transitsOn(Alphabet_EPSILON)
                   && ret.contains(transition.getSource())) {
                    if (!ret.contains(transition.getDest())) {
                        ret.add(transition.getDest());
                        changed = true;
                    }
                    if (!traversed.includes(transition)) {
                        traversed.push(transition);
                    }
                }
            }
        }
        return [ret, traversed, outputs, directions];
    }

    hasFinal() {
        for (let s of this.states) {
            if (s.is_final) return true;
        }
        return false;
    }

    toString() {
        let r = '[';
        for (let s of this.states) {
            r += s.constructor.name + '(' + s.x + ',' + s.y + '),';
        }
        r += ']';
        return r;
    }
}
