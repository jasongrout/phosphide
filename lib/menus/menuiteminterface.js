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
        _super.call(this, options);
        this._command = options.command;
        // if (this._command) {
        //   this.handler = () => {
        //     receiveInvoke(this._command);
        //   };
        // }
    }
    return CommandMenuItem;
})(phosphor_menus_1.MenuItem);
exports.CommandMenuItem = CommandMenuItem;
