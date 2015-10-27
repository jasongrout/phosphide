/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var menusolver_1 = require('./menusolver');
var phosphor_disposable_1 = require('phosphor-disposable');
var phosphor_widget_1 = require('phosphor-widget');
require('./index.css');
__export(require('./menuiteminterface'));
__export(require('./menumanagerinterface'));
__export(require('./menusolver'));
__export(require('./menusolverfunctions'));
function receiveItems(extension) {
    var disposables = [];
    if (extension.object && extension.object.hasOwnProperty('items')) {
        console.log('got items', extension.object.items.length);
        extension.object.items.forEach(function (item) {
            var disp = addToMenuItems(item);
            disposables.push(disp);
        });
    }
    if (extension.data && extension.data.hasOwnProperty('items')) {
        extension.data.items.forEach(function (item) {
            var disp = addToMenuItems(item);
            disposables.push(disp);
        });
    }
    if (menuBar)
        phosphor_widget_1.detachWidget(menuBar);
    menuBar = menusolver_1.MenuSolver.solve(menuItems);
    phosphor_widget_1.attachWidget(menuBar, document.body);
    console.log('attached', menuItems.length);
    return new phosphor_disposable_1.DisposableSet(disposables);
}
exports.receiveItems = receiveItems;
function initialize() {
    return new Promise(function (resolve, reject) {
        menuBar = menusolver_1.MenuSolver.solve(menuItems);
        phosphor_widget_1.attachWidget(menuBar, document.body);
        if (menuBar.isAttached) {
            var disposable = new phosphor_disposable_1.DisposableDelegate(function () {
                phosphor_widget_1.detachWidget(menuBar);
            });
            resolve(disposable);
        }
        else {
            reject(new Error("Error initialising menu plugin."));
        }
    });
}
exports.initialize = initialize;
function addToMenuItems(item) {
    menuItems.push(item);
    return new phosphor_disposable_1.DisposableDelegate(function () {
        var index = indexOfItem(item);
        if (index > -1) {
            menuItems.splice(index, 1);
        }
    });
}
function indexOfItem(item) {
    for (var i = 0; i < menuItems.length; ++i) {
        if (compareArrays(menuItems[i].location, item.location)) {
            if (menuItems[i].command === item.command) {
                return i;
            }
        }
    }
    return -1;
}
function compareArrays(first, second) {
    if (first.length !== second.length)
        return false;
    for (var i = 0; i < first.length; ++i) {
        if (first[i] !== second[i]) {
            return false;
        }
    }
    return true;
}
var menuItems = [];
var menuBar = null;
//# sourceMappingURL=index.js.map