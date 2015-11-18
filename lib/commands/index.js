/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var phosphor_disposable_1 = require('phosphor-disposable');
var phosphor_menus_1 = require('phosphor-menus');
/**
 * A menu item which takes a command name to be fired when selected.
 */
var CommandMenuItem = (function (_super) {
    __extends(CommandMenuItem, _super);
    /**
     * Construct a command menu item.
     */
    function CommandMenuItem(options) {
        var _this = this;
        _super.call(this, options);
        this._command = options.command;
        this.handler = function () {
            console.log('COMMAND MENU ITEM INVOKED: ' + _this._command);
            receiveInvoke(_this._command);
        };
    }
    return CommandMenuItem;
})(phosphor_menus_1.MenuItem);
exports.CommandMenuItem = CommandMenuItem;
/**
 * The receiver for the `command:main` extension point.
 */
function receiveMain(extension) {
    if (extension.object && extension.object.hasOwnProperty('id')) {
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
    console.log("COMMAND INVOKED: " + name);
    if (name in commandMap) {
        commandMap[name].handler();
        return Promise.resolve(void 0);
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
