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
  IShortcutManager
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
  add(bindings: IKeyBinding[]): IDisposable {
    return this._keymap.add(bindings);
  }

  /**
   * Test whether a handler with a specific id is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the id is registered, `false` otherwise.
   */
  hasCommand(id: string): boolean {
    let handler = this._commandRegistry.get(id);
    return this._keymap.hasHandler(handler);
  }

  /**
   * Lookup a handler with a specific id.
   *
   * @param id - THe id of the handler of interest.
   *
   * @returns The keybinding for the specified id, or `undefined`.
   */
  getSequencesForId(id: string): string[][] {
    return this._keymap.getSequencesForId(id);
  }

  private _keymap: KeymapManager = null;
  private _commandRegistry: ICommandRegistry = null;
}
