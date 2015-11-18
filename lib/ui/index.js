/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var phosphor_disposable_1 = require('phosphor-disposable');
var phosphor_dockpanel_1 = require('phosphor-dockpanel');
var phosphor_widget_1 = require('phosphor-widget');
require('./index.css');
/**
 * The receiver for the `ui:main` extension point.
 */
function receiveMain(extension) {
    if (extension.object && extension.object.hasOwnProperty('items')) {
        var items = extension.object.items;
        var tabs = extension.object.tabs;
        for (var i = 0; i < items.length; ++i) {
            phosphor_dockpanel_1.DockPanel.setTab(items[i], tabs[i]);
            dockarea.addWidget(items[i]);
        }
    }
    return new phosphor_disposable_1.DisposableDelegate(function () {
        // TODO: remove the items from the dockarea once the API is updated.
    });
}
exports.receiveMain = receiveMain;
/**
 * The initializer for the `ui:main` extension point.
 */
function initializeMain() {
    phosphor_widget_1.Widget.attach(dockarea, document.body);
    window.onresize = function () { return dockarea.update(); };
    return Promise.resolve(dockarea);
}
exports.initializeMain = initializeMain;
// global dockpanel
var dockarea = new phosphor_dockpanel_1.DockPanel();
dockarea.id = 'main';
