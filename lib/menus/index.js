/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var menusolver_1 = require('./menusolver');
var phosphor_menus_1 = require('phosphor-menus');
var phosphor_widget_1 = require('phosphor-widget');
require('./index.css');
/**
 * Extension receiver for `menus:main`.
 */
function receiveMain(extension) {
    if (!('main' in menuMap)) {
        menuMap['main'] = new MenuExtensionPoint('main');
    }
    var main = menuMap['main'];
    main.receive(extension);
    return void 0;
}
exports.receiveMain = receiveMain;
/**
 * Extension point initializer for `menus:main`.
 */
function initializeMain() {
    if (!('main' in menuMap))
        return Promise.resolve(void 0);
    var main = menuMap['main'];
    return main.initialize(document.body);
}
exports.initializeMain = initializeMain;
/**
 * Menu extension point handler.
 */
var MenuExtensionPoint = (function () {
    function MenuExtensionPoint(name) {
        this._commandItems = null;
        this._initialized = false;
        this._menu = null;
        this._name = '';
        this._name = name;
        this._commandItems = null;
        this._menu = new phosphor_menus_1.MenuBar();
    }
    /**
     * Receive an extension for this menu.
     */
    MenuExtensionPoint.prototype.receive = function (extension) {
        var _this = this;
        if (extension.object && extension.object.hasOwnProperty('items')) {
            extension.object.items.forEach(function (item) {
                _this._commandItems.push(item);
            });
        }
        if (extension.data && extension.data.hasOwnProperty('items')) {
            extension.data.items.forEach(function (item) {
                _this._commandItems.push(item);
            });
        }
        if (this._initialized) {
            this._menu.items = menusolver_1.solveMenu(this._commandItems);
        }
    };
    /**
     * Initialize the extension point.
     *
     * @param element - DOM Element to attach the menu.
     */
    MenuExtensionPoint.prototype.initialize = function (element) {
        this._menu.items = menusolver_1.solveMenu(this._commandItems);
        this._initialized = true;
        phosphor_widget_1.Widget.attach(this._menu, element);
        return Promise.resolve(this);
    };
    Object.defineProperty(MenuExtensionPoint.prototype, "isDisposed", {
        /**
         * Return whether the extension point has been disposed.
         */
        get: function () {
            return (this._commandItems === null);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Dispose of the resources held by the extension point.
     */
    MenuExtensionPoint.prototype.dispose = function () {
        this._commandItems = null;
        this._menu.dispose();
        delete menuMap[this._name];
    };
    return MenuExtensionPoint;
})();
// Menu extension point store.
var menuMap = {};
