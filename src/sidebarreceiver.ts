/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IExtension, IReceiver
} from 'phosphor-plugins';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  clearSignalData
} from 'phosphor-signaling';

import {
  StackedPanel
} from 'phosphor-stackedpanel';

import {
  IChildWidgetList, Widget
} from 'phosphor-widget';

import {
  SideBar
} from './sidebar';


/**
 *
 */
export
class SideBarReceiver implements IReceiver {
  /**
   *
   */
  constructor(bar: SideBar<Widget>, stack: StackedPanel) {
    this._bar = bar;
    this._stack = stack;
    this._map = Object.create(null);
    bar.hidden = true;
    stack.hidden = true;
    stack.children.clear();
    bar.items = stack.children;
    bar.currentItemChanged.connect(this._onCurrentChanged, this);
    stack.children.changed.connect(this._onChildrenChanged, this);
  }

  /**
   *
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    clearSignalData(this);
    this._stack.children.clear();
    this._stack.hidden = true;
    this._bar.hidden = true;
    this._stack = null;
    this._bar = null;
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
    this._stack.children.add(ext.item); // TODO handle sort order via config
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
    this._stack.children.remove(item);
  }

  /**
   *
   */
  private _onCurrentChanged(sender: SideBar<Widget>, args: IChangedArgs<Widget>): void {
    this._stack.currentWidget = args.newValue;
    this._stack.hidden = !args.newValue;
  }

  /**
   *
   */
  private _onChildrenChanged(sender: IChildWidgetList): void {
    if (sender.length === 0) {
      this._bar.hidden = true;
      this._stack.hidden = true;
    } else {
      this._bar.hidden = false;
    }
  }

  private _disposed = false;
  private _stack: StackedPanel;
  private _bar: SideBar<Widget>;
  private _map: { [id: string]: Widget };
}
