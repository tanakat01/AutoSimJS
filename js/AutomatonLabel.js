/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class AutomatonLabelOwner {
    constructor(parent) {
        this.parent = parent;
    }
    getLabelX(which) { return this.parent.x; }
    getLabelY(which) { return this.parent.y; }
    getLabelHAlign(which) { return this.parent.halign; }
    getLabelVAlign(which) { return this.parent.valign; }
}
class AutomatonLabel extends AutomatonComponent {
    constructor(automaton) {
        super(automaton);
        this.x = 0;
        this.y = 0;
        this.halign = GraphicsUtil_H_LEFT;
        this.valign = GraphicsUtil_V_BASELINE;
        let owner = new AutomatonLabelOwner(this);
        this.label = new Label(owner);
    }

    move(x, y) {
        this.x = x;
        this.y = y;
        this.getAutomaton().invalidateBounds();
        return this;
    }

    setAlignment(halign, valign) {
        this.halign = halign;
        this.valign = valign;
        return this;
    }

    getLabel() { return this.label; }
    getBounds(rect, g) {
        return this.label.getBoundsRect(rect, g);
    }
    isIn(x, y, g) {
        return this.label.getBounds(g).contains(x, y);
    }
    remove() {
        this.getAutomaton().removeComponent(this);
    }
    draw(g) {
        this.label.draw(g);
    }

    print(fout) {
        super.print(fout);
        this.label.print(fout);
        fout.print("coord "); fout.printlnGroup(Math.round(this.x) + " " + Math.round(this.y));
        if(this.halign != GraphicsUtil_H_LEFT) {
            fout.print("halign");
            switch(thishalign) {
            case GraphicsUtil_H_RIGHT:
                fout.printlnGroup("right");
                break;
            case GraphicsUtil_H_CENTER:
                fout.printlnGroup("center");
                break;
            default: fout.printlnGroup("??");
            }
        }
        if(this.valign != GraphicsUtil_V_BASELINE) {
            fout.print("valign");
            switch(this.halign) {
            case GraphicsUtil_V_BOTTOM:
                fout.printlnGroup("bottom");
                break;
            case GraphicsUtil_V_CENTER:
                fout.printlnGroup("center");
                break;
            case GraphicsUtil_V_TOP:
                fout.printlnGroup("top");
                break;
            default: fout.printlnGroup("??");
            }
        }
    }

    setKey(key, fin) {
        if(key =="coord") {
            let value = fin.readGroup();
            let sep = value.indexOf(' ');
            if(sep < 0) {
                throw new Error("Missing argument");
            }
            try {
                this.move(parseInt(value.substring(0, sep)),
                     parseInt(value.substring(sep + 1)));
            } catch(e) {
                throw new Error("Nonnumeric argument");
            }
            return true;
        } else if(key == "halign") {
            let val = fin.readGroup();
            if(val == "right") this.halign = GraphicsUtil_H_RIGHT;
            if(val =="center") this.halign = GraphicsUtil_H_CENTER;
            return true;
        } else if(key =="valign") {
            let val = fin.readGroup();
            if(val =="bottom") this.halign = GraphicsUtil_V_BOTTOM;
            if(val =="center") this.halign = GraphicsUtil_V_CENTER;
            if(val =="top") this.halign = GraphicsUtil_V_TOP;
            return true;
        } else if(this.label.setKey(key, fin)) {
            return true;
        } else {
            return super.setKey(key, fin);
        }
    }
    showMenu(clientX, clientY) {
        let canvas = this.getAutomaton().getCanvas();
        let rect = canvas.jscanvas.getBoundingClientRect();
        let x = clientX + rect.left;
        let y = clientY + rect.top;
        let ts = new ToolText(canvas);
        ts.current = this;    
        canvas.setTool(ts);
        let popup = document.getElementById('text_popup');
        ts.popup = popup;
        //popup.style.position="relative";
        popup.style.visibility="visible";
        popup.style.opacity="1";
        popup.style.display="block";
        popup.style.left=x + "px";
        popup.style.top=y + "px";
    }
    
}
