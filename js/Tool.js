/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class Tool {
    constructor(canvas) {
        this.canvas = canvas;
        this.cursor = Cursor.getDefaultCursor();
/*
        this.popup = null;
*/
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    setCursor(value) {
        this.cursor = value == null ? Cursor.getDefaultCursor() : value;
    }

    draw(g) { }
    select(g) {
        this.canvas.getAutomaton().doStop();
        this.canvas.setCursor(this.cursor);
    }
    deselect(g) {
        this.canvas.setCursor(Cursor.getDefaultCursor());
    }
    keyTyped(g, c) { }
    mouseExited(g, e) { }
    mouseMoved(g, e) { }
    mousePressed(g, e) { }
    mouseReleased(g, e) { }
    mouseDragged(g, e) { }
/*
    do_popup(n) {}
*/
}
