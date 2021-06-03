let automaton_type = "dfa";

function show_tmtools() {
    let p1 = document.getElementById("tmtools");
    p1.style.visibility ="visible";
    p1.style.display="inline-block";
    p1.style.opacity=1;
}

function hide_tmtools() {
    let p1 = document.getElementById("tmtools");
    p1.style.visibility ="hidden";
    p1.style.display="none";
    p1.style.opacity=0;
}

function button_quit() {
    window.close();
}

let jscanvas = document.getElementById('maincanvas');
let canvas = new Canvas(jscanvas);
let tapecanvas = document.getElementById('tapecanvas');
let tape = new Tape(tapecanvas);
tape.reset();
canvas.setTape(tape);
let test = new Test(canvas);
canvas.setTest(test);

function onState() {
    canvas.setTool(new ToolState(canvas));
}

function onTransition() {
    canvas.setTool(new ToolTransition(canvas));
}

function onText() {
    canvas.setTool(new ToolText(canvas));
}

function onPlay() {
    canvas.getAutomaton().doPlay();
}

function onPause() {
    canvas.getAutomaton().doPause();
}

function onStep() {
    canvas.getAutomaton().doStep();
}

function onBackStep() {
    canvas.getAutomaton().doBackStep();
}

function onResetSimulation() {
    canvas.getAutomaton().doResetSimulation();
}

function popup(n) {
    canvas.popup(n);
}

function button_save() {
    let str = new StringWriter();
    let fout = new GroupedWriter(str);
    canvas.getAutomaton().print(fout);
    let content = str.text;
    let name = 'machine.txt';
    let mineType = 'application/octet-stream';
    let blob = new Blob([content], { type: mineType});

    let a = document.createElement('a');
    a.download = name;
    a.target = '_blank';
    if (window.navigator.msSaveBlob) {
        // for IE
        window.navigator.msSaveBlob(blob, name)
    }
    else if (window.URL && window.URL.createObjectURL) {
        // for Firefox
        a.href = window.URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    else if (window.webkitURL && window.webkitURL.createObject) {
        // for Chrome
        a.href = window.webkitURL.createObjectURL(blob);
        a.click();
    }
    else {
        // for Safari
        window.open('data:' + mimeType + ';base64,' + window.Base64.encode(content), '_blank');
    }
}

function openAutomaton(e) {
    let file = e.target.files[0];
    let reader = new FileReader();
    reader.onload =
        function(ev) {
            let res = ev.target.result;
            let sr = new StringReader(res);

            let gr = new GroupedReader(sr);
            tape.completeReset();
            let automaton = Automaton.read(gr);
            canvas.setAutomaton(automaton);
            canvas.exposeAll();
        };
    reader.readAsText(file);
}

function button_open() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt, text/plain';
    input.onchange = function(event) { openAutomaton(event); };
    input.click();  
}

onState();

function button_print() {
    // https://stackoverflow.com/questions/12809971/quick-print-html5-canvas
    const dataUrl = document.getElementById('maincanvas').toDataURL(); 
    let windowContent = '<!DOCTYPE html>';
    windowContent += '<html>';
    windowContent += '<head><title>Automaon Simulator</title></head>';
    windowContent += '<body>';
    windowContent += '<img src="' + dataUrl + '">';
    windowContent += '</body>';
    windowContent += '</html>';
    const printWin = window.open('', '', 'width=' + screen.availWidth + ',height=' + screen.availHeight);
    printWin.document.open();
    printWin.document.write(windowContent); 
    printWin.document.addEventListener('load', function() {
        printWin.focus();
        printWin.print();
        printWin.document.close();
        printWin.close();            
    }, true);
}

function button_save_image() {
  const dataUrl = document.getElementById('maincanvas').toDataURL("image/png");
  document.getElementById("save_image").href = dataUrl;
}

function button_test() {
    test.show();
}

function new_machine(t) {
    if (!window.confirm("Are you sure you want to clear everything for a new project?")) { return; }
    automaton_type = t;
    let automaton = null;
    if (t == "dfa") {
        automaton = new DFA();
    } else if (t == "nfa") {
        automaton = new NFA();
    } else if (t == "pda") {
        automaton = new DPDA();
    } else if (t == "tm") {
        automaton = new TuringMachine();
    }
    if (automaton != null) {
        canvas.setAutomaton(automaton);
    }
}
