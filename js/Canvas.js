/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class Canvas{
    constructor(jscanvas) {
        this.tape = null;
        this.cur_tool = null;
        this.mouseDown = false;
        this.automaton = null;
        this.select = [];
        this.dirty = false;
        this.suppress_repaint = false;
        this.jscanvas = jscanvas;
        this.test = null;
        this.id = new Date().getTime().toString(16) + Math.floor(1000 * Math.random()).toString(16);
        let canvas = this;
        jscanvas.addEventListener("mousedown", function(e) {
            if (canvas.has_popup()) {
                canvas.hide_popup();
                return;
            }
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            if (canvas.cur_tool == null) return;
            let right = (e.which != 1 || e.ctrlKey || e.metaKey);
            if (right) {
                // mouse-press requests component drop-down menu
                canvas.mouseDown = false;
                let g = canvas.getGraphics();
                let comp = canvas.automaton.find(x, y, g);
                if (comp != null)
                    comp.showMenu(x, y);
            } else {
                // mouse-press represents tool use
                canvas.mouseDown = true;
                canvas.cur_tool.mousePressed(canvas.getGraphics(), e);
            }
            canvas.grabFocus();
        }, false);
        jscanvas.addEventListener("mouseup", function(e) {
            if (canvas.cur_tool == null) {
                JOptionPane.showMessageDialog(null, "You must first select a tool.");
                return;
            }
            if (canvas.mouseDown) {
                canvas.mouseDown = false;
                canvas.cur_tool.mouseReleased(canvas.getGraphics(), e);
                canvas.grabFocus();
            }
        }, false);
        jscanvas.addEventListener("mousemove", function(e) {
            if (canvas.cur_tool == null) return;
            let g = canvas.getGraphics();
            if (canvas.mouseDown) {
                canvas.cur_tool.mouseDragged(g, e);
            } else {
                canvas.cur_tool.mouseMoved(g, e);
            }
        }, false);
        
        jscanvas.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に
        jscanvas.addEventListener("keydown", function(e) {
            if (canvas.has_popup()) {
                canvas.hide_popup();
                return;
            }
            if (canvas.cur_tool == null) return;
            let c = e.key;
            if (c == 'Escape') {
                canvas.hide_popup();
            }
            else {
                let g = canvas.getGraphics();
                canvas.cur_tool.keyTyped(g, c);
            }
        }, false);
        this.setAutomaton(new DFA());
    }

    setTool(what) {
        this.hide_popup();
        if (what == null) return;
        if (this.cur_tool != null) this.cur_tool.deselect(this.getGraphics());
        this.cur_tool = what;
        if (this.cur_tool != null) this.cur_tool.select(this.getGraphics());
    }

    setTest(test) {
        this.test = test;
    }
    getAutomaton() { return this.automaton; }

    getTape() { return this.tape; }

    getGraphics() {
        return new Graphics(this.jscanvas.getContext('2d'));
    }

    grabFocus() {
        this.jscanvas.focus({preventScroll:true});
    }

    setAutomaton(automaton) {
	this.hide_popup();
	automaton.setCanvas(null);
        this.automaton = automaton;
        automaton.setCanvas(this);
        if (this.tape != null && automaton != null) {
            automaton.setTape(this.tape);
        }
        if (this.test != null && this.test.parent !=null && this.test.parent.style.visibility == 'visible') {
            this.test.show();
        }
        this.repaint();
    }

    setTape(what) {
        this.tape = what;
        if (this.tape != null && this.automaton != null) {            
            this.automaton.setTape(this.tape);
        }
    }

    //
    // graphics methods
    //
    paintComponent(g) {
        this.dirty = false;
        this.automaton.draw(g);
        if (this.cur_tool != null) this.cur_tool.draw(g);
    }

    commitTransaction(dirty) {
        this.computeSize();
    }

    setSuppressRepaint(flag) {
        this.suppress_repaint = flag;
        if (!flag && this.dirty) this.repaint();
    }

    exposeAll() {
        this.expose(0, 0, this.getWidth(), this.getHeight());
    }

    getWidth() {
        return this.jscanvas.width;
    }

    getHeight() {
        return this.jscanvas.height;
    }

    exposeXYWH(x, y, width, height) {
        if (!this.dirty) {
            this.dirty = true;
            if (!this.suppress_repaint) this.repaint(20);
        }
    }

    repaint() {
        let g = this.getGraphics();
        g.setColor(Color.white);
        g.fillRect(0, 0, this.jscanvas.width, this.jscanvas.height);
        this.paintComponent(g);
    }
    
    expose(rect) {
        this.exposeXYWH(rect.x, rect.y, rect.width, rect.height);
    }

    computeSize() {
        let ret = this.automaton.getDimensions(this.getGraphics());
        ret.setSize(ret.width + Canvas_EXTRA_SPACE, ret.height + Canvas_EXTRA_SPACE);
        if (this.parent != null) this.dimAdd(ret, this.parent.getViewport().getSize());
        this.setPreferredSize(ret);
        this.revalidate();
    }
    // JPanel method
    revalidate() {
    }

    setPreferredSize(dim) {
        let changed = false;
        if (dim.width > this.getWidth()) {
            this.jscanvas.width = dim.width;
            changed = true;
        }
        if (dim.height > this.getHeight()) {
            this.jscanvas.height = dim.height;
            changed = true;
        }
        this.repaint();
    }

    dimAdd(x, y) {
        if (y.width > x.width) x.setSize(y.width, x.height);
        if (y.height > x.height) x.setSize(x.width, y.height);
    }

    setCursor(cursor) {
    }
    // handle popup menu
    popup(n) {
        if (this.cur_tool != null) {
            this.cur_tool.do_popup(n);
            this.repaint();
        }
    }

    has_popup() {
        return this.select.length > 0;
    }

    hide_popup() {
        let changed = false;
        while (this.select.length > 0) {
            let parent = document.getElementById('popups');
            let select = this.select.pop();
            parent.removeChild(select);
            changed = true;
        }
        if (changed) this.repaint();
    }
}
