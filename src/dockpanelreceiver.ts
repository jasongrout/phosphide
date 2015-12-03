/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  IExtension, IReceiver
} from 'phosphor-plugins';

import {
  Widget
} from 'phosphor-widget';


/**
 *
 */
export
class DockPanelReceiver implements IReceiver {
  /**
   *
   */
  constructor(dockPanel: DockPanel) {
    this._dockPanel = dockPanel;
    this._map = Object.create(null);
  }

  /**
   *
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    for (let id in this._map) {
      this._map[id].parent = null;
    }
    this._dockPanel = null;
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
    if (!(ext.item instanceof Widget)) {
      throw new Error(`Extension ${ext.id} contributed invalid item type.`);
    }
    this._map[ext.id] = ext.item;
    this._dockPanel.insertTabAfter(ext.item); // TODO handle initial position
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
    item.parent = null;
  }

  private _disposed = false;
  private _dockPanel: DockPanel;
  private _map: { [id: string]: Widget };
}
