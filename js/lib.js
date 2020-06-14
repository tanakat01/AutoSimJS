class Character {
    static isISOControl(c) {
        return c < 0x20;
    }
}
const Color = {black : "black", white : "white", gray: "gray", green: "#00ff00", red: "red", blue : "blue"};

class Dimension {
    constructor(w, h) {
        this.width = w;
        this.height = h;
    }
    setSize(w, h) {
        this.width = w;
        this.height = h;
    }
}

class Cursor {
/*
    static CROSSHAIR_CURSOR = 0;
    static TEXT_CURSOR = 1;
*/
    static getDefaultCursor() {
        return 0;
    }
    static getPredefinedCursor(cursor) {
        return cursor;
    }
}


// https://javadoc.scijava.org/Java7/java/awt/Rectangle.html
class Rectangle {
    constructor(x, y, w, h) {
        this.setBounds(x, y, w, h);
    }
    translate(dx, dy) {
        this.x += dx;
        this.y += dy;
    }
    setBounds(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    fromBounding(b) {
        return new Rectangle(b.x, b.y, b.width, b.height); 
    }
    grow(h, v) {
        this.x -= h;
        this.y -= v;
        this.width += 2 * h;
        this.height = 2 * v;
    }
    add(x, y) {
        if (x < this.x) {
            this.width += this.x - x;
            this.x = x;
        } else if (x > this.x + this.width) {
            this.width = x - this.x;
        }
        if (y < this.y) {
            this.height += this.y - y;
            this.y = y;
        } else if (y > this.x + this.width) {
            this.width = x - this.x;
        }
    }
    addRect(rect) {
        this.add(rect.x, rect.y);
        this.add(rect.x + rect.width, rect.y + rect.height);
    }
    contains(x, y) {
        return this.x <= x && x <= this.x + this.width &&
            this.y <= y && y <= this.y + this.height;
    }
}

class FontMetrics {
    constructor(font) {
        this.font = font;
    }
    getLeading() { return 0; }
    getAscent() { return 10; }
    getDescent() { return 0;}    
}

class Graphics {
    constructor(context) {
        this.context = context;
    }
    setColor(color) {
        let ctx = this.context;
        //    console.log(ctx);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
    }
    drawLine(x0, y0, x1, y1) {
        let ctx = this.context;
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
    }
    fillRect(x, y, w, h) {
        let ctx = this.context;
        let x1 = x + w;
        let y1 = y + h;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y);
        ctx.lineTo(x1, y1);
        ctx.lineTo(x, y1);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.fill();
    }
    switchToWidth(w) {
        let ctx = this.context;
        ctx.lineWidth = w;
    }
    fillPolygon(xp, yp, len) {
        if (len < 3 || xp.length != len || yp.length != len) return;
        let ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(xp[len - 1], yp[len - 1]);
        for (let i = 0; i < len; i++) ctx.lineTo(xp[i], yp[i]);
        ctx.closePath();
        ctx.fill();
    }
    drawPolygon(xp, yp, len) {
        if (len < 3 || xp.length != len || yp.length != len) return;
        let ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(xp[len - 1], yp[len - 1]);
        for (let i = 0; i < len; i++) ctx.lineTo(xp[i], yp[i]);
        ctx.closePath();
        ctx.stroke();
    }
    drawPolyline(xp, yp, len) {
        if (len < 3 || xp.length != len || yp.length != len) return;
        let ctx = this.context;
        ctx.beginPath();
        ctx.moveTo(xp[0], yp[0]);
        for (let i = 1; i < len; i++) ctx.lineTo(xp[i], yp[i]);
        ctx.stroke();
    }
    fillOval(x, y, w, h) {
        let ctx = this.context;
        let center_x = x + w / 2;
        let center_y = y + h / 2;
        ctx.beginPath();
        ctx.ellipse(center_x, center_y, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    drawOval(x, y, w, h) {
        let ctx = this.context;
        let center_x = x + w / 2;
        let center_y = y + h / 2;
        ctx.beginPath();
        ctx.ellipse(center_x, center_y, w / 2, h / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    getFont() {
        let ctx = this.context;
        return ctx.font;
    }
    setFont(f) {
        let ctx = this.context;
        ctx.font = f;
    }
    getFontMetrics() {
        return new FontMetrics(this.getFont());
    }
    drawArc(arcx, arcy, arcwidth, archeight, arcstart_deg, arcangle_deg) {
        let center_x = arcx + arcwidth / 2;
        let center_y = arcy + archeight / 2;
        let arcstart = -arcstart_deg / 180 * Math.PI
        let arcend = -(arcstart_deg + arcangle_deg) / 180 * Math.PI
        
        let ctx = this.context;
        ctx.beginPath();
        ctx.arc(center_x, center_y, arcwidth / 2, arcstart, arcend, true);
        ctx.stroke();
    }
    drawString(text, x, y) {
        //console.log(['drawString',text,x,y]);
        let ctx = this.context;
        ctx.fillText(text, x, y);
    }
}

class Writer {
}

class GraphicsUtil {
/*
    static H_LEFT = -1;
    static H_CENTER = 0;
    static H_RIGHT = 1;
    static V_TOP = -1;
    static V_CENTER = 0;
    static V_BASELINE = 1;
    static V_BOTTOM = 2;
*/
    static switchToWidth(g, width) {
        g.switchToWidth(width);
    }
    static drawCenteredArc(g, x, y, r, start, dist) {
        g.drawArc(x - r, y - r, 2 * r, 2 * r, start, dist);
    }

    static getTextFontBounds(g, font, text, x, y, halign, valign) {
        if(g == null) return new Rectangle(x, y, 0, 0);
        //console.log('g.type=' + g.constructor.name);
        let oldfont = g.getFont();
        if(font != null) g.setFont(font);
        let ret = this.getTextBounds(g, text, x, y, halign, valign);
        if(font != null) g.setFont(oldfont);
        return ret;
    }
    static getTextBounds(g, text, x, y,  halign, valign) {
        if(g == null) return new Rectangle(x, y, 0, 0);
        /*
          let mets = g.getFontMetrics();
          let size = mets.getStringBounds(text, g);
          let width = (new Double(Math.ceil(size.getWidth()))).intValue();
          let ascent = mets.getAscent();
          let height = ascent + mets.getDescent();
        */
        let ctx = g.context;
        let mets = ctx.measureText(text);
        let width = mets.width;
        let ascent = 0;
        let height = 10;
        let ret = new Rectangle(x, y, width, height);

        switch(halign) {
        case GraphicsUtil_H_CENTER: ret.translate(-(width / 2), 0); break;
        case GraphicsUtil_H_RIGHT:  ret.translate(-width, 0); break;
        default: ;
        }
        switch(valign) {
        case GraphicsUtil_V_TOP:      break;
        case GraphicsUtil_V_CENTER:   ret.translate(0, -(ascent / 2)); break;
        case GraphicsUtil_V_BASELINE: ret.translate(0, -ascent); break;
        case GraphicsUtil_V_BOTTOM:   ret.translate(0, -height); break;
        default: ;
        }
        return ret;
    }
    /*
     */
    static drawTextFont(g, font, text, x, y, halign, valign) {
        let oldfont = g.getFont();
        if(font != null) g.setFont(font);
        this.drawText(g, text, x, y, halign, valign);
        if(font != null) g.setFont(oldfont);
    }
    static drawText(g, text, x, y, halign, valign) {
        if(text.length == 0) return;
        let bd = GraphicsUtil.getTextBounds(g, text, x, y, halign, valign);
        g.drawString(text, bd.x, bd.y + g.getFontMetrics().getAscent());
        //g.drawString(text, x, y);
    }
    static drawCenteredTextfunction(g, text, x, y) {
        this.drawText(g, text, x, y, GraphisUtil_H_CENTER, GraphicsUtil_V_CENTER);
    }
}

class JOptionPane {
    static showMessageDialog(parent, msg) {
        alert(msg);
    }
    static showConfirmDialog(parent, msg, title, optionType) {
        return (window.confirm(msg) ? 1 : 0);
    }
/*
    static YES_NO_OPTION = 2;
    static YES_OPTION = 1;
    static NO_OPTION = 0;
*/
}
