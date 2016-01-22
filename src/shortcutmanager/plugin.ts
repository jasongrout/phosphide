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
  EN_US, IKeyboardLayout, keystrokeForKeydownEvent,
  normalizeKeystroke, IKeyBinding, KeymapManager
} from 'phosphor-keymap';

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

export class ShortcutManager {

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
    this._keymap = new KeymapManager();
    this._commandRegistry = registry;

    // Setup the keydown listener for the document.
    document.addEventListener('keydown', event => {
      this._keymap.processKeydownEvent(event);
    });
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
        if (this._deepEqual(arr[i].args, item.args)) {
          console.log('Shortcut already set: ' + item.sequence);
          exists = true;
        }
      }

      if (!exists) {
        arr.push({args: item.args, sequence: item.sequence});
      }

      bindings.push({
        sequence: item.sequence,
        selector: item.selector,
        command: this._commandRegistry.get(id),
        args: item.args
      });
    }

    let added = this._keymap.add(bindings);

    return new DisposableDelegate(() => {
      added.dispose();
      // remove from id -> sequence map.
    });
  }

  /**
   * Test whether a handler with a specific id is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the id is registered, `false` otherwise.
   */
  hasCommand(id: string): boolean {
    return id in this._commandShortcutMap;
  }

  /**
   * Lookup a handler with a specific id.
   *
   * @param id - The id of the handler of interest.
   *
   * @returns The keybindings for the specified id, or `undefined`.
   */
  getSequences(id: string, args: any): string[][] {
    let result: string[][] = [];
    let arr = this._commandShortcutMap[id];
    if (arr) {
      for (let i = 0; i < arr.length; ++i) {
        if (this._deepEqual(arr[i].args, args)) {
          result.push(arr[i].sequence);
        }
      }
      return result;
    }
  }

  private _deepEqual(x: any, y: any): boolean {
    return (x && y && typeof x === 'object' && typeof y === 'object') ?
      (Object.keys(x).length === Object.keys(y).length) &&
        Object.keys(x).reduce(function(isEqual, key) {
          return isEqual && this._deepEqual(x[key], y[key]);
        }, true) : (x === y);
  }

  private _commandToKeyHandler(id: string, args: any): () => boolean {
    let registry = this._commandRegistry;
    let keyHandler = () => {
      let command = registry.get(id);
      if (command) {
        command.execute(args);
        return true;
      }
      return false;
    };
    return keyHandler;
  }

  private _keymap: KeymapManager = null;
  private _commandRegistry: ICommandRegistry = null;
  private _commandShortcutMap: CommandShortcutMap = {};
}


type CommandShortcutMap = { [id: string]: Array<{args: any, sequence: string[]}> };
