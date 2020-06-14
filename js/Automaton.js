/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */
class MyTapeListener {
    constructor(automaton) {
        this.automaton = automaton;
    }
    positionClicked(tape, position) {
        tape.grabFocus();
    }

    keyTyped(tape, what) {
        if(what == Alphabet.EPSILON) return;
        if(what == Alphabet.ELSE) return;
        if(what == ' ') return;

        if(what == 'BackSpace') {
            this.automaton.doBackStep();
            return;
        }

        // transition to new state
        //console.log('this.automaton=' + this.automaton);
        this.automaton.history.push(new MySnapshot(this.automaton));
        let data = this.automaton.getCurrent().advance(what);
        let anim = this.automaton.setCurrent(data[0]);
        let traversed = data[1];
        //console.log('traversed.length = ' + traversed.length);
        //console.log('traversed[0] = ' + traversed[0]);
//        console.log('traversed[0].name = ' + traversed[0].constructor.name);
        
        // put character onto tape
        let pos = tape.getCursorPosition();
        tape.write(pos, what);
        tape.setCursorPosition(pos + 1);
//        tape.setHeadPosition(pos + 1);
        tape.repaint();
        let step = 0;
        let automaton = this.automaton;
        let timer = setInterval(function() {
            step++;
            if (step >= 10) {
                for (let t of traversed) {
                    t.setCursorExists(false);
                    tape.setHeadPosition(pos + 1);
                }
                automaton.canvas.repaint();
                clearInterval(timer);
                return;
            }
            tape.setHeadPosition(pos + step / 10);
            for (let t of traversed) {
                t.setCursorExists(true);
                t.setCursorProgress(step / 10);
            }
            automaton.canvas.repaint();
//            console.log('step=' + step);
        }, 50);
        /*
          anim = anim.merge(tape.setHeadPositionAnimate(pos + 1));

          anim.start();
        */
    }
}

class MySnapshot{
    constructor(automaton) {
        this.automaton = automaton;
        this.current = automaton.getCurrent();
    }
    restore() {
        this.automaton.setCurrent(this.current);
        let pos = this.automaton.canvas.getTape().getCursorPosition() - 1;
        this.automaton.canvas.getTape().setCursorPosition(pos);
        this.automaton.canvas.getTape().setHeadPositionAnimate(pos).start();
        this.automaton.canvas.getTape().write(pos, Alphabet.BLANK);
    }
}

class Automaton {
    static NUM_FRAMES = 15;

    constructor() {
        this.states = [];
        this.transitions = [];
        this.components = [];
        this.alphabet = new Alphabet(Alphabet.alphabet + Alphabet.ELSE); 
        this.current = new StateSet(this);
        this.current_draw = this.current;
        this.canvas = null;
        this.bounding = null;

        this.history = [];
        
        this.tape_listener = new MyTapeListener(this);

    }

    //
    // ABSTRACT METHODS
    //
    createState() {}
    createTransition(src, dst) {}

    //
    // ACCESS METHODS
    //
    getAlphabet() { return this.alphabet; }
    getCanvas() { return this.canvas; }
    getHistory() { return this.history; }

    getStates() {
        return this.states;
    }
    getInitialStates() {
        let ret = new StateSet(this);
        for(const state of this.states) {
            if(state.isInitial()) ret.add(state);
        }
        return ret;
    }
    getTransitions() {
        return this.transitions;
    }
    getComponents() {
        return this.components;
    }
    getAllComponents() {
        return this.transitions.concat(this.states, this.components);
    }
    getAllComponentsReverse() {
        let r = this.getAllComponents();
        r.reverse();
        return r;
    }

    //
    // CONFIGURATION METHODS
    //
    setTapeListener(listen) {
        this.tape_listener = listen;
    }
    setCanvas(canvas) { this.canvas = canvas; }
    setToolBoxTape(toolbox, tape) {
        this.toolbox.setPlayControlsVisible(false);
    }

    exposeConnections(g, what) {
        for(const transition of this.transitions) {
            if(transition.getSource() == what
               || transition.getDest() == what) {
                transition.expose(g);
            }
        }
    }

    addComponent(what) {
        this.components.push(what);
        this.invalidateBounds();
        return what;
    }

    removeComponent(what) {
        const i = this.components.indexOf(what);
        this.components.splice(i, 1);
    }

    addState() {
        let q = this.createState();
        if(q != null) {
            this.states.push(q);
            this.invalidateBounds();
        }
        return q;
    }
    removeState(what) {
        this.current.remove(what);
        this.current_draw.remove(what);
        let i = this.states.indexOf(what);
        this.states.splice(i, 1);

        let g = null;
        if(this.canvas != null) g = this.canvas.getGraphics();

        let to_remove = [];
        for(const transition of this.transitions ) {
            if(transition.getSource() == what || transition.getDest() == what) {
                to_remove.push(transition);
            }
        }
        for(const transition of to_remove ) {
            if(g != null) transition.expose(g);
            this.transitions.splice(this.transitions.indexOf(transition), 1);
        }
    }

    addTransition(src, dst) {
        let delta = this.createTransition(src, dst);
        //console.log('addTransition, delta=' + delta);
        if(delta != null) {
            this.transitions.push(delta);
            this.invalidateBounds();
        }
        return delta;
    }
    removeTransition(what) {
        let i = this.transitions.indexOf(what);
        this.transitions.splice(i, 1);
    }

    remove(comp) {
        if(comp instanceof State) {
            this.removeState(comp);
        } else if(comp instanceof Transition) {
            this.removeTransition(comp);
        } else {
            this.removeComponent(comp);
        }
    }

    //
    // SIMULATION METHODS
    //
    doPlay() {
        let states = this.getInitialStates();
        if(states.size() == 0) {
            JOptionPane.showMessageDialog(null, "No initial state is selected.");
            return;
        }
        this.setCurrent(states);
        this.history = [];

        let tape = this.canvas.getTape();
//        console.log('doPlay() tape=' + tape.constructor.name);
        if(tape != null) {
            tape.completeReset();
            tape.addTapeListener(this.tape_listener);
            tape.setShowHead(true);
            tape.grabFocus();
        }
    }
    doStop() {
        this.setCurrent(new StateSet(this));
        let tape = this.canvas.getTape();
        if(tape != null) tape.completeReset();
    }
    doPause() { }
    doStep() { }
    doBackStep() {
        if(this.history.length > 0) {
            this.history.removeLast().restore();
        }
    }
    doResetSimulation() { }

    getCurrent() {
        return this.current;
    }
    getCurrentDraw() {
        return this.current_draw;
    }
    setCurrent(data) {
        if(data == null) data = new StateSet(this);
        let old_draw = this.current_draw;
        this.current = data;
        this.current_draw = data;
        let g = this.canvas.getGraphics();
        this.current_draw.expose(g);
        old_draw.expose(g);
    }
    /*




      public Animation setCurrent(StateSet data, LinkedList<Transition> traversed) {
      if(data == null) data = new StateSet(this);
      StateSet old_draw = current_draw;
      current = data;
      current_draw = new StateSet(this);

      Graphics g = canvas.getGraphics();
      Animation ret = new AnimationThread(g, traversed);
      current_draw.expose(g);
      old_draw.expose(g);
      return ret;
      }
      private class AnimationThread extends Animation {
      private Graphics g;
      private LinkedList<Transition> traversed;
      private StateSet old;

      public AnimationThread(Graphics g, LinkedList<Transition> traversed) {
      this.g = g;
      this.traversed = traversed;
      this.old = current;

      for(Transition trans : traversed) {
      trans.setCursorProgress(0.0);
      trans.setCursorExists(true);
      }
      }
      public boolean step(int frames) {
      if(traversed.size() == 0 || frames >= NUM_FRAMES
      || current != old) {
      canvas.setSuppressRepaint(true);
      for(Transition trans : traversed) {
      trans.setCursorExists(false);
      }

      if(current == old) {
      current_draw = current;
      current.expose(g);
      }
      canvas.setSuppressRepaint(false);

      return false;
      } else {
      canvas.setSuppressRepaint(true);
      for(Transition trans : traversed) {
      trans.setCursorProgress((double) frames / NUM_FRAMES);
      }
      canvas.setSuppressRepaint(false);
      return true;
      }
      }
      }
    */
    //
    // GUI METHODS
    //
    find(x, y, g) {
        for(const comp of this.getAllComponentsReverse()) {
            if(comp.isIn(x, y, g)) return comp;
        }
        return null;
    }
    findState(x, y, g) {
        const rev = this.states.slice();
        //    console.log('findState(' + x + ',' + y + '), rev=' + rev);
        //    console.log('this.states.length=' + this.states.length);
        rev.reverse();
        for(const state of rev) {
            if(state.isIn(x, y, g)) return state;
        }
        return null;
    }
    draw(g) {
        for(const comp of this.getAllComponents()) {
            //console.log('comp.constructor.name=' + comp.constructor.name);
            comp.draw(g);
        }
    }

    //
    // BOUNDING BOX METHODS
    //
    getDimensions(g) {
        if(this.bounding == null) this.computeBoundingBox(g);

        let width = this.bounding.width;
        if(this.bounding.x > 0) width = this.bounding.x + this.bounding.width;
        let height = this.bounding.height;
        if(this.bounding.y > 0) height = this.bounding.y + this.bounding.height;
        return new Dimension(width, height);
    }
    getBounds(g) {
        if(this.bounding == null) this.computeBoundingBox(g);
        return {...this.bounding}; // copy of this.bounding
    }
    invalidateBounds() { this.bounding = null; }
    computeBoundingBox(g) {
        this.bounding = null;
        let box = new Rectangle(0, 0, 0, 0);
        for(const comp of this.getAllComponents()) {
            comp.getBounds(box, g);
            if(this.bounding == null) {
                this.bounding = box;
            } else {
                this.bounding.add(box);
            }
        }
        if(this.bounding == null) this.bounding = new Rectangle(0, 0, 0, 0);
        //console.log('this.bounding instanceof Rectangle' + (this.bounding instanceof Rectangle));
        //    console.log('this.bounding=' + JSON.stringify(this.bounding));
        this.bounding.grow(5, 5);
    }

    //
    // FILE METHODS
    //
    print(fout) {
        fout.println("Automaton Simulator, " + Main.FILE_VERSION_NAME);
        if(this instanceof TuringMachine) fout.print("turing");
        else if(this instanceof DFA) fout.print("dfa");
        else if(this instanceof NFA) fout.print("nfa");
        else if(this instanceof DPDA) fout.print("dpda");
        else fout.print("??");
        fout.print(" "); fout.beginGroup(); fout.println();
        this.printAutomaton(fout);
        fout.endGroup(); fout.println();
    }

    printAutomaton(fout) {
        fout.print("alphabet ");
        fout.printlnGroup(this.alphabet.toString());

        for(let state of this.states) {
            fout.print("state "); fout.beginGroup(); fout.println();
            state.print(fout);
            fout.endGroup(); fout.println();
        }

        for(let transition of this.transitions) {
            let i = this.states.indexOf(transition.getSource());
            let j = this.states.indexOf(transition.getDest());
            fout.print("edge " + i + " " + j + " ");
            fout.beginGroup(); fout.println();
            transition.print(fout);
            fout.endGroup(); fout.println();
        }

        for(let comp of this.components) {
            if(comp instanceof AutomatonLabel) {
                fout.print("label "); fout.beginGroup(); fout.println();
                comp.print(fout);
                fout.endGroup(); fout.println();
            }
        }
        
    }

    static read(fin) {
        let what = fin.readLine();
        if(!what == "Automaton Simulator, " + Main.FILE_VERSION_NAME) {
            throw new Error("unrecognized file version");
        }

        let ret;
        let type = fin.readLine().trim();
        if(type == "dfa") ret = new DFA();
        else if(type =="nfa") ret = new NFA();
        else if(type =="dpda") ret = new DPDA();
        else if(type == "turing") ret = new TuringMachine();
        else throw new Error("unknown automaton type");
        fin.beginGroup();
        while(!fin.atGroupEnd()) {
            let key = fin.readLine().trim();
            if(key != null && key.length > 0) {
                if(!ret.setKey(key, fin)) {
                    fin.readGroup();
                }
            }
        }
        fin.endGroup();
        return ret;
    }

    setKey(key, fin) {
        if(key == "alphabet") {
            this.alphabet.set(fin.readGroup());
            return true;
        } else if(key == "state") {
            fin.beginGroup();
            let state = this.addState();
            state.read(fin);
            fin.endGroup();
//            console.log('state(x=' + state.x + ',y=' + state.y + ',is_initial=' + state.is_initial + ',is_final=' + state.is_final);
            return true;
        } else if(key == "label") {
            fin.beginGroup();
            let label = new AutomatonLabel(this);
            this.addComponent(label);
            label.read(fin);
            fin.endGroup();
            return true;
        } else if(key.startsWith("edge ")) {
            let tokens = key.split(' ');
            if (tokens.length != 3) throw Error("ill-formatted edge (" + key + ")");
            let src_i = parseInt(tokens[1]);
            let dst_i = parseInt(tokens[2]);
            if (isNaN(src_i) || isNaN(dst_i)) throw Error("ill-formatted edge (" + key + ")");
            let src = this.states[src_i];
            if(src == null) {
                throw new Error("source " + src_i + " not defined");
            }

            let dst = this.states[dst_i];
            if(dst == null) {
                throw new Error("dest " + dst_i + " not defined");
            }

            let transition = this.addTransition(src, dst);
            fin.beginGroup();
            transition.read(fin);
            fin.endGroup();
            return true;
        } else {
            return false;
        }
    }
    /*

     */
}
