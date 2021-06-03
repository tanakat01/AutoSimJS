/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class ToolState extends Tool {
    constructor(canvas) {
        super(canvas);
        this.current = null;
        this.setCursor(Cursor.getPredefinedCursor(Cursor_CROSSHAIR_CURSOR));
    }

    mousePressed(g, e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        this.current = this.getCanvas().getAutomaton().findState(x, y, g);
        if (this.current != null) {
            this.current.expose(g);
            this.current.move(x, y);
            this.current.expose(g);
        } else {
            this.current = this.getCanvas().getAutomaton().addState().move(x, y);
            if (this.getCanvas().getAutomaton().getInitialStates().size() == 0) {
                this.current.setInitial(true);
            }
            this.current.expose(g);
        }
        this.getCanvas().commitTransaction(true);
    }

    mouseDragged(g, e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if (x < 0 || y < 0) return;
        if (this.current != null) {
            this.current.expose(g);
            this.current.move(x, y);
            this.current.expose(g);
            this.getCanvas().commitTransaction(false);
        }
    }
    mouseReleased(g, e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if (x < 0 || y < 0) {
            if (this.current != null) {
                this.current.remove();
                this.current.expose(g);
            }
        }
        this.mouseDragged(g, e);
    }
    select(g) {
        super.select(g);
        let b = document.getElementById('state_button');
        b.style.border="solid 4px";
    }
    deselect(g) {
        super.deselect(g);
        let b = document.getElementById('state_button');
        b.style.border="none";
    }
}
