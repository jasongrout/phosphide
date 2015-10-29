/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var phosphor_dockpanel_1 = require('phosphor-dockpanel');
var phosphor_tabs_1 = require('phosphor-tabs');
var phosphor_widget_1 = require('phosphor-widget');
require('./index.css');
function createContent(title) {
    var widget = new phosphor_widget_1.Widget();
    var tab = new phosphor_tabs_1.Tab(title);
    tab.closable = true;
    phosphor_dockpanel_1.DockPanel.setTab(widget, tab);
    return widget;
}
function receiveItems(extension) {
    if (extension.object && extension.object.hasOwnProperty('items')) {
        var items = extension.object.items;
        var tabs = extension.object.tabs;
        for (var i = 0; i < items.length; ++i) {
            phosphor_dockpanel_1.DockPanel.setTab(items[i], tabs[i]);
            dockarea.addWidget(items[i]);
        }
    }
    return void 0;
}
exports.receiveItems = receiveItems;
function initialize() {
    phosphor_widget_1.attachWidget(dockarea, document.body);
    window.onresize = function () { return dockarea.update(); };
    return Promise.resolve(void 0);
}
exports.initialize = initialize;
var dockarea = new phosphor_dockpanel_1.DockPanel();
dockarea.id = 'main';
var initialView = createContent('Initial Tab');
dockarea.addWidget(initialView);
//# sourceMappingURL=index.js.map