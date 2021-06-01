/* Original : java version
 * Copyright (c) 2006, Carl Burch. License information is located in the
 * com.cburch.autosim.Main source code and at www.cburch.com/proj/autosim/. 
 * 
 * translated to Javascript by Tetsuro Tanaka (tanakat01@gmail.com)
 */

class Alphabet {
    
    static toString(what) {
        switch(what) {
        case Alphabet_ELSE:      return "else";
        case Alphabet_BLANK:     return "blank";
        default:        return "" + what;
        }
    }

    constructor(what) {
        this.set(what);
    }

    set(what) {
        this.data = "";
        for(let i = 0; i < what.length; i++) {
            this.add(what.charAt(i));
        }
    }
    toString() {
        return this.data;
    }
    add(what) {
        if(this.data.indexOf(what) < 0) this.data = this.data + what;
    }
    remove(what) {
        let i = this.data.indexOf(what);
        if(i >= 0) {
            this.data = this.data.substring(0, i)
                + this.data.substring(i + 1);
        }
    }
    includes(what) {
        return this.data.indexOf(what) >= 0;
    }
}
