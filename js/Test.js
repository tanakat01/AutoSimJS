class TestCase {
    constructor(name, cases) {
        this.name = name;
        this.cases = cases;
        this.result = null;
        this.select = null;
        this.options = [];
        this.resultArea = null;
    }
};
class Test {
    constructor(canvas) {
        this.canvas = canvas;
        this.menu = null;
        this.parent = null;
        let text = document.getElementById('testfile');
        this.testcases = this.readTestCases(text.innerHTML);
        //console.log(this.testcases);
    }
    show() {
        if (this.parent == null) {
            this.parent = document.getElementById('test');
        }
        if (this.menu == null) {
            this.menu = this.createMenu();
//            console.log('this.parent=' + this.parent);
            for (let o of this.menu) {
                this.parent.appendChild(o);
            }
        }
        this.parent.style.visibility = 'visible';
        this.parent.style.display = 'block';
    }
    hide() {
//        console.log('this.parent=' + this.parent);
        if (this.parent != null) {
            this.parent.style.visibility = 'hidden';
            this.parent.style.display = 'none';
        }
        
    }
    createSelect() {
        let p = document.createElement('p');
        let select = document.createElement('select');
        select.size = this.testcases.length;
        this.options = [];
        for (let i = 0; i < this.testcases.length; i++) {
            let option = document.createElement('option');
            this.options.push(option);
            option.value = i;
            if (this.testcases[i].result == null) {
                option.style.background = '#ffffff';
            } else if (this.testcases[i].result) {
                option.style.background = '#00ff00';
            } else {
                option.style.background = '#ff8080';
            }
            let label = document.createTextNode(this.testcases[i].name);
            option.appendChild(label);
            select.appendChild(option);
        }
        this.select = select;
        p.appendChild(select);
        return p;
    }
    createClose() {
        let close_button = document.createElement('button');
        close_button.type = 'button';
        close_button.appendChild(document.createTextNode('Close'));
        close_button.style.border = 'solid 2px black';
        let test = this;
        close_button.onclick = function() {
            test.hide();
        };
        return close_button;
    }
    doTest() {
        if (this.select == null) return;
        let i = this.select.value;
        let OK = true;
        this.resultArea.value = "";
        for (let c of this.testcases[i].cases) {
            let r = this.canvas.automaton.testOne(c);
            if (!r[0]) OK = false;
            this.resultArea.value += r[1] + "\n";
        }
        if (OK) {
            this.resultArea.style.background = "#80ff80";
            this.options[i].style.background = "#80ff80";
        } else {
            this.resultArea.style.background = "#ff8080";
            if (this.testcases[i].result == null) {
                this.options[i].style.background = "#ff8080";
            }
        }
    }
    createTest() {
        let button = document.createElement('button');
        button.type = 'button';
        button.appendChild(document.createTextNode('Test'));
        button.style.border = 'solid 2px black';
        let test = this;
        button.onclick = function() {
            test.doTest();
        };
        return button;
    }
    createResultArea() {
        let tf = document.createElement('textarea');
        tf.readonly = true;
        tf.cols = 80;
        tf.rows = 10;
        this.resultArea = tf;
        return tf;
    }
    createMenu() {
        let r = [];
        let h2Node = document.createElement('h2');
        let textNode = document.createTextNode('Test');
        h2Node.appendChild(textNode);
        r.push(h2Node);
        r.push(document.createElement('hr'));
        let table = document.createElement('table');
        let tr = document.createElement('tr');
        table.appendChild(tr);
        let td1 = document.createElement('td');
        td1.appendChild(this.createSelect());
        tr.appendChild(td1);
        let td2 = document.createElement('td');
        td2.appendChild(this.createTest());
        td2.appendChild(document.createElement('br'));
        td2.appendChild(this.createClose());
        tr.appendChild(td2);
        table.appendChild(tr);
        r.push(table)
        r.push(this.createResultArea());
        r.push(document.createElement('hr'));
        return r;
    }
    readTestCases(text) {
        let lines = text.split('\n');
//        console.log(lines);
        let r = [];
        let name = null;
        let cases = [];
        for (let l of lines) {
            if (l.length == 0) {
                if (name != null) r.push(new TestCase(name, cases));
                name = null;
                cases = [];
            } else if (name == null) {
                name = l;
            } else {
                cases.push(l);
            }
        }
        if (name != null) r.push(new TestCase(name, cases));
        return r;
    }
}

