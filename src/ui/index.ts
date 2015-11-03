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
 * The interface for `ui:items` extension point.
 */
export 
interface IItems {
  items: Widget[];
  tabs: Tab[];
}


/**
 * The receiver for the `ui:items` extension point.
 */
export
function receiveItems(extension: IExtension<IItems>): IDisposable {
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
 * The initializer for the `ui:items extension point.
 */
export
function initialize(): Promise<IDisposable> {
  Widget.attach(dockarea, document.body);
  window.onresize = () => dockarea.update();
  return Promise.resolve(void 0);
}


// global dockpanel
var dockarea = new DockPanel();
dockarea.id = 'main';
