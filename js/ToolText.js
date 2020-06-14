/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

//
// DRAWING TOOLS
//
class ToolText extends Tool {
    constructor(canvas) {
        super(canvas);
        this.current = null;
        this.halign = GraphicsUtil_H_LEFT;
        this.valign = GraphicsUtil_V_BASELINE;
        this.setCursor(Cursor.getPredefinedCursor(Cursor_TEXT_CURSOR));
    }

    select(g) {
        super.select(g);
        let b = document.getElementById('text_button');
        b.style.border="solid 4px";
    }
    deselect(g) {
        super.deselect(g);
        if(this.current != null) {
            this.current = null;
        }
        if (this.popup != null) {
            this.popup.style.visibility="hidden";
        }
        let b = document.getElementById('text_button');
        b.style.border="none";
    }

    setHAlign(value) { this.halign = value; }
    setVAlign(value) { this.valign = value; }

    mouseReleased(g, e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        // deselect current label
        if(this.current != null) {
            this.current = null;
        }

        // if nothing found, create a new label
        if(this.current == null) {
            let item = new AutomatonLabel(this.getCanvas().getAutomaton());

            item.move(x, y).setAlignment(this.halign, this.valign);
            this.current = item.getLabel();
            this.getCanvas().getAutomaton().addComponent(item);
        }
        if(this.current != null) {
            this.current.exposeCursor(this.getCanvas(), g);
            this.getCanvas().expose(this.current.getBounds(g));
        }
        this.getCanvas().commitTransaction(false);
    }
    keyTyped(g, c) {
        if (c == "Shift" || c == "Control" || c == "Meta" || c == "Alt") return;
        if(this.current != null) {
            let prev = this.current.getBounds(g);
            this.current.exposeCursor(this.getCanvas(), g);
            let changed = this.current.addLetter(c);
            if(changed) {
                this.getCanvas().expose(prev);
                this.getCanvas().expose(this.current.getBounds(g));
                this.current.exposeCursor(this.getCanvas(), g);
                this.getCanvas().commitTransaction(false);
            }
        }
    }

    draw(g) {
        super.draw(g);
        if(this.current != null) this.current.drawCursor(g);
    }
    
    do_popup(n) {
        if (this.current != null) {
            if (n == "Delete") {
                this.getCanvas().getAutomaton().remove(this.current);
            }
        }
    }
}
