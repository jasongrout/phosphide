/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  ICommandMenuItem
} from './menuiteminterface';

import {
  solveMenu
} from './menusolver';

import {
  IExtension
} from 'phosphor-plugins';

import {
  IDisposable, DisposableDelegate, DisposableSet
} from 'phosphor-disposable';

import {
  Menu, MenuBar, MenuItem
} from 'phosphor-menus';

import {
  Signal, ISignal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';


import './index.css';


/**
 * The interface required for `menu:items` extension point.
 */
export
interface IItems {
  items: ICommandMenuItem[];
}


/**
 * Extension point receiver for `menu:items`.
 */
export
function receiveItems(extension: IExtension<IItems>): IDisposable {
  var disposables: IDisposable[] = [];

  if (extension.object && extension.object.hasOwnProperty('items')) {
    extension.object.items.forEach(item => {
      var disp = addToMenuItems(item);
      disposables.push(disp);
    });
  } 
  if (extension.data && extension.data.hasOwnProperty('items')) {
    extension.data.items.forEach((item: ICommandMenuItem) => {
      var disp = addToMenuItems(item);
      disposables.push(disp);
    });
  }
  menuBar.items = solveMenu(menuItems);
  return new DisposableSet(disposables);
}


/**
 * Extension point initializer for `menu:items`.
 */
export
function initialize(): Promise<IDisposable> {
  return new Promise((resolve, reject) => {
    Widget.attach(menuBar, document.body);

    if (menuBar.isAttached) {
      var disposable = new DisposableDelegate(() => {
        Widget.detach(menuBar);
      });
      resolve(disposable);
    } else {
      reject(new Error("Error initialising menu plugin."));
    }
  });                
}


/**
 * Add an item to the menu.
 */
function addToMenuItems(item: ICommandMenuItem): IDisposable {
  menuItems.push(item);
  return new DisposableDelegate(() => {
    var index = indexOfItem(item);
    if (index > -1) {
      menuItems.splice(index, 1);
    }
  });
}


/**
 * Get the index of an item in the menu.
 */
function indexOfItem(item: ICommandMenuItem): number {
  for (var i = 0; i < menuItems.length; ++i) {
    if (compareArrays(menuItems[i].location, item.location)) {
      if (menuItems[i].command === item.command) {
        return i;
      }
    }
  }
  return -1;
}


/**
 * Check whether two arrays are equal.
 */
function compareArrays(first: string[], second: string[]): boolean {
  if (first.length !== second.length) return false;
  for (var i = 0; i < first.length; ++i) {
    if (first[i] !== second[i]) {
      return false;
    }
  }
  return true;
}


// Menu items store.
var menuItems: ICommandMenuItem[] = [];

// Global menu bar.
var menuBar = new MenuBar();
