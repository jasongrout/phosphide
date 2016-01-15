/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
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
  IDisposable, DisposableSet, DisposableDelegate
} from 'phosphor-disposable';

import {
  MenuBar
} from 'phosphor-menus';

import {
  IExtension, IReceiver
} from 'phosphor-plugins';

import {
  Widget
} from 'phosphor-widget';

import './index.css';


/**
 * The interface required for `menus` extension points.
 */
export
interface IMenuExtension {
  items: ICommandMenuItem[];
}


/**
 * Create menu receiver
 */
export
function createMenuReceiver(): IReceiver {
  console.log("Phosphide: create menu receiver");
  if (!('main' in menuMap)) {
    menuMap['main'] = new MenuExtensionPoint('main');
  }
  return menuMap['main'];
}

/**
 * Extension receiver for `menus:main`.
 */
// export
// function (extension: IExtension): IDisposable {
//   if (!('main' in menuMap)) {
//     menuMap['main'] = new MenuExtensionPoint('main');
//   }
//   let main = menuMap['main'];
//   return main.receive(extension);
// }


/**
 * Extension point initializer for `menus:main`.
 */
// export
// function initializeMain(): Promise<IDisposable> {
//   if (!('main' in menuMap)) {
//     menuMap['main'] = new MenuExtensionPoint('main');
//   }
//   let main = menuMap['main'];
//   return main.initialize(document.body);
// }


/**
 * Menu extension point handler.
 */
class MenuExtensionPoint implements IReceiver, IDisposable {

  constructor(name: string) {
    this._name = name;
    this._commandItems = [];
    this._menu = new MenuBar();
  }

  /**
   * Receive an extension for this menu.
   */
  add(extension: IExtension): IDisposable {
    let items: ICommandMenuItem[] = [];
    if (extension.item && extension.item.hasOwnProperty('items')) {
      extension.item.items.forEach((item: any) => {
        this._commandItems.push(item);
        items.push(item);
      });
    }
    if (extension.data && extension.data.hasOwnProperty('items')) {
      extension.data.items.forEach((item: ICommandMenuItem) => {
        this._commandItems.push(item);
      });
    }
    if (this._initialized) {
      this._menu.items = solveMenu(this._commandItems);
    }
    if (!items) return void 0;
    return new DisposableDelegate(() => {
      for (let i of items) {
        this._commandItems.splice(this._commandItems.indexOf(i), 1);
      }
      this._menu.items = solveMenu(this._commandItems);
      this._menu.update();
    });
  }

  remove(id: string) {
    // TODO
  }

  /**
   * Initialize the extension point.
   *
   * @param element - DOM Element to attach the menu.
   */
  initialize(element: HTMLElement): Promise<IDisposable> {
    this._initialized = true;
    this._menu.items = solveMenu(this._commandItems);
    Widget.attach(this._menu, element);
    this._menu.update();
    return Promise.resolve(this);
  }

  /**
   * Return whether the extension point has been disposed.
   */
  get isDisposed(): boolean {
    return (this._commandItems === null);
  }

  /**
   * Dispose of the resources held by the extension point.
   */
  dispose() {
    this._commandItems = null;
    this._menu.dispose();
    delete menuMap[this._name];
  }

  private _commandItems: ICommandMenuItem[] = null;
  private _initialized = false;
  private _menu: MenuBar = null;
  private _name = '';
}


// Menu extension point store.
var menuMap: { [key: string]: MenuExtensionPoint } = { };
