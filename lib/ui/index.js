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
 * The factory function for the `ui:main` extension point.
 */
function createUIReceiver() {
    return {
        add: function (extension) {
            if (extension.item && extension.item.hasOwnProperty('items')) {
                var items = extension.item.items;
                var tabs = extension.item.tabs;
                for (var i = 0; i < items.length; ++i) {
                    phosphor_dockpanel_1.DockPanel.setTab(items[i], tabs[i]);
                    dockarea.addWidget(items[i]);
                }
            }
            return new phosphor_disposable_1.DisposableDelegate(function () {
                // TODO: remove the items from the dockarea once the API is updated.
            });
        },
        remove: function (id) {
        },
        dispose: function () {
        }
    };
}
exports.createUIReceiver = createUIReceiver;
/**
 * The receiver for the `ui:main` extension point.
 */
// export
// function receiveMain(extension: IExtension): IDisposable {
//
// }
/**
 * The initializer for the `ui:main` extension point.
 */
// export
// function initializeMain(): Promise<IDisposable> {
//   Widget.attach(dockarea, document.body);
//   window.onresize = () => dockarea.update();
//   return Promise.resolve(dockarea);
// }
// global dockpanel
var dockarea = new phosphor_dockpanel_1.DockPanel();
dockarea.id = 'main';
phosphor_widget_1.Widget.attach(dockarea, document.body);
window.onresize = function () { return dockarea.update(); };
