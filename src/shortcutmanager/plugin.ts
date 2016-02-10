/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Token, Container
} from 'phosphor-di';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

import {
  IKeyBinding, KeymapManager
} from 'phosphor-keymap';

import {
  Signal, ISignal
} from 'phosphor-signaling';

import {
  IShortcutManager, IShortcutItem
} from './index';

import {
  ICommandRegistry
} from '../commandregistry/index';


/**
 * Register the plugin contributions.
 *
 * @param container - The di container for type registration.
 *
 * #### Notes
 * This is called automatically when the plugin is loaded.
 */
export
function register(container: Container): void {
  container.register(IShortcutManager, ShortcutManager);
}


/**
 * An object for managing shortcuts.
 */
export
class ShortcutManager {
  /**
   * The dependencies required by the shortcut manager.
   */
  static requires: Token<any>[] = [ICommandRegistry];

  /**
   * Create new shortcut manager instance.
   */
  static create(registry: ICommandRegistry): IShortcutManager {
    return new ShortcutManager(registry);
  }

  /**
   * Construct a shortcut manager.
   */
  constructor(registry: ICommandRegistry) {
    // TODO: keyboard layout and listener node should be configurable.
    this._keymap = new KeymapManager();
    this._commandRegistry = registry;
    document.addEventListener('keydown', event => {
      this._keymap.processKeydownEvent(event);
    });
  }

  /**
   * A signal emitted when a shortcut is added to the manager.
   */
  get shortcutsAdded(): ISignal<ShortcutManager, IShortcutItem[]> {
    return ShortcutManagerPrivate.shortcutsAddedSignal.bind(this);
  }

  /**
   * A signal emitted when a shortcut is removed from the manager.
   */
  get shortcutsRemoved(): ISignal<ShortcutManager, IShortcutItem[]> {
    return ShortcutManagerPrivate.shortcutsRemovedSignal.bind(this);
  }

  /**
   * Add key bindings to the shortcut manager.
   *
   * @param bindings - The key bindings to add to the manager.
   *
   * @returns A disposable which removes the added key bindings.
   */
  add(items: IShortcutItem[]): IDisposable {
    let bindings: IKeyBinding[] = [];

    for (let item of items) {
      let id = item.command;
      let arr = this._commandShortcutMap[id];
      if (!arr) {
        this._commandShortcutMap[id] = arr = [];
      }
      let exists = false;

      for (let i = 0; i < arr.length; ++i) {
        if (deepEqual(arr[i].args, item.args)) {
          console.log('Shortcut already set: ' + item.sequence);
          exists = true;
        }
      }

      // If the given command and args is already registered,
      // don't register it, just move on to the next one.
      if (exists) {
        continue;
      }

      arr.push({args: item.args, sequence: item.sequence});

      bindings.push({
        sequence: item.sequence,
        selector: item.selector,
        handler: this._handlerForKeymap(id),
        args: item.args
      });
    }

    let added = this._keymap.add(bindings);
    this.shortcutsAdded.emit(items.slice());

    return new DisposableDelegate(() => {
      added.dispose();
      for (let i = 0; i < items.length; ++i) {
        let arr = this._commandShortcutMap[items[i].command];
        for (let j = 0; j < arr.length; ++i) {
          if (deepEqual(arr[j].args, items[i].args)) {
            arr.splice(j, 1);
            if (arr.length === 0) {
              delete this._commandShortcutMap[items[i].command];
            }
          }
        }
      }
      this.shortcutsRemoved.emit(items.slice());
    });
  }

  /**
   * Get the registered key sequences for the given command id and args.
   *
   * @param id - The command of interest.
   *
   * @returns The keybindings for the specified id and args, or `undefined`.
   */
  getSequences(id: string, args: any): string[][] {
    let result: string[][] = [];
    let arr = this._commandShortcutMap[id];
    if (arr) {
      for (let i = 0; i < arr.length; ++i) {
        if (deepEqual(arr[i].args, args)) {
          result.push(arr[i].sequence);
        }
      }
      return result;
    }
  }

  private _handlerForKeymap(id: string): (args: any) => boolean {
    return (args: any) => {
      this._commandRegistry.execute(id, args);
      return true;
    };
  }

  private _keymap: KeymapManager = null;
  private _commandRegistry: ICommandRegistry = null;
  private _commandShortcutMap: CommandShortcutMap = {};
}


/**
 * The type used to map command IDs to arrays of arg and sequence definitions.
 */
type CommandShortcutMap = { [id: string]: Array<{args: any, sequence: string[]}> };


/**
 * Recursively perform deep equality testing on arbitrary object trees.
 */
function deepEqual(x: any, y: any): boolean {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce(function(isEqual, key) {
        return isEqual && deepEqual(x[key], y[key]);
      }, true) : (x === y);
}


/**
 * The namespace for the `ShortcutManager` class private data.
 */
namespace ShortcutManagerPrivate {
  /**
   * A signal emitted when a shortcut is added to the manager.
   */
  export
  const shortcutsAddedSignal = new Signal<ShortcutManager, IShortcutItem[]>();
  /**
   * A signal emitted when a shortcut is added to the manager.
   */
  export
  const shortcutsRemovedSignal = new Signal<ShortcutManager, IShortcutItem[]>();
}
