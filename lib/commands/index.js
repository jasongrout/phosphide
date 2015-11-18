/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var phosphor_disposable_1 = require('phosphor-disposable');
/**
 * The receiver for the `command:main` extension point.
 */
function receiveMain(extension) {
    console.log("COMMAND RECEIVE MAIN" + extension.object.toString());
    console.log("COMMAND RECEIVE MAIN" + Object.keys(extension).toString());
    if (extension.object && extension.object.hasOwnProperty('id')) {
        console.log("COMMAND RECEIVE MAIN ID: " + extension.object.id);
        var id = extension.object.id;
        if (id in commandMap) {
            throw new Error('Command already exists');
        }
        commandMap[id] = extension.object;
        return new phosphor_disposable_1.DisposableDelegate(function () {
            delete commandMap[id];
        });
    }
}
exports.receiveMain = receiveMain;
/**
 * The initializer for the `command:main` extension point.
 */
function initializeMain() {
    commandMap = {};
    var disposable = new phosphor_disposable_1.DisposableDelegate(function () {
        for (var item in commandMap) {
            delete commandMap[item];
        }
    });
    return Promise.resolve(disposable);
}
exports.initializeMain = initializeMain;
/**
 * The invoker for the `command:invoke` extension point.
 */
function receiveInvoke(name) {
    console.log("receiveInvoke called: " + name);
    if (name in commandMap) {
        console.log("NAME FOUND... calling.");
        commandMap[name].handler();
        return Promise.resolve(void 0);
    }
    else {
        console.log("MISS: " + Object.keys(commandMap).toString());
    }
    return Promise.reject(void 0);
}
exports.receiveInvoke = receiveInvoke;
/**
 * The initializer for the `command:invoke` extension point.
 *
 * #### Notes
 * This is a no-op, and shouldn't be required.
 */
function initializeInvoker() {
    return Promise.resolve(void 0);
}
exports.initializeInvoker = initializeInvoker;
// global command manager
var commandMap = {};
