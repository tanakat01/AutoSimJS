/*
  function getEventTarget(e) {
  e = e || window.event;
  return e.target || e.srcElement; 
  }

  var ul = document.getElementById('test');
  ul.onclick = function(event) {
  var target = getEventTarget(event);
  alert(target.innerHTML);
  };
*/      
var automaton_type = "dfa";

function show_tmtools() {
    var p1 = document.getElementById("tmtools");
    p1.style.visibility ="visible";
    p1.style.display="inline-block";
    p1.style.opacity=1;
}

function hide_tmtools() {
    var p1 = document.getElementById("tmtools");
    p1.style.visibility ="hidden";
    p1.style.display="none";
    p1.style.opacity=0;
}


function new_machine(t) {
    if (!window.confirm("Are you sure you want to clear everything for a new project?")) { return; }
    if (automaton_type == t) {
        return;
    }
    if (t != "tm") {
        hide_tmtools();
    }
    else {
        show_tmtools();
    }
    automaton_type = t;
    alert('setting to ' + t);
}

function dfa() {
    if (!window.confirm("Are you sure you want to clear everything for a new project?")) { return; }
    if (automaton_type != "dfa") {
        hide_tmtools();
        automaton_type = "dfa";
        alert('setting to dfa');
    }
}
function nfa() {
    if (!window.confirm("Are you sure you want to clear everything for a new project?")) { return; }
    if (automaton_type != "nfa") {
        hide_tmtools();
        automaton_type = "nfa";
        alert('setting to nfa');
    }
}
function pda() {
    if (!window.confirm("Are you sure you want to clear everything for a new project?")) { return; }
    if (automaton_type != "pda") {
        hide_tmtools();
        automaton_type = "pda";
        alert('setting to pda');
    }
}
function tm() {
    if (!window.confirm("Are you sure you want to clear everything for a new project?")) { return; }
    if (automaton_type != "tm") {
        show_tmtools();
        automaton_type = "tm";
        alert('setting to tm');
    }
}
function button_quit() {
    window.close();
}

let jscanvas = document.getElementById('maincanvas');
let canvas = new Canvas(jscanvas);

//canvas.addEventListener('contextmenu', canvas_right_click, false);

let tapecanvas = document.getElementById('tapecanvas');
let tape = new Tape(tapecanvas);
tape.reset();
canvas.setTape(tape);

function onState() {
//    console.log('onState');
    canvas.setTool(new ToolState(canvas));
}
function onTransition() {
//    console.log('onTransition()');
    canvas.setTool(new ToolTransition(canvas));
}
function onText() {
//    console.log('onText()');
    canvas.setTool(new ToolText(canvas));
}
function onPlay() {
//    console.log('onPlay()');
    canvas.getAutomaton().doPlay();
}
function popup(n) {
//    console.log('state_popup(' + n + ')');
    canvas.popup(n);
}
function button_save() {
//    console.log('button_save');
    let str = new StringWriter();
    let fout = new GroupedWriter(str);
    canvas.getAutomaton().print(fout);
/*
    a.href = 'data:application/octet-stream,' + encodeURIComponent(str.text);
    a.download = 'machine.txt';
    a.style.display = 'none';
    document.body.appendChild(a); // ※ DOM が構築されてからでないとエラーになる
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
    }, 0);
*/
    let a = document.createElement('a');
    let url = URL.createObjectURL(new Blob([str.text], {
  type: "application/octet-stream"
    }));
    a.href = url;
    a.download = 'machine.txt';
    a.style.display = 'none';
    document.body.appendChild(a); // ※ DOM が構築されてからでないとエラーになる
    a.click();
    setTimeout(function() {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
    
    /*
    let url = URL.createObjectURL(new Blob([str.text], {
  type: "application/octet-stream"
    }));
    location.href = url;
*/
    
}
function openAutomaton(e) {
//    console.log(e.target.files.length);
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
function button_test() {
    a = window.open("","dialogue","menubar=no,location=no,resizable=no,scrollbars=no,status=yes,width=300,height=200");
//    console.log(a.ducument);
}
