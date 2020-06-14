/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class StringWriter {
    constructor() {
        this.text = "";
    }
    print(text) {
        this.text += text;
    }
    println(text="") {
        this.text += text + "\n";
    }
    close() {
    }
}
class GroupedWriter {
    constructor(writer) {
        this.depth = 0;
        this.line_number = 1;
        this.begin_line = true;
        this.writer = writer;
    }
    close() {
        this.writer.close();
    }
    print(s) {
        this.doPrint(s);
        this.indent();
    }
    println(s="") {
        this.doPrint(s);
        this.doPrint("\n");
    }
    beginGroup() {
        ++this.depth;
        this.indent();
        this.writer.print("{");
    }
    startGroup() { this.beginGroup(); }
    endGroup() {
        --this.depth;
        this.indent();
        this.writer.print("}");
    }

    printGroup(s) {
        this.beginGroup();
        this.print(s);
        this.endGroup();
    }
    printlnGroup(s) {
        this.beginGroup();
        this.print(s);
        this.endGroup();
        this.println();
    }
    
    doPrint(s) {
        console.log(['s=', s]);
        for(let newline = s.indexOf('\n'); newline >= 0;
            newline = s.indexOf('\n')) {
            if(newline > 0) {
                this.indent();
                this.writer.println(this.protect(s.substring(0, newline)));
            } else {
                this.writer.println();
            }
            ++this.line_number;
            this.begin_line = true;
            s = s.substring(newline + 1);
        }
        if(s.length > 0) {
            this.indent();
            this.writer.print(this.protect(s));
        }
    }
    indent() {
        if(this.begin_line) {
            for(let i = 0; i < this.depth; i++) this.writer.print("\t");
            this.begin_line = false;
        }
    }

    protect(s) {
        let cur_pos = 0;
        while(true) {
            cur_pos = this.findFirstIndex(s, cur_pos, "{}\\");
            if(cur_pos < 0) return s;
            s = s.substring(0, cur_pos) + "\\" + s.substring(cur_pos);
            cur_pos += 2;
        }
    }
    findFirstIndex(s, pos, t) {
        let ret = -1;
        for(let i = 0; i < t.length; i++) {
            let next = s.indexOf(t.charAt(i), pos);
            if(next >= 0 && (ret == -1 || next < ret)) ret = next;
        }
        return ret;
    }
}
