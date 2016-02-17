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
  KeymapManager
} from 'phosphor-keymap';

import {
  ISignal
} from 'phosphor-signaling';


/**
 * An object which can be added to a Shortcut Manager.
 */
export
interface IShortcutItem {
  /**
   * The key sequence to trigger this command.
   */
  sequence: string[];
  /**
   * The CSS selector required for the sequence to match.
   */
  selector: string;
  /**
   * The id of the command.
   */
  command: string;
  /**
   * The arguments to be passed to the command.
   */
  args?: any;
}


/**
 * An object which manages a collection of shortcuts.
 */
export interface IShortcutManager {
  /**
   * A signal emitted when shortcuts are added to the manager.
   */
  shortcutsAdded: ISignal<IShortcutManager, IShortcutItem[]>;

  /**
   * A signal emitted when shortcuts are removed from the manager.
   */
  shortcutsRemoved: ISignal<IShortcutManager, IShortcutItem[]>;

  /**
   * Add key bindings to the shortcut manager.
   *
   * @param bindings - The key bindings to add to the manager.
   *
   * @returns A disposable which removes the added key bindings.
   */
  add(items: IShortcutItem[]): IDisposable;

  /**
   * Get the registered key sequences for the given command id and args.
   *
   * @param id - The command of interest.
   *
   * @returns The keybindings for the specified id and args, or `undefined`.
   */
  getSequences(id: string, args: any): string[][];
}


/**
 * The dependency token for the `IShortcutManager` interface.
 */
export
const IShortcutManager = new Token<IShortcutManager>('phosphide.IShortcutManager');
