const output = $("#outputlog")[0];
function print(msg) {
    output.textContent += msg + '\n';
}
window.onerror = function(message, source, lineno, colno, error) {
    print(message + " line: " + lineno + " col: " + colno);
    //this.output("ERROR: " + message + " line: " + lineno + " col: " + colno);
};

var _log = console.log,
    _warn = console.warn,
    _error = console.error;

console.log = function() {
    for(var k in arguments)
        print("LOG: " + arguments[k]);
    return _log.apply(console, arguments);
};

console.warn = function() {
    for(var k in arguments)
        print("WARN: " + arguments[k]);
    return _warn.apply(console, arguments);
};

console.error = function() {
    for(var k in arguments)
        print("ERR: " + arguments[k]);
    return _error.apply(console, arguments);
};