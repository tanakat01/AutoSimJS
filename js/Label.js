/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class Label {
    constructor(owner) {
        this.owner = owner;
        this.text = "";
        this.font = "16px sans-serif";
    }

    setText(text) {
        this.text = text;
    }

    isBold() {
        return this.font.indexOf('bold') >= 0;
    }

    isItalic() {
        return false;
    }

    getSize() {
        return 16;
    }

    getName() {
        return "SansSerif";
    }

    print(fout) {
        fout.print("text "); fout.printlnGroup(this.text);
        fout.print("font ");
        fout.beginGroup();
        let style = "";
        if (this.isBold()) style += "b";
        if (this.isItalic()) style += "i";
        if (style =="") style = "-";
        fout.print(this.getName() + " " + this.getSize() + " " + style);
        fout.endGroup();
        fout.println();
    }

    setKey(key, fin) {
        if (key == "text") {
            this.text = fin.readGroup();
        } else if (key == "font") {
            let desc = fin.readGroup();
            let toks = desc.split(' ');
            if (toks.length != 3) throw new Error("font format error");
            let style = [];
            let name = toks[0];
            if (name == 'SansSerif') {
                style.push('sans-serif');
            } else {
                style.push('arial');
            }
            let size = parseInt(toks[1]);
            style.push(size.toString() + 'px');
            let style_str = toks[2];
            for (let i = 0; i < style_str.length; i++) {
                switch(style_str.charAt(i)) {
                case 'b': style.push('bold'); break;
                case 'i': style.push('italic'); break;
                case '-': break;
                }
            }

            this.font = style.join(' ');
        } else {
            return false;
        }
        return true;
    }

    getBounds(g) {
        let ret = GraphicsUtil.getTextFontBounds(g, this.font, this.text,
                                                 this.owner.getLabelX(this), this.owner.getLabelY(this),
                                                 this.owner.getLabelHAlign(this), this.owner.getLabelVAlign(this));
        return ret;
    }

    getBoundsRect(bounds, g) {
        bounds.setBounds(this.getBounds(g));
        return bounds;
    }

    addToBounds(bounds, g) {
        if (this.text.length > 0) bounds.add(this.getBounds(g));
        return bounds;
    }

    draw(g) {
        if (this.text.length == 0) return;
        g.setColor(Color.black);
        GraphicsUtil.drawTextFont(g, this.font, this.text,
                                  this.owner.getLabelX(this), this.owner.getLabelY(this),
                                  this.owner.getLabelHAlign(this), this.owner.getLabelVAlign(this));
    }

    expose(canvas, g) {
        let rect = this.getBounds(g);
        canvas.expose(rect);
    }

    exposeCursor(anvas, g) {
        let rect = this.getBounds(g);
        canvas.expose(rect.x + rect.width, rect.y, 2, rect.height);
    }

    drawCursor(g) {
        let rect = this.getBounds(g);
        let x_pos = rect.x + rect.width + 1;
        let y_pos = rect.y;
        GraphicsUtil.switchToWidth(g, 1);
        g.setColor(Color.black);
        g.drawLine(x_pos, y_pos, x_pos, y_pos + g.getFontMetrics().getAscent());
    }

    drawText(text) {
        this.text = text;
    }
}
