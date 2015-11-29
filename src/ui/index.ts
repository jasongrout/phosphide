/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IDisposable, DisposableDelegate
} from 'phosphor-disposable';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  IExtension, IReceiver
} from 'phosphor-plugins';

import {
  Tab
} from 'phosphor-tabs';

import {
  Widget
} from 'phosphor-widget';

import './index.css';


/**
 * The interface for `ui` extension point.
 */
export
interface IUIExtension {
  items: Widget[];
  tabs: Tab[];
}


/**
 * The factory function for the `ui:main` extension point.
 */
export
function createUIReceiver(): IReceiver {
  return {
    add: function(extension: IExtension) {
      if (extension.item && extension.item.hasOwnProperty('items')) {
        let items = extension.item.items;
        let tabs = extension.item.tabs;
        for (let i = 0; i < items.length; ++i) {
          DockPanel.setTab(items[i], tabs[i]);
          dockarea.addWidget(items[i]);
        }
      }
      return new DisposableDelegate(() => {
        // TODO: remove the items from the dockarea once the API is updated.
      });
    },
    remove: function(id) {

    },
    dispose: function() {

    }
  }
}


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
var dockarea = new DockPanel();
dockarea.id = 'main';
Widget.attach(dockarea, document.body);
window.onresize = () => dockarea.update();
