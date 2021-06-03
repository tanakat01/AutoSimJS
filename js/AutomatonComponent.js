/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class AutomatonComponent {
    constructor(automaton) {
        this.automaton = automaton;
    }

    getAutomaton() {
        return this.automaton;
    }

    getBounds(rect, g) {}

    expose(g) {
        let rect = new Rectangle();
        this.automaton.getCanvas().expose(this.getBounds(rect, g));
    }
    print(fout) { }

    setKey(key, fin) {
        return false;
    }

    read(fin) {
        while (!fin.atGroupEnd()) {
            let key = fin.readLine().trim();
            if (key != null && key.length > 0) {
                if (!this.setKey(key, fin)) {
                    fin.readGroup();
                }
            }
        }
    }
}
