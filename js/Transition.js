/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class Transition extends AutomatonComponent {
/*
    static ARROW_LEN = 15.0;
    static ARROW_THETA = Math.PI / 6.0;
    static DEFAULT_OFFSET_THETA = Math.PI / 6.0;
    static DEFAULT_SELFLOOP_THETA = 0.75 * Math.PI;
    static CURSOR_R = State_RADIUS / 2;
*/
    /*
      private class TransitMenuItem extends JCheckBoxMenuItem
      implements ActionListener {
      private char c;

      public TransitMenuItem(char c) {
      super(Alphabet.toString(c));
      this.c = c;
      setState(transitsOn(c));
      setEnabled(transitsOn(c) || canBeTransit(c));
      addActionListener(this);
      }

      public void actionPerformed(ActionEvent e) {
      if(getState()) addTransit(c);
      else removeTransit(c);
      }
      }
    */
    constructor(automaton, src, dst) {
        super(automaton);
        this.src = src;
        this.dst = dst;
        this.transits = "";
        this.offset_theta = Transition_DEFAULT_OFFSET_THETA;
        if(src == dst) this.offset_theta = Transition_DEFAULT_SELFLOOP_THETA;
        this.label = new Label(this);
        
        this.bounds = null; // bounding box

        this.start_x = 0;
        this.start_y = 0;
        this.end_x = 0;
        this.end_y = 0; // this is for memory
        this.old_theta = 0;

        this.cx = 0; // information about arc
        this.cy = 0;
        this.r = 0;
        this.astart = 0;
        this.alength = 0;

        this.arcx = 0; // information about arc
        this.arcy = 0;
        this.arcwidth = 0;   // 0 when line should be drawn
        this.arcstart = 0;
        this.arclength = 0;
        this.clockwise = 0;

        this.line_x0 = 0; // information about line (when applicable)
        this.line_x1 = 0;
        this.line_y0 = 0;
        this.line_y1 = 0;

        this.arrowx = 0;  // information about arrow coords
        this.arrowy = 0;
        this.arrowxl = 0;
        this.arrowyl = 0;
        this.arrowxr = 0;
        this.arrowyr = 0;

        this.textx = 0;   // information about label location
        this.texty = 0;
        this.halign = 0;
        this.valign = 0;

        this.cursor_exists = false; // info about green dot
        this.cursor_progress = 0.0;
        this.cursor_x = 0;
        this.cursor_y = 0;
        this.computeCircle();
        this.setLabelText();
    }
    toString() {
        return JSON.stringify({
            transits : this.transits,
            offset_theta :this.offset_theta,
            label :this.label.text,
            bounds : this.bounds = null,
            start_x : this.start_x,
            start_y : this.start_y,
            end_x : this.end_x,
            end_y : this.end_y,
            old_theta : this.old_theta,
            cx : this.cx,
            cy : this.cy,
            r : this.r,
            astart : this.astart,
            alength : this.alength,
            arcx : this.arcx,
            arcy : this.arcy,
            arcwidth : this.arcwidth,
            arcstart : this.arcstart,
            arclength : this.arclength,
            clockwise : this.clockwise,
            lien_x0 : this.line_x0,
            line_x1 : this.line_x1,
            line_y0 : this.line_y0,
            line_y1 : this.line_y1,
            arrowx : this.arrowx,
            arrowy : this.arrowy,
            arrowxl : this.arrowxl,
            arrowyl : this.arrowyl,
            arrowxr : this.arrowxr,
            arrowxr : this.arrowyr,
            textx : this.textx,
            texty : this.texty,
            halign : this.halign,
            valign : this.valign,
            cursor_exists : this.cursor_exists,
            cursor_progress : this.cursor_progress,
            cursor_x : this.cursor_x,
            cursor_y : this.cursor_y
        });
    }
    /*
      protected JMenuItem createTransitItem(char c) {
      return new TransitMenuItem(c);
      }
    */
    remove() { this.getAutomaton().removeTransition(this); }

    getSource() { return this.src; }
    getDest() { return this.dst; }
    transitsOn(what) {
        return this.transits.indexOf(what) >= 0;
    }
    canTransit() {
        return this.transits != "";
    }


    setCursorExists(flag) {
        if(this.cursor_exists != flag) {
            this.cursor_exists = flag;
            this.setCursorProgress(this.cursor_progress);
        }
    }
    setCursorProgress(fraction) {
        this.cursor_progress = fraction;

        let old_x = this.cursor_x;
        let old_y = this.cursor_y;
        let cursor_angle = 0;
        if(this.clockwise) {
            cursor_angle = this.astart + fraction * this.alength;
        } else {
            cursor_angle = this.astart + (1.0 - fraction) * this.alength;
        }
        this.cursor_x = Math.floor(this.cx + this.r * Math.cos(cursor_angle) - Transition_CURSOR_R);
        this.cursor_y = Math.floor(this.cy - this.r * Math.sin(cursor_angle) - Transition_CURSOR_R);
//        console.log('this.cursor_x = ' + this.cursor_x);
        let w = 2 * Transition_CURSOR_R + 4;
        this.getAutomaton().getCanvas().expose(old_x - 2, old_y - 2, w, w);
        if(this.cursor_exists) {
            this.getAutomaton().getCanvas().expose(this.cursor_x - 2, this.cursor_y - 2, w, w);
        }
    }

    getLabelX(which) { return this.textx; }
    getLabelY(which) { return this.texty; }
    getLabelHAlign(which) { return this.halign; }
    getLabelVAlign(which) { return this.valign; }
    setLabelText() {
        let automaton = this.getAutomaton();
        //console.log('automaton=' + automaton);
        let canvas = automaton.getCanvas();
        //console.log('canvas=' + canvas);
        if(canvas != null) this.label.expose(canvas, canvas.getGraphics());
        this.label.setText(this.determineLabelText());
        if(canvas != null) this.label.expose(canvas, canvas.getGraphics());
    }
    determineLabelText() {
        if(this.transits == null || this.transits == "") {
            return "none";
        } else {
            let ret = '';
            for(let i = 0; i < this.transits.length; i++) {
                if(i > 0) ret += ",";
                let c = this.transits.charAt(i);
                if(c == Alphabet_BLANK) ret += "_";
                else ret += Alphabet.toString(c);
            }
            return ret.toString(); // no need
        }
    }

    /*
      public abstract boolean canBeTransit(char what);
    */
    addTransit(c) {
        //console.log('addTransit(c=' + c +'),transits=' + this.transits);
        if(!this.transitsOn(c)) {
            this.transits += c;
            //console.log('add transits=' + this.transits);
            this.setLabelText();
        }
    }
    removeTransit(c) {
        let pos = this.transits.indexOf(c);
        if(pos >= 0) {
            this.transits = this.transits.replace(c, '');
            this.setLabelText();
        }
    }
    /*

      public void createMenu(JPopupMenu menu) {
      JCheckBoxMenuItem item;
      String dict = getAutomaton().getAlphabet().toString();
      for(int i = 0; i < dict.length(); i++) {
      item = new TransitMenuItem(dict.charAt(i));
      menu.add(item);
      }

      menu.setLayout(new GridLayout(5,6));
      
      //menu.addSeparator();
      super.createMenu(menu);
      }
    */
    getBounds(rect, g) {
        this.computeCircle();
        rect.setBounds(this.bounds);
        this.label.addToBounds(rect, g);
        return rect;
    }
    isIn(qx, qy, g) {
        this.computeCircle();
        let labrect = this.label.getBounds(g);
        if(labrect.contains(qx, qy)) return true;

        let distr = (qx - this.cx) * (qx - this.cx) + (qy - this.cy) * (qy - this.cy);
        let dist = Math.abs(Math.sqrt(distr) - this.r);
        if(dist > 3.0) return false;

        qy = -qy;
        this.cy = -this.cy;
        let thet = this.normalizeRadians(Math.atan2(qy - this.cy, qx - this.cx)
                                         - this.astart);
        qy = -qy;
        this.cy = -this.cy;

        return thet < this.alength;
    }

    move(x, y) {
        // this routine just finds the correct value of offset_theta
        // to use and then passing control onto computeCircle() to
        // compute the actual parameters
        this.getAutomaton().invalidateBounds();

        if(this.src == this.dst) {
            let x0 = this.src.getX();
            let y0 = -this.src.getY();
            this.offset_theta = Math.atan2(-y - y0, x - x0);
            this.computeCircle();
            return;
        }

        // find arc passing through these three points
        let x0 = this.src.getX();
        let y0 = -this.src.getY();
        let x1 = x;
        let y1 = -y;
        let x2 = this.dst.getX();
        let y2 = -this.dst.getY();

        // first find coordinate of arc's circle's center
        let cx = 0;
        let cy = 0;
        {
            /* Correct but divides by zero unnecessarily
             * if(Math.abs(y0 - y1) < 1e-4
             *      || Math.abs(y0 - y1) < 1e-4) return;
             * double ma = -(x0 - x1) / (y0 - y1);
             * double mb = -(x2 - x1) / (y2 - y1);
             * if(Math.abs(mb - ma) < 1e-4) return;
             * double xa = (x0 + x1) / 2.0;
             * double xb = (x1 + x2) / 2.0;
             * double ya = (y0 + y1) / 2.0;
             * double yb = (y1 + y2) / 2.0;
             * cx = (ya - yb + mb * xb - ma * xa) / (mb - ma);
             * cy = ya + ma * (cx - xa);
             * System.err.println("correct: " + cx + "," + cy);
             */

            let denom = (x1-x2) * (y0-y1) - (x1-x0) * (y2-y1);
            if(Math.abs(denom) < 1e-2) {
                this.offset_theta = 0.0;
                this.computeCircle();
                return;
            }
            let numer = (y0-y2) * (y0-y1) * (y2-y1)
                + (x1-x2) * (x1+x2) * (y0-y1)
                - (x1-x0) * (x1+x0) * (y2-y1);
            cx = numer / 2.0 / denom;
            if(Math.abs(y0 - y1) > 1e-4) {
                cy = (y0+y1) / 2.0 + (x1-x0) * (cx-(x0+x1)/2.0) / (y0-y1);
            } else {
                cy = (y2+y1) / 2.0 + (x1-x2) * (cx-(x2+x1)/2.0) / (y2-y1);
            }
        }

        // compute angle of tangent at (x0,y0) w.r.t. angle to (x2,y2)
        let phic = Math.atan2(cy - y0, cx - x0);
        let phi1 = Math.atan2(y1 - y0, x1 - x0);
        let phi2 = Math.atan2(y2 - y0, x2 - x0);
        let tan;
        if(this.normalizeRadians(phi1 - phi2) < Math.PI) {
            tan = phic + Math.PI / 2;
        } else {
            tan = phic - Math.PI / 2;
        }
        this.offset_theta = tan - phi2;

        this.computeCircle();
    }

    computeCircle() {
        if(this.src == null || this.dst == null) return;

        if(this.src.getX() == this.start_x
           && this.src.getY() == this.start_y
           && this.dst.getX() == this.end_x
           && this.dst.getY() == this.end_y
           && this.old_theta == this.offset_theta) {
            return;
        }
        this.start_x = this.src.getX();
        this.start_y = this.src.getY();
        this.end_x = this.dst.getX();
        this.end_y = this.dst.getY();
        this.old_theta = this.offset_theta;

        let draw_arc = true;
        let x0 = this.src.getX();
        let y0 = -this.src.getY();
        let x1 = this.dst.getX();
        let y1 = -this.dst.getY();
        let theta0;
        let theta1 = 0.0;
        let thetaa = 0.0;

        if(this.src == this.dst) {
            // compute center and radius
            this.r = State_RADIUS;
            let dist = this.r + (Math.sqrt(2.0) - 1.0) * State_RADIUS;
            this.cx = x0 + dist * Math.cos(this.offset_theta);
            this.cy = y0 + dist * Math.sin(this.offset_theta);

            // compute arc parameters
            let stateth = 2.0 * Math.asin(3.0 / 2.0 / this.r);
            theta0 = this.offset_theta - 0.75 * Math.PI + stateth;
            theta1 = this.offset_theta + 0.75 * Math.PI - stateth;
            this.clockwise = false;
            this.astart = theta1;
            this.alength = -(1.5 * Math.PI - 2.0 * stateth);
            this.thetaa = theta1 - 0.7 * Math.PI;
        } else if(Math.abs(this.offset_theta) < 1e-4) {
            // arc is just a straight line
            this.arcwidth = 0;
            draw_arc = false;

            let theta = Math.atan2(y1 - y0, x1 - x0);
            let dy = (3.0 + State_RADIUS) * Math.sin(theta);
            let dx = (3.0 + State_RADIUS) * Math.cos(theta);
            x0 += dx;
            y0 += dy;
            x1 -= dx;
            y1 -= dy;
            this.line_x0 = Math.round(x0);
            this.line_y0 = Math.round(-y0);
            this.line_x1 = Math.round(x1);
            this.line_y1 = Math.round(-y1);

            let ax = x1;
            let ay = y1;
            let ath = theta + Math.PI;
            this.arrowx = Math.round(ax);
            this.arrowy = Math.round(ay);
            this.arrowxl = Math.round(ax
                                      + Transition_ARROW_LEN * Math.cos(ath + Transition_ARROW_THETA));
            this.arrowyl = Math.round(ay
                                      + Transition_ARROW_LEN * Math.sin(ath + Transition_ARROW_THETA));
            this.arrowxr = Math.round(ax
                                      + Transition_ARROW_LEN * Math.cos(ath - Transition_ARROW_THETA));
            this.arrowyr = Math.round(ay
                                      + Transition_ARROW_LEN * Math.sin(ath - Transition_ARROW_THETA));
        } else {
            // compute center and radius
            let phi = Math.atan2(y1 - y0, x1 - x0);
            let m0 = Math.tan(phi + this.offset_theta - Math.PI / 2.0);
            let m1 = Math.tan(phi + Math.PI - this.offset_theta + Math.PI / 2.0);
            this.cx = (y1 - y0 + m0 * x0 - m1 * x1) / (m0 - m1);
            this.cy = m0 * (this.cx - x0) + y0;
            this.r = Math.sqrt(this.ddistSq(this.cx, this.cy, x0, y0));
            //console.log(JSON.stringify([x0, y0, x1, y1,phi,m0,m1,this.cx,this.cy,this.r]));

            // compute arc parameters
            theta0 = Math.atan2(y0 - this.cy, x0 - this.cx);
            theta1 = Math.atan2(y1 - this.cy, x1 - this.cx);
            let stateth = 2.0 * Math.asin((3.0 + State_RADIUS) / 2.0 / this.r);
            if(this.normalizeRadians((phi + this.offset_theta) - theta0) < Math.PI) {
                theta0 += stateth;
                theta1 -= stateth;
                this.clockwise = true;
                this.thetaa = theta1 - Math.PI / 2.0;
                this.astart = this.normalizeRadians(theta0);
                this.alength = this.normalizeRadians(theta1 - theta0);
            } else {
                theta0 -= stateth;
                theta1 += stateth;
                this.clockwise = false;
                this.thetaa = theta1 + Math.PI / 2.0;
                this.astart = this.normalizeRadians(theta1);
                this.alength = this.normalizeRadians(theta0 - theta1);
            }
        }

        // compute integer parameters to drawArc()
        if(draw_arc) {
            this.arcx = Math.round(this.cx - this.r);
            this.arcy = Math.round(this.cy + this.r);
            this.arcwidth = Math.round(2.0 * this.r);
            this.arcstart = Math.round(180.0 * this.astart / Math.PI);
            this.arclength = Math.round(180.0 * this.alength / Math.PI);
            if(this.arclength < 0) {
                this.arcstart += this.arclength;
                this.arclength = -this.arclength;
            }
        }

        // compute arrow information
        if(draw_arc) {
            let ax = this.cx + this.r * Math.cos(theta1);
            let ay = this.cy + this.r * Math.sin(theta1);
            let ath = this.thetaa;
            ath += 0.75 * Math.asin(Transition_ARROW_LEN / 2.0 / this.r);
            this.arrowx = Math.round(ax);
            this.arrowy = Math.round(ay);
            this.arrowxl = Math.round(ax
                                      + Transition_ARROW_LEN * Math.cos(ath + Transition_ARROW_THETA));
            this.arrowyl = Math.round(ay
                                      + Transition_ARROW_LEN * Math.sin(ath + Transition_ARROW_THETA));
            this.arrowxr = Math.round(ax
                                      + Transition_ARROW_LEN * Math.cos(ath - Transition_ARROW_THETA));
            this.arrowyr = Math.round(ay
                                      + Transition_ARROW_LEN * Math.sin(ath - Transition_ARROW_THETA));
        }

        // put y-coordinates back into actual space
        this.cy = -this.cy;
        this.arcy = -this.arcy;
        this.arrowy = -this.arrowy;
        this.arrowyl = -this.arrowyl;
        this.arrowyr = -this.arrowyr;

        // compute label information
        {
            let textth = this.normalizeRadians(this.astart + this.alength / 2.0);
            this.textx = Math.round(this.cx + this.r * Math.cos(textth));
            this.texty = Math.round(this.cy - this.r * Math.sin(textth));
            textth = 180.0 * textth / Math.PI; // into degrees
            this.halign = GraphicsUtil_H_CENTER;
            this.valign = GraphicsUtil_V_CENTER;

            if(textth > 202.5 && textth < 357.5) {
                this.texty += 2; this.valign = GraphicsUtil_V_TOP;
            } else if(textth > 22.5 && textth < 157.5) {
                this.texty -= 2; this.valign = GraphicsUtil_V_BOTTOM;
            }

            if(textth > 292.5 || textth < 67.5) {
                this.textx += 2; this.halign = GraphicsUtil_H_LEFT;
            } else if(textth > 112.5 && textth < 247.5) {
                this.textx -= 2; this.halign = GraphicsUtil_H_RIGHT;
            }
        }

        // compute bounding box
        {
            this.bounds = new Rectangle(this.arrowx, this.arrowy, 1, 1);
            this.bounds.add(this.arrowxl, this.arrowyl);
            this.bounds.add(this.arrowxr, this.arrowyr);
            this.bounds.add(
                Math.round(this.cx + this.r * Math.cos(this.astart)),
                Math.round(this.cy - this.r * Math.sin(this.astart)));
            this.bounds.add(
                Math.round(this.cx + this.r * Math.cos(this.astart + this.alength)),
                Math.round(this.cy - this.r * Math.sin(this.astart + this.alength)));

            if(this.normalizeDegrees(0 - this.arcstart) <= this.arclength) {
                this.bounds.add(this.arcx + this.arcwidth, this.arcy + this.arcwidth / 2);
            }
            if(this.normalizeDegrees(90 - this.arcstart) <= this.arclength) {
                this.bounds.add(this.arcx + this.arcwidth / 2, this.arcy);
            }
            if(this.normalizeDegrees(180 - this.arcstart) <= this.arclength) {
                this.bounds.add(this.arcx, this.arcy + this.arcwidth / 2);
            }
            if(this.normalizeDegrees(270 - this.arcstart) <= this.arclength) {
                this.bounds.add(this.arcx + this.arcwidth / 2, this.arcy + this.arcwidth);
            }

            this.bounds.grow(3, 3);
        }
    }
    normalizeRadians(ang) {
        let twopi = 2.0 * Math.PI;
        while(ang >= twopi) ang -= twopi;
        while(ang < 0) ang += twopi;
        return ang;
    }
    normalizeDegrees(ang) {
        while(ang >= 360.0) ang -= 360.0;
        while(ang < 0) ang += 360.0;
        return ang;
    }

    ddistSq(x0, y0, x1, y1) {
        return (x0 - x1) * (x0 - x1) + (y0 - y1) * (y0 - y1);
    }

    draw(g) {
//        console.log('draw transition' + this);
        this.label.setText(this.determineLabelText());
        this.computeCircle();
        GraphicsUtil.switchToWidth(g, 3);
        g.setColor(Color.blue);
        //console.log('draw transition this=' + this.toString());
        if(this.arcwidth > 0) {
            g.drawArc(this.arcx, this.arcy, this.arcwidth, this.arcwidth, this.arcstart, this.arclength);
        } else {
            g.drawLine(this.line_x0, this.line_y0, this.line_x1, this.line_y1);
        }

        let xp = [this.arrowxl, this.arrowx, this.arrowxr];
        let yp = [this.arrowyl, this.arrowy, this.arrowyr];
        g.drawPolyline(xp, yp, 3);

        g.setColor(Color.black);
        this.label.draw(g);

        if(this.cursor_exists) {
            g.setColor(Color.green);
            g.fillOval(this.cursor_x, this.cursor_y, 2 * Transition_CURSOR_R, 2 * Transition_CURSOR_R);
            g.setColor(Color.black);
            g.drawOval(this.cursor_x, this.cursor_y, 2 * Transition_CURSOR_R, 2 * Transition_CURSOR_R);
        }
    }
    showMenu(clientX, clientY) {
        let transition = this;
        let automaton = this.getAutomaton();
        let canvas = automaton.getCanvas();
        let parent = document.getElementById('popups');
        let select = document.createElement('select');
        let alphabet = automaton.getAlphabet().toString();
//        console.log(['automaton', automaton, 'alphabet', alphabet]);
        select.size = alphabet.length + 1;
        select.multiple = true;
        select.style.overflow = 'hidden';
        //
        for (let c of alphabet) {
            let option = document.createElement('option');
//            let select_str = this.transitsOn(c) ? '✓' : '　';
            let select_str = this.transitsOn(c) ? '\u{2713}' : '\u{3000}';
            option.text = select_str + Alphabet.toString(c);
            option.disabled = (!this.transitsOn(c) && !this.canBeTransit(c));
            option.onclick = function() {
                if (!transition.transitsOn(c)) {
                    transition.addTransit(c);
                } else {
                    transition.removeTransit(c);
                }
                canvas.hide_popup();
            };
            select.appendChild(option);
        }
        // 
        let option_delete = document.createElement('option');
        option_delete.text = '\u{3000}' + 'Delete';
        option_delete.onclick = function() {
            automaton.remove(transition);
            canvas.hide_popup();
        };
        select.appendChild(option_delete);
        // 
        let rect = canvas.jscanvas.getBoundingClientRect();
        let x = clientX + rect.left;
        let y = clientY + rect.top;
        select.style.left = x + "px";
        select.style.top = y + "px";
        select.style.position="fixed";
        select.style.visibility = "visible";
        select.style.display = "block";
        while (canvas.select.length > 0) {
            parent.removeChild(canvas.select.pop());
        }
        canvas.select.push(select);
        parent.appendChild(select);
    }
/*
    showMenuOrig(clientX, clientY) {
        let canvas = this.getAutomaton().getCanvas();
        let rect = canvas.jscanvas.getBoundingClientRect();
        let x = clientX + rect.left;
        let y = clientY + rect.top;
        y -= 150;
        let ts = new ToolTransition(canvas);
        ts.current = this;    
        canvas.setTool(ts);
        //console.log('State:showMenu, canvas=' + canvas);
        //console.log('canvas.cur_tool=' + canvas.cur_tool);
        let popup = document.getElementById('transition_popup');
        ts.popup = popup;
        //console.log(popup + ",x" + x +",y" + y);
        popup.style.left=x + "px";
        popup.style.top=y + "px";
        popup.style.position="fixed";
        popup.style.visibility="visible";
        popup.style.opacity="1";
        popup.style.display="block";
    }
*/
    print(fout) {
        super.print(fout);
        fout.print("transits "); fout.printlnGroup(this.transits);
        fout.print("offset "); fout.printlnGroup(this.offset_theta.toString());
    }
    setKey(key, fin) {
        if(key == "transits") {
            this.transits = fin.readGroup();
            this.setLabelText();
            return true;
        } else if(key == "offset") {
            let what = fin.readGroup();
            this.offset_theta = parseFloat(what);
            return true;
        } else {
            return super.setKey(key, fin);
        }
    }
}
