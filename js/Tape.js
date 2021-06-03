/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class TapeContents {
    constructor() {
        this.positives = [];
        this.negatives = [];
        this.blank = Alphabet_BLANK;
    }

    get(position) {
        let which = position < 0 ? this.negatives : this.positives;
        if (position < 0) position = -position;
        if (position >= which.length) return Alphabet_BLANK;
        let ret = which[position];
        return ret == null ? Alphabet_BLANK : ret;
    }

    getContent() {
        return [this.positives.concat(), this.negatives.concat()];
    }

    setContent(data) {
        this.positives = data[0];
        this.negatives = data[1];
    }

    set(position, value) {
        let which = position < 0 ? this.negatives : this.positives;
        if (position < 0) position = -position
        while (which.length <= position) which.push(this.blank);
        which[position] = value;
    }

    getMaximumPosition() {
        for (let i = this.positives.length - 1; i >= 0; i--) {
            let val = this.positives[i];
            if (val != null && val != Alphabet_BLANK) return i;
        }
        return 0;
    }

    getMinimumPosition() {
        for (let i = this.negatives.length - 1; i >= 0; i--) {
            let val = this.negatives[i];
            if (val != null && val != this.blank) return -i;
        }
        return 0;
    }
}

class TapeRepresentation {
    constructor(tape) {
        this.tape = tape;
        this.last_length = -1;
        this.has_focus = false;
        this.computeSize();
    }

    paintComponent(g) {
        let base = this.tape.scroll.getValue();
        let width = this.getSize().width;
        let x;
        // draw background for cursor
        if (this.hasFocus()) {
            x = (this.tape.cursor - base) * Tape_BLANK_WIDTH;
            g.setColor(Color.black);
            g.fillRect(x, 0, Tape_BLANK_WIDTH, Tape_BLANK_HEIGHT);
        }
        // draw dividing lines
        GraphicsUtil.switchToWidth(g, 3);
        g.setColor(Color.gray);
        g.drawLine(0, 0, width, 0);
        g.drawLine(0, Tape_BLANK_HEIGHT, width, Tape_BLANK_HEIGHT);
        for (let i = 0; i * Tape_BLANK_WIDTH < width; i++) {
            x = i * Tape_BLANK_WIDTH;
            g.drawLine(x, 0, x, Tape_BLANK_HEIGHT);
        }
        GraphicsUtil.switchToWidth(g, 1);
        // draw head of reader
        if (this.tape.show_head) {
            x = Math.floor((this.tape.head_draw - base) * Tape_BLANK_WIDTH
                           + Tape_BLANK_WIDTH / 2);
            let xp = [ x - 10, x + 10, x ];
            let yp = [ 3, 3, 13 ];
            g.setColor(Color.green);
            g.fillPolygon(xp, yp, xp.length);
            g.setColor(Color.black);
            g.drawPolygon(xp, yp, xp.length);
        }
        // draw characters
        g.setColor(Color.black);
        x = Tape_BLANK_WIDTH / 2;
        for (let i = 0; i * Tape_BLANK_WIDTH < width; i++, x += Tape_BLANK_WIDTH) {
            let c = this.tape.contents.get(base + i);
            if (c == Alphabet_BLANK) continue;
            let is_cur = (base + i == this.tape.cursor && this.hasFocus());
            if (is_cur) g.setColor(Color.white);
            GraphicsUtil.drawText(g, "" + c, x, Tape_BLANK_HEIGHT / 2,
                                  GraphicsUtil_H_CENTER, GraphicsUtil_V_CENTER);
            if (is_cur) g.setColor(Color.black);
        }
    }

    expose(position) {
        this.repaint();
    }

    locatePosition(x, y) {
        return this.tape.scroll.getValue() + Math.floor(x / Tape_BLANK_WIDTH);
    }

    computeSize() {
        let len = this.tape.contents.getMaximumPosition() - this.tape.contents.getMinimumPosition() + 1;
        len += Tape_BLANKS_SHOW;
        if (this.tape.extends_left) len += Tape_BLANKS_SHOW;
        if (len == this.last_length) return;
        if (this.tape.scroll != null) this.tape.scroll.computeValues();
    }
    /* JPanels */
    repaint() {
        let context = this.tape.canvas.getContext('2d');
        let g = new Graphics(context);
        g.setColor(Color.white);
        g.fillRect(0, 0, this.tape.canvas.width, this.tape.canvas.height);
        this.paintComponent(g);
    }

    getSize() {
        return new Dimension(this.tape.canvas.width, this.tape.canvas.height);
    }

    setFocus(val) {
        this.has_focus = val;
        this.repaint();
    }
    hasFocus() {
        return this.has_focus;
    }
    /* end JPanels */
}

class TapeScroll {
    constructor(tape) {
        this.tape = tape;
    }

    getValue() {
        return 0;
    }

    setValue(pos) {
    }

    getBlockIncrement() {
        return 5;
    }

    computeValues() {
    }
}

class Tape {
    constructor(canvas) {
        this.listeners = [];
        this.canvas = canvas;
        this.contents = new TapeContents();
        this.cursor = 0;
        this.head = 0;
        this.head_draw = 0;
        this.show_head = false;
        this.extends_left = false;
        this.representation = new TapeRepresentation(this);
        this.scroll = new TapeScroll(this);
        this.reset();
        this.pressed_loc = Number.MIN_VALUE;
        let tape = this;
        this.canvas.addEventListener("mousedown", function(e) {
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            tape.pressed_loc = tape.representation.locatePosition(x, y);
        }, false);
        this.canvas.addEventListener("mouseup", function(e) {
            let rect = e.target.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            let loc = tape.representation.locatePosition(x, y);
            if (loc == tape.pressed_loc) {
                let listeners = tape.listeners;
                for (let i = 0; i < listeners.length; i++) {
                    listeners[i].positionClicked(tape, loc);
                }
            }
            tape.pressed_loc = Number.MIN_VALUE;
        }, false);
        this.canvas.setAttribute('tabindex', 0);
        this.canvas.addEventListener("keydown", function(e) {
            let c = e.key;
            let listeners = tape.listeners;
            for (let i = 0; i < listeners.length; i++) {
                listeners[i].keyTyped(tape, c);
            }
        }, false);
        this.tm_mode = false;
    }

    addTapeListener(listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }
    }

    clearTapeListener() {
        this.listeners = [];
    }

    removeTapeListener(listener) {
        let i = this.listeners.indexOf(listener);
        if (i >= 0) this.listeners.splice(i, 1);
    }

    completeReset() {
        this.show_head = false;
        this.extends_left = false;
        this.cursor = 0;
        this.reset();
        this.removeFocus();
    }

    set_tm_mode(val) {
        if (val) {
            show_tmtools();
        } else {
            hide_tmtools();
        }
        this.tm_mode = val;
    }

    reset() {
        this.contents = new TapeContents();
        this.representation.computeSize();
        if (this.tm_mode) {
            this.setHeadPosition(2);
            this.setCursorPosition(2);
            this.removeFocus();
            this.setShowHead(true);
        } else {
            this.setHeadPosition(0);
            this.setCursorPosition(0);
            this.removeFocus();
        }
        this.repaint();
    }

    repaint() {
        this.representation.repaint();
    }

    setExtendsLeft(value) {
        if (this.extends_left != value) {
            this.extends_left = value;
            this.scroll.computeValues();
            this.representation.computeSize();
        }
    }

    write(pos, value) {
        this.contents.set(pos, value);
        this.representation.expose(pos);
    }

    read(pos) {
        return this.contents.get(pos);
    }

    getHeadPosition() { return this.head; }

    setHeadPosition(value) {
        this.representation.expose(this.head);
        this.head = value;
        this.head_draw = value;
        this.representation.expose(this.head);
        this.moveIntoView(this.head);
        this.representation.computeSize();
    }

    //setHeadPositionAnimate(value) {
    //    this.representation.expose(this.head);
    //    let old_head = this.head;
    //    this.head = value;
    //    return new HeadAnimation(old_head, value);
    //}

    setShowHead(value) {
        this.show_head = value;
        this.representation.expose(this.head);
    }

    getCursorPosition() { return this.cursor; }

    setCursorPosition(value) {
        this.representation.expose(this.cursor);
        this.cursor = value;
        this.moveIntoView(this.cursor);
        this.representation.expose(this.cursor);
    }

    moveIntoView(pos) {
        let val = this.scroll.getValue();
        let block = this.scroll.getBlockIncrement();
        if (pos < val) this.scroll.setValue(pos);
        if (pos >= val + block) this.scroll.setValue(pos - block + 1);
    }

    grabFocus() {
        this.canvas.focus();
        if (this.representation != null) {
            this.representation.setFocus(true);
        }
    }

    removeFocus() {
        if (this.representation != null) {
            this.representation.setFocus(false);
        }
    }
}
