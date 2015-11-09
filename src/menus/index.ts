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
  IDisposable, DisposableSet, DisposableDelegate
} from 'phosphor-disposable';

import {
  MenuBar
} from 'phosphor-menus';

import {
  IExtension
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
 * Extension receiver for `menus:main`.
 */
export
function receiveMain(extension: IExtension<IMenuExtension>): IDisposable {
  if (!('main' in menuMap)) {
    menuMap['main'] = new MenuExtensionPoint('main');
  }
  let main = menuMap['main'];
  return main.receive(extension);
}


/**
 * Extension point initializer for `menus:main`.
 */
export
function initializeMain(): Promise<IDisposable> {
  console.log("Initialize main menu");
  if (!('main' in menuMap)) return Promise.resolve(void 0);
  let main = menuMap['main'];
  return main.initialize(document.body);
}



/**
 * Menu extension point handler.
 */
class MenuExtensionPoint implements IDisposable {

  constructor(name: string) {
    this._name = name;
    this._commandItems = [];
    this._menu = new MenuBar();
  }

  /**
   * Receive an extension for this menu.
   */
  receive(extension: IExtension<IMenuExtension>): IDisposable {
    console.log("RECEIVED: " + extension.toString());
    let items: ICommandMenuItem[] = [];
    if (extension.object && extension.object.hasOwnProperty('items')) {
      extension.object.items.forEach(item => {
        console.log("Adding menu item: " + item.location.toString());
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

  /**
   * Initialize the extension point.
   *
   * @param element - DOM Element to attach the menu.
   */
  initialize(element: HTMLElement): Promise<IDisposable> {
    this._menu.items = solveMenu(this._commandItems);
    this._initialized = true;
    Widget.attach(this._menu, element);
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
