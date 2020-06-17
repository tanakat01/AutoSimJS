/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class Canvas{
    /*
    static EXTRA_SPACE = 50;
    */
    constructor(jscanvas) {
        // private JScrollPane parent = null;
        this.toolbox = null;
        this.tape = null;
        this.cur_tool = null;
        this.mouseDown = false;
        this.automaton = null;
        this.select = null;
        this.dirty = false;
        this.suppress_repaint = false;
        this.jscanvas = jscanvas;
        //    setBackground(Color.white);
        //        addMouseListener(new MyMouseListener());
        let canvas = this;
        //public void mouseClicked(MouseEvent e) { }
        //        public void mouseEntered(MouseEvent e) { }
        // public void mouseExited(MouseEvent e) {
        jscanvas.addEventListener("mousedown", function(e) {
            if (canvas.has_popup()) {
//                console.log('hide popup');
                canvas.hide_popup();
                return;
            }
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            if(canvas.cur_tool == null) return;
            let right = (e.which != 1 || e.ctrlKey || e.metaKey);
            if(right) {
                // mouse-press requests component drop-down menu
                canvas.mouseDown = false;
                let g = canvas.getGraphics();
                let comp = canvas.automaton.find(x, y, g);
                //console.log(['comp',comp]);
                if(comp != null)
                    comp.showMenu(x, y);
            } else {
                // mouse-press represents tool use
                canvas.mouseDown = true;
                canvas.cur_tool.mousePressed(canvas.getGraphics(), e);
            }
            canvas.grabFocus();
        }, false);
        jscanvas.addEventListener("mouseup", function(e) {
            if(canvas.cur_tool == null) {
                JOptionPane.showMessageDialog(null, "You must first select a tool.");
                return;
            }
            if(canvas.mouseDown) {
                canvas.mouseDown = false;
                canvas.cur_tool.mouseReleased(canvas.getGraphics(), e);
                canvas.grabFocus();
            }
        }, false);
        
        
        //    addMouseMotionListener(new MyMouseMotionListener());
        jscanvas.addEventListener("mousemove", function(e) {
            if(canvas.cur_tool == null) return;
            let g = canvas.getGraphics();
            if (canvas.mouseDown) {
                canvas.cur_tool.mouseDragged(g, e);
            } else {
                canvas.cur_tool.mouseMoved(g, e);
            }
        }, false);
        
        jscanvas.setAttribute('tabindex', 0); // focusしている時のみ、keyDown,up を有効に
        //    addKeyListener(new MyKeyListener());
        jscanvas.addEventListener("keydown", function(e) {
//            console.log('keydown, e.key=' + e.key + ',e.code=' + e.code);
            if (canvas.has_popup()) {
//                console.log('hide popup');
                canvas.hide_popup();
                return;
            }
            if(canvas.cur_tool == null) return;
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
        //    console.log('setTool' + what);
        this.hide_popup();

        if(what == null) return;
        if(this.cur_tool != null) this.cur_tool.deselect(this.getGraphics());
        this.cur_tool = what;
        if(this.cur_tool != null) this.cur_tool.select(this.getGraphics());
    }
    getAutomaton() { return this.automaton; }
    getToolBox() { return this.toolbox; }
    getTape() { return this.tape; }
    //
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
        if(this.tape != null && this.toolbox != null && automaton != null) {
            automaton.setToolBoxTape(this.toolbox, this.tape);
        }
        this.repaint();
    }
    setToolBox(what) {
        this.toolbox = what;
        if(this.tape != null && this.toolbox != null && this.automaton != null) {
            this.automaton.setToolBoxTape(this.toolbox, this.tape);
        }
    }
    setTape(what) {
        this.tape = what;
        if(this.tape != null && this.toolbox != null && this.automaton != null) {
            this.automaton.setToolBoxTape(this.toolbox, this.tape);
        }
    }

    //
    // graphics methods
    //
    paintComponent(g) {
        // super.paintComponent(g);
        
        // Graphics2D g2 = (Graphics2D)g;
        //RenderingHints rh = new RenderingHints(RenderingHints.KEY_ANTIALIASING,
        //             RenderingHints.VALUE_ANTIALIAS_ON);
        // g2.setRenderingHints(rh);
        
        this.dirty = false;
        this.automaton.draw(g);
        //console.log('this.cur_tool=' + this.cur_tool);
        if(this.cur_tool != null) this.cur_tool.draw(g);
    }
    commitTransaction(dirty) {
        this.computeSize();
    }
    setSuppressRepaint(flag) {
        this.suppress_repaint = flag;
        if(!flag && this.dirty) this.repaint();
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
        if(!this.dirty) {
            this.dirty = true;
            if(!this.suppress_repaint) this.repaint(20);
        }
    }
    //
    repaint() {
        let g = this.getGraphics();
        g.setColor(Color.white);
        g.fillRect(0, 0, 800, 600);
        this.paintComponent(g);
    }
    
    expose(rect) {
        this.exposeXYWH(rect.x, rect.y, rect.width, rect.height);
    }
    setScrollPane(parent) {
        this.parent = parent;
        this.computeSize();
    }
    computeSize() {
        let ret = this.automaton.getDimensions(this.getGraphics());
        ret.setSize(ret.width + Canvas_EXTRA_SPACE, ret.height + Canvas_EXTRA_SPACE);
        if(this.parent != null) this.dimAdd(ret, this.parent.getViewport().getSize());
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
    //
    dimAdd(x, y) {
        if(y.width > x.width) x.setSize(y.width, x.height);
        if(y.height > x.height) x.setSize(x.width, y.height);
    }
    //
    setCursor(cursor) {
    }
    // handle popup menu
    popup(n) {
        //console.log('Canvas state_popup, this.cur_tool=' + this.cur_tool);
        if (this.cur_tool != null) {
            //      console.log('this.cur_tool=' + this.cur_tool.constructor.name);
            this.cur_tool.do_popup(n);
/*
            let statepopup = this.cur_tool.popup;
            statepopup.style.visibility="hidden";
            this.cur_tool.current=null;
            this.cur_tool.popup=null;
*/
            this.repaint();
        }
    }
    has_popup() {
//        return this.select != null || (this.cur_tool != null && this.cur_tool.popup != null);
        return this.select != null;
    }
    hide_popup() {
        let changed = false;
        if (this.select != null) {
            let parent = document.getElementById('popups');
            parent.removeChild(this.select);
            this.select = null;
            changed = true;
        }
/*
        if (this.cur_tool != null && this.cur_tool.popup != null) {
            this.cur_tool.popup.style.visibility="hidden";
            this.cur_tool.popup=null;
            this.cur_tool.current=null;
            changed = true;
        }
*/
        if (changed) this.repaint();
    }
    
    /*
    //
    // Scrollable methods
    //
    public Dimension getPreferredScrollableViewportSize() {
    return getPreferredSize();
    }
    public int getScrollableBlockIncrement(Rectangle visibleRect,
    int orientation, int direction) {
    if(direction == SwingConstants.VERTICAL) {
    return visibleRect.height / 10 * 10;
    } else {
    return visibleRect.width / 10 * 10;
    }
    }
    public boolean getScrollableTracksViewportHeight() {
    return false;
    }
    public boolean getScrollableTracksViewportWidth() {
    return false;
    }
    public int getScrollableUnitIncrement(Rectangle visibleRect,
    int orientation, int direction) {
    return 10;
    }

    //
    // Printable methods
    //
    public int getNumberOfPages(PageFormat format) {
    return 1;
    }
    public int print(Graphics g, PageFormat format, int pageIndex) {
    if(pageIndex >= 1) {
    return Printable.NO_SUCH_PAGE;
    }

    Rectangle bounds = automaton.getBounds(g);

    if(g instanceof Graphics2D) {
    double scale = 1.0;
    if(format.getImageableWidth() < bounds.width) {
    double t = (double) format.getImageableWidth() / bounds.width;
    if(t < scale) scale = t;
    }
    if(format.getImageableHeight() < bounds.height) {
    double t = (double) format.getImageableHeight() / bounds.height;
    if(t < scale) scale = t;
    }

    AffineTransform xform = ((Graphics2D) g).getTransform();
    xform.scale(scale, scale);
    xform.translate(-bounds.x, -bounds.y);
    ((Graphics2D) g).setTransform(xform);
    }

    Rectangle clip = g.getClipBounds();
    clip.add(bounds.x, bounds.y);
    clip.add(bounds.x + bounds.width, bounds.y + bounds.height);
    g.setClip(clip);

    g.translate((int) Math.floor(format.getImageableX()),
    (int) Math.floor(format.getImageableY()));

    automaton.draw(g);
    return Printable.PAGE_EXISTS;
    }
    */
}
