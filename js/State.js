/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class State  extends AutomatonComponent{
    constructor(automaton) {
        super(automaton);
        this.x = 0;
        this.y = 0;
        this.is_initial = false;
        this.is_final = false;
    }
    // abstract methods
    remove() { this.getAutomaton().removeState(this); }
    // accessor methods
    isInitial() { return this.is_initial; }

    setInitial(value) {
        if (this.is_initial != value) {
            this.is_initial = value;
            this.getAutomaton().invalidateBounds();
            let canvas = this.getAutomaton().getCanvas();
            if (canvas != null) this.expose(canvas.getGraphics());
        }
    }

    isFinal() { return this.is_final; }

    setFinal(value) {
        if (this.is_final != value) {
            this.is_final = value;
            let canvas = this.getAutomaton().getCanvas();
            if (canvas != null) this.expose(canvas.getGraphics());
        }
    }

    isCurrent() { return this.getAutomaton().getCurrent().contains(this); }

    getX() { return this.x; }

    getY() { return this.y; }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.getAutomaton().invalidateBounds();
        return this;
    }

    getBounds(rect, g) {
        rect.setBounds(this.x - State_RADIUS, this.y - State_RADIUS, 2 * State_RADIUS, 2 * State_RADIUS);
        rect.grow(2, 2);
        if (this.isInitial()) {
            let dx = this.x - State_RADIUS / Math.sqrt(2.0);
            let dy = this.y + State_RADIUS / Math.sqrt(2.0);
            rect.add(dx - State_INITARROW_LEN - 2, dy + State_INITARROW_LEN + 2);
        }
        return rect;
    }

    isIn(x0, y0, g) {
        return (this.x - x0) * (this.x - x0) + (this.y - y0) * (this.y - y0) < State_RADIUS * State_RADIUS;
    }

    draw(g) {
        if (this.isInitial()) {
            let dx = this.x - State_RADIUS / Math.sqrt(2.0);
            let dy = this.y + State_RADIUS / Math.sqrt(2.0);
            let th = 0.75 * Math.PI;
            let xp = [
                Math.floor(dx + Transition_ARROW_LEN
                           * Math.cos(th + Transition_ARROW_THETA)),
                Math.floor(dx),
                Math.floor(dx + Transition_ARROW_LEN
                           * Math.cos(th - Transition_ARROW_THETA)),
            ];
            let yp = [
                Math.floor(dy + Transition_ARROW_LEN
                           * Math.sin(th + Transition_ARROW_THETA)),
                Math.floor(dy),
                Math.floor(dy + Transition_ARROW_LEN
                           * Math.sin(th - Transition_ARROW_THETA)),
            ];

            GraphicsUtil.switchToWidth(g, 3);
            g.setColor(Color.blue);
            g.drawPolyline(xp, yp, 3);
            g.drawLine(Math.floor(dx -State_INITARROW_LEN),
                       Math.floor(dy +State_INITARROW_LEN),
                       Math.floor(dx), Math.floor(dy));
        }
        let bg = this.getAutomaton().getCurrentDraw().contains(this)
            ? Color.green : Color.red;
        GraphicsUtil.switchToWidth(g, 3);
        if (this.isFinal()) {
            g.setColor(Color.white);
            g.fillOval(this.x - State_RADIUS, this.y - State_RADIUS, 2 * State_RADIUS, 2 * State_RADIUS);
            g.setColor(bg);
            g.fillOval(this.x - State_RADIUS + 6, this.y - State_RADIUS + 6,
                       2 * State_RADIUS - 12, 2 * State_RADIUS - 12);
            g.setColor(Color.black);
            g.drawOval(this.x - State_RADIUS, this.y - State_RADIUS, 2 * State_RADIUS, 2 * State_RADIUS);
            g.drawOval(this.x - State_RADIUS + 5, this.y - State_RADIUS + 5,
                       2 * State_RADIUS - 10, 2 * State_RADIUS - 10);
        } else {
            g.setColor(bg);
            g.fillOval(this.x - State_RADIUS + 1, this.y - State_RADIUS + 1,
                       2 * State_RADIUS - 2, 2 * State_RADIUS - 2);
            g.setColor(Color.black);
            g.drawOval(this.x - State_RADIUS, this.y - State_RADIUS, 2 * State_RADIUS, 2 * State_RADIUS);
        }
    }
    showMenu(clientX, clientY) {
        let state = this;
        let automaton = this.getAutomaton();
        let canvas = automaton.getCanvas();
        let parent = document.getElementById('popups');
        let select = document.createElement('select');
        select.size = 3;
        select.multiple = true;
        select.style.overflow = 'hidden';
        let option_initial = document.createElement('option');
        let select_str = this.isInitial() ? '\u{2713}' : '\u{3000}';
        option_initial.text = select_str + 'Initial State';
        option_initial.disabled = (!this.isInitial() && !this.canBeInitial());
        option_initial.onclick = function() {
            if (state.isInitial()) {
                state.setInitial(false);
            } else if (automaton.getInitialStates().size() == 0) {
                state.setInitial(true);
            }
            canvas.hide_popup();
        };
        select.appendChild(option_initial);
        let option_final = document.createElement('option');
        select_str = this.isFinal() ? '\u{2713}' : '\u{3000}';
        option_final.text = select_str + 'Final State';
        option_final.onclick = function() {
            state.setFinal(!state.isFinal());
            canvas.hide_popup();
        };
        select.appendChild(option_final);
        // 
        let option_delete = document.createElement('option');
        option_delete.text = '\u{3000}' + 'Delete';
        option_delete.onclick = function() {
            automaton.remove(state);
            canvas.hide_popup();
        };
        select.appendChild(option_delete);
        let rect = canvas.jscanvas.getBoundingClientRect();
        let x = clientX + rect.left;
        let y = clientY + rect.top;
        select.style.left = x + "px";
        select.style.top = y + "px";
        select.style.position="fixed";
        select.style.visibility = "visible";
        select.style.display = "block";
        while (canvas.select.length > 0) {
            parent.removeChild(canvas.select.pop());
        }
        canvas.select.push(select);
        parent.appendChild(select);
    }

    print(fout) {
        super.print(fout);
        if (this.isInitial()) {
            fout.print("initial "); fout.printlnGroup("yes");
        }
        if (this.isFinal()) {
            fout.print("final "); fout.printlnGroup("yes");
        }
        fout.print("coord "); fout.printlnGroup(Math.round(this.x) + " " + Math.round(this.y));
    }

    setKey(key, fin) {
        if (key == "initial") {
            let what = fin.readGroup();
            if (what == "yes") {
                this.setInitial(true);
            }
            return true;
        } else if (key == "final") {
            let what = fin.readGroup();
            if (what =="yes") this.setFinal(true);
            return true;
        } else if (key == "coord") {
            let value = fin.readGroup();
            let sep = value.indexOf(' ');
            if (sep < 0) {
                throw new Error("Missing argument");
            }
            try {
                this.x = parseInt(value.substring(0, sep));
                this.y = parseInt(value.substring(sep + 1));
            } catch(e) {
                throw new Error("Nonnumeric argument");
            }
            return true;
        } else {
            return super.setKey(key, fin);
        }
    }
}
