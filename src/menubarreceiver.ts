/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  MenuBar
} from 'phosphor-menus';

import {
  IExtension, IReceiver
} from 'phosphor-plugins';


/**
 *
 */
export
class MenuBarReceiver implements IReceiver {
  /**
   *
   */
  constructor(menuBar: MenuBar) {
    this._menuBar = menuBar;
    this._map = Object.create(null);
    menuBar.hidden = true;
    menuBar.items = [];
  }

  /**
   *
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._menuBar.items = [];
    this._menuBar.hidden = true;
    this._menuBar = null;
    this._map = null;
  }

  /**
   *
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   *
   */
  add(ext: IExtension): void {
    if (this._disposed) {
      throw new Error('Receiver is disposed.');
    }
    if (ext.id in this._map) {
      return;
    }
    // TODO parse/create/merge/sort/populate
  }

  /**
   *
   */
  remove(id: string): void {
    if (this._disposed) {
      throw new Error('Receiver is disposed.');
    }
    if (!(id in this._map)) {
      return;
    }
    let item = this._map[id];
    delete this._map[id];
    item.dispose();
  }

  private _disposed = false;
  private _menuBar: MenuBar;
  private _map: { [id: string]: IDisposable };
}
