/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
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
  ISignal
} from 'phosphor-signaling';


/**
 * An object which can be added to a command registry.
 */
export
interface ICommandItem {
  /**
   * The unique id for the command.
   */
  id: string;

  /**
   * The command to add to the registry.
   */
  handler: (args: any) => void;
}


/**
 * An object which manages a collection of commands.
 */
export
interface ICommandRegistry {
  /**
   * A signal emitted when commands are added to the registry.
   */
  commandsAdded: ISignal<ICommandRegistry, string[]>;

  /**
   * A signal emitted when commands are removed from the registry.
   */
  commandsRemoved: ISignal<ICommandRegistry, string[]>;

  /**
   * List the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[];

  /**
   * Lookup a command with a specific id.
   *
   * @param id - The id of the command of interest.
   *
   * @returns The command with the specified id, or `undefined`.
   */
  get(id: string): (args: any) => void;

  /**
   * Add commands to the registry.
   *
   * @param items - The command items to add to the registry.
   *
   * @returns A disposable which will remove the added commands.
   *
   * #### Notes
   * If the `id` for a command is already registered, a warning will be
   * logged to the console and that specific command will be ignored.
   */
  add(items: ICommandItem[]): IDisposable;
}


/**
 * The dependency token for the `ICommandRegistry` interface.
 */
export
const ICommandRegistry = new Token<ICommandRegistry>('phosphide.ICommandRegistry');
