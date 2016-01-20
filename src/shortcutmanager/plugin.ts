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
  IShortcutManager, IKeyCommand
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
  add(id: string, args: any, bindings: IKeyCommand): IDisposable {
    if (!(id in this._commandShortcutMap)) {
      this._commandShortcutMap[id] = [];
    }
    let arr = this._commandShortcutMap[id];
    let exists = false;
    for (let i = 0; i < arr.length; ++i) {
      if (this._deepEqual(arr[i].args, args)) {
        console.log('Shortcut already set: over-riding - ' + bindings.sequence);
        arr[i].sequence = bindings.sequence;
        exists = true;
      }
    }
    if (!exists) {
      arr.push({args: args, sequence: bindings.sequence});
    }

    let keyBindings: IKeyBinding = {
      sequence: bindings.sequence,
      selector: bindings.selector,
      handler: this._commandToKeyHandler(id, args, bindings.handler)
    };
    return this._keymap.add([keyBindings]);
  }

  /**
   * Test whether a handler with a specific id is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the id is registered, `false` otherwise.
   */
  hasCommand(id: string): boolean {
    return id in this._commandShortcutMap
  }

  /**
   * Lookup a handler with a specific id.
   *
   * @param id - The id of the handler of interest.
   *
   * @returns The keybindings for the specified id, or `undefined`.
   */
  getSequencesForId(id: string): string[][] {
    let result: string[][] = [];
    let arr = this._commandShortcutMap[id];
    if (arr) {
      for (let i = 0; i < arr.length; ++i) {
        result.push(arr[i].sequence);
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

  private _commandToKeyHandler(id: string, args: any, handler: (args: any) => void): () => boolean {
    let registry = this._commandRegistry;
    let keyHandler = () => {
      if (registry.canExecute(id)) {
        registry.execute(id, args);
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
