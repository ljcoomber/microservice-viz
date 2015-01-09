"use strict";

function boot(): string {
    var txt  = "Hello World v7";
    document.getElementById('content').appendChild(document.createTextNode(txt));
    return txt;
}