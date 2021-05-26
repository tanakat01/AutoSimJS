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
        return 14;
    }
    getName() {
        return "SansSerif";
    }
    print(fout) {
        fout.print("text "); fout.printlnGroup(this.text);

        fout.print("font ");
        fout.beginGroup();
        let style = "";
        if(this.isBold()) style += "b";
        if(this.isItalic()) style += "i";
        if(style =="") style = "-";
        fout.print(this.getName() + " " + this.getSize() + " " + style);
        fout.endGroup();
        fout.println();
    }

    setKey(key, fin) {
        if(key == "text") {
            this.text = fin.readGroup();
        } else if(key == "font") {
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
            for(let i = 0; i < style_str.length; i++) {
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
        if(this.text.length > 0) bounds.add(this.getBounds(g));
        return bounds;
    }

    draw(g) {
        //console.log('Label.draw text=' + this.text);
        if(this.text.length == 0) return;
        g.setColor(Color.black);
        //console.log('owner.name=' + this.owner.constructor.name);
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

    addLetter(what) {
        if(what == 0x08 || what == 0x7F || what == "Backspace" || what=="Delete" || what == "Clear") {
            if(this.text.length <= 0) return false;
            this.text = this.text.substring(0, this.text.length - 1);
            return true;
        } else if(!Character.isISOControl(what)) {
            this.text += what;
            return true;
        } else {
            return false;
        }
    }

    /*
      private class FontSelectMenuItem extends JMenuItem
      implements ActionListener {
      Canvas canvas;
      Label label;
      public FontSelectMenuItem(Canvas canvas, Label label) {
      super("Font...");
      this.canvas = canvas;
      this.label = label;
      addActionListener(this);
      }
      public void actionPerformed(ActionEvent evt) {
      Graphics g = canvas.getGraphics();
      Rectangle old_rect = label.getBounds(g);
      label.exposeCursor(canvas, g);
      Font newval = showFontDialog(label.font);
      if(newval != null) {
      label.font = newval;
      canvas.expose(old_rect);
      label.exposeCursor(canvas, g);
      canvas.expose(label.getBounds(g));
      canvas.commitTransaction(false);
      }
      }
      }
      public JMenuItem getFontSelectMenuItem(Canvas canvas) {
      return new FontSelectMenuItem(canvas, this);
      }
      public void setFontByDialog() {
      Font newval = showFontDialog(font);
      if(newval != null) font = newval;
      }

      private static class FontDialog extends JDialog
      implements ActionListener {
      String[] std_fonts = { "Monospaced", "Serif", "SansSerif" };
      JList font_list = new JList(std_fonts);
      JCheckBox check_italic = new JCheckBox("Italic");
      JCheckBox check_bold = new JCheckBox("Bold");
      JSlider size_slider = new JSlider(6, 24, 6);
      JButton button_ok = new JButton("OK");
      JButton button_cancel = new JButton("Cancel");
      Font font = null;

      public FontDialog(Font dflt) {
      super((Frame) null, "Select Font", true);

      font_list.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
      font_list.setBorder(BorderFactory.createLineBorder(Color.black, 1));

      button_ok.addActionListener(this);
      button_cancel.addActionListener(this);

      size_slider.setMajorTickSpacing(3);
      size_slider.setMinorTickSpacing(1);
      size_slider.setSnapToTicks(true);
      size_slider.setPaintTicks(true);
      size_slider.setPaintLabels(true);
      size_slider.setValue(12);

      if(dflt != null) {
      font_list.setSelectedValue(dflt.getName(), true);
      if(dflt.isItalic()) check_italic.setSelected(true);
      if(dflt.isBold()) check_bold.setSelected(true);
      size_slider.setValue(dflt.getSize());
      }

      Container pane = getContentPane();
      JPanel panel = new JPanel();
      panel.setBorder(BorderFactory.createEmptyBorder(10, 10, 10, 10));
      pane.add(panel);
      GridBagLayout gridbag = new GridBagLayout();
      GridBagConstraints c = new GridBagConstraints();
      panel.setLayout(gridbag);
      JLabel lab;

      c.anchor = GridBagConstraints.NORTHWEST;
      c.fill = GridBagConstraints.NONE;
      c.ipadx = 10;
      c.ipady = 5;
      c.weighty = 1.0;

      c.gridx = 0;

      lab = new JLabel("Font:");
      c.gridy = 0;
      gridbag.setConstraints(lab, c);
      panel.add(lab);

      lab = new JLabel("Style:");
      c.gridy = 1;
      gridbag.setConstraints(lab, c);
      panel.add(lab);

      lab = new JLabel("Size:");
      c.gridy = 2;
      gridbag.setConstraints(lab, c);
      panel.add(lab);

      c.gridx = 1;

      c.gridy = 0;
      gridbag.setConstraints(font_list, c);
      panel.add(font_list);

      c.gridy = 1;
      Box styles = Box.createVerticalBox();
      styles.add(check_italic);
      styles.add(check_bold);
      gridbag.setConstraints(styles, c);
      panel.add(styles);

      c.gridy = 2;
      gridbag.setConstraints(size_slider, c);
      panel.add(size_slider);

      // make button row
      Box buttons = Box.createHorizontalBox();
      buttons.add(button_ok);
      buttons.add(Box.createHorizontalStrut(10));
      buttons.add(button_cancel);
      c.gridwidth = 2;
      c.gridx = 0;
      c.gridy = 3;
      c.anchor = GridBagConstraints.CENTER;
      gridbag.setConstraints(buttons, c);
      panel.add(buttons);

      pack();
      }

      public void actionPerformed(ActionEvent e) {
      if(e.getSource() == button_ok) {
      Object val = font_list.getSelectedValue();
      String name = val == null ? null : val.toString();
      int size = size_slider.getValue();
      int style = 0;
      if(check_bold.isSelected()) style |= Font.BOLD;
      if(check_italic.isSelected()) style |= Font.ITALIC;
      font = new Font(name, style, size);
      dispose();
      } else {
      dispose();
      }
      }

      public Font getFont() {
      return font;
      }
      }
      public static Font showFontDialog(Font dflt) {
      FontDialog dlog = new FontDialog(dflt);
      dlog.setVisible(true);
      return dlog.getFont();
      }
    */
}
