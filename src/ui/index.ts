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
  Tab
} from 'phosphor-tabs';

import {
  Widget
} from 'phosphor-widget';

import {
  IExtension
} from 'phosphor-plugins';

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
 * The receiver for the `ui:main` extension point.
 */
export
function receiveMain(extension: IExtension<IUIExtension>): IDisposable {
  if (extension.object && extension.object.hasOwnProperty('items')) {
    var items = extension.object.items;
    var tabs = extension.object.tabs;
    for (var i = 0; i < items.length; ++i) {
      DockPanel.setTab(items[i], tabs[i]);
      dockarea.addWidget(items[i]);
    }
  }
  return void 0;
}


/**
 * The initializer for the `ui:main` extension point.
 */
export
function initializeMain(): Promise<IDisposable> {
  Widget.attach(dockarea, document.body);
  window.onresize = () => dockarea.update();
  return Promise.resolve(dockarea);
}


// global dockpanel
var dockarea = new DockPanel();
dockarea.id = 'main';
