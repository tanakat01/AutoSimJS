/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

//
// DRAWING TOOLS
//
class ToolTransition extends Tool {
    constructor(canvas) {
        super(canvas);
        this.current = null;
        this.start = null;
        this.cur_x;
        this.cur_y;
        this.to_expose = null;
        this.setCursor(Cursor.getPredefinedCursor(Cursor.CROSSHAIR_CURSOR));
    }

    select(g) {
        super.select(g);
        this.start = null;
    }

    mousePressed(g, e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        this.start = this.getCanvas().getAutomaton().findState(x, y, g);
        if(this.start == null) {
            let found = this.getCanvas().getAutomaton().find(x, y, g);
            if(found instanceof Transition) {
                this.current = found;
            } else {
                this.current = null;
            }
        }
        this.mouseDragged(g, e);
    }

    mouseDragged(g, e) {
        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if(x < 0 || y < 0) return;
        if(this.start != null) {
            if(this.to_expose != null) this.getCanvas().expose(this.to_expose);

            this.cur_x = x;
            this.cur_y = y;
            this.draw(g);
            if(this.to_expose != null) this.getCanvas().expose(this.to_expose);
        }
        if(this.current != null) {
            this.current.expose(g);
            this.current.move(x, y);
            this.current.expose(g);
        }
        this.getCanvas().commitTransaction(false);
    }

    mouseReleased(g, e) {
        this.mouseDragged(g, e);
        if(this.to_expose != null) this.getCanvas().expose(this.to_expose);

        let rect = e.target.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        if(this.start != null) {
            let dst = this.getCanvas().getAutomaton().findState(x, y, g);
            if(this.start == null || dst == null) {
                ; // do nothing
            } else {
                let transition
                    = this.getCanvas().getAutomaton().addTransition(this.start, dst);
                //console.log('mouseReleased transition = ' + transition);
                if(transition != null) {
                    transition.expose(g);
                    this.getCanvas().commitTransaction(true);
                }
            }
        }   
        this.to_expose = null;
        this.current = null;
        this.start = null;
        this.getCanvas().repaint();
    }

    draw(g) {
        if(this.start == null) return;

        let x = this.cur_x;
        let y = this.cur_y;
        let dst = this.getCanvas().getAutomaton().findState(x, y, g);
        if(this.start == dst) {
            this.to_expose = null;
            return;
        }

        if(dst != null) {
            x = dst.getX();
            y = dst.getY();
        }

        let th = Math.atan2(this.start.getY() - y, this.start.getX() - x);
        let xp = [
            Math.floor(x + Transition.ARROW_LEN
                       * Math.cos(th + Transition.ARROW_THETA)),
            Math.floor(x),
            Math.floor(x + Transition.ARROW_LEN
                       * Math.cos(th - Transition.ARROW_THETA)),
        ];
        let yp = [
            Math.floor(y + Transition.ARROW_LEN
                       * Math.sin(th + Transition.ARROW_THETA)),
            Math.floor(y),
            Math.floor(y + Transition.ARROW_LEN
                       * Math.sin(th - Transition.ARROW_THETA)),
        ];

        GraphicsUtil.switchToWidth(g, 3);
        g.setColor(Color.blue);
        g.drawPolyline(xp, yp, 3);
        g.drawLine(this.start.getX(), this.start.getY(), x, y);

        this.to_expose = new Rectangle(x, y, 0, 0);
        this.to_expose.add(this.start.getX(), this.start.getY());
        this.to_expose.add(xp[0], yp[0]);
        this.to_expose.add(xp[2], yp[2]);
        this.to_expose.grow(3, 3);
    }

    do_popup(c) {
        if (this.current != null) {
            if (c == "Delete") {
                this.getCanvas().getAutomaton().remove(this.current);
            }
            else {
                if (!this.current.transitsOn(c)) {
                    this.current.addTransit(c);
                } else {
                    this.current.removeTransit(c);
                }
            }
        }
    }
    select(g) {
        super.select(g);
        let b = document.getElementById('transition_button');
        b.style.border="solid 4px";
    }
    deselect(g) {
        super.deselect(g);
        if (this.popup != null) {
            this.popup.style.visibility="hidden";
        }
        let b = document.getElementById('transition_button');
        b.style.border="none";
    }
}
