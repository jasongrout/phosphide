/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Token
} from 'phosphor-di';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  IKeyBinding
} from 'phosphor-keymap';


/**
 * An object which manages a collection of shortcuts.
 */
export interface IShortcutManager {

  /**
   * Add key bindings to the key map manager.
   *
   * @param bindings - The key bindings to add to the manager.
   *
   * @returns A disposable which removes the added key bindings.
   */
  add(bindings: IKeyBinding[]): IDisposable;

  /**
   * Test whether a handler with a specific id is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the id is registered, `false` otherwise.
   */
  hasCommand(id: string): boolean;

  /**
   * Lookup a command.
   *
   * @param id - The command of interest.
   *
   * @returns The keybinding for the specified handler, or `undefined`.
   */
  getSequencesForId(id: string): string[][];
}


/**
 * The dependency token for the `IShortcutManager` interface.
 */
export
const IShortcutManager = new Token<IShortcutManager>('phosphide.IShortcutManager');
