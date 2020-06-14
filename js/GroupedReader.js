/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class StringReader {
    constructor(text) {
        this.text = text;
        this.i = 0;
    }
    close() {}
    readLine() {
        let r = '';
        while (this.i < this.text.length) {
            let c = this.text[this.i++];
            if (c == "\n") break;
            r += c;
        }
        return r;
    }
}
class GroupedReader {
    constructor(reader) {
        this.reader = reader;
        this.depth = 0;
        this.line_number = 1;
        this.buffer = "";
    }
    close()  {
        this.reader.close();
    }
    readLine(){
        this.getBuffer();

        // find end of buffer (if any)
        let pos_lb = this.findFirstUnescaped(this.buffer, '{');
        let pos_rb = this.findFirstUnescaped(this.buffer, '}');
        let pos = pos_lb;
        if(pos_rb >= 0 && (pos == -1 || pos_rb < pos)) pos = pos_rb;

        // compute ret; trim buffer
        let ret = "";
        if(pos < 0) {
            ret = this.buffer;
            this.buffer = null;
        } else {
            ret = this.buffer.substring(0, pos);
            this.buffer = this.buffer.substring(pos);
        }

        ret = this.unprotect(ret);
        return ret;
    }
    beginGroup() {
        this.getBuffer();
        if(this.buffer.charAt(0) != '{') {
            throw new Error("Not at beginning of group");
        }
        ++this.depth;
        this.buffer = this.buffer.substring(1);
    }
    startGroup() {
        this.beginGroup();
    }
    endGroup() {
        this.getBuffer();
        if(this.buffer.charAt(0) != '}') {
            throw new Error("Not at end of group");
        }
        --this.depth;
        this.buffer = this.buffer.substring(1);
    }

    atFileEnd() {
        this.getBuffer();
        return this.buffer == null;
    }
    atGroupEnd() {
        this.getBuffer();
        return this.buffer.charAt(0) == '}';
    }

    readGroup() {
        this.beginGroup();
        let ret = this.readLine();
        this.getBuffer();
        while(this.buffer.charAt(0) != '}') {
            ret += "\n";
            ret += this.readLine();
            this.getBuffer();
        }
        this.endGroup();
        return ret.toString();
    }

    getBuffer() {
        if(this.buffer != null && this.buffer.length > 0) return;
        
        ++this.line_number;
        //console.log('this.reader=' + this.reader);
        //console.log('this.read.class=' + this.reader.constructor.name);
        this.buffer = this.reader.readLine();
        if(this.buffer == null) return;

        let i = 0;
        while(i < this.depth && this.buffer.length > i
              && this.buffer.charAt(i) == '\t') {
            i++;
        }
        this.buffer = this.buffer.substring(i);
    }

    findFirstUnescaped(search, find) {
        let pos = 0;
        while(true) {
            pos = search.indexOf(find, pos);
            if(pos < 0) return -1;
            if(pos == 0 || search.charAt(pos - 1) != '\\') return pos;
            ++pos;
        }
    }
    unprotect(what) {
        let pos = 0;
        let ret = "";
        while(true) {
            let newpos = what.indexOf('\\', pos);
            if(newpos < 0) break;
            
            ret += what.substring(pos, newpos);
            ret += what.charAt(newpos + 1);
            pos = newpos + 2;
        }
        ret += what.substring(pos);
        return ret.toString();
    }
}
