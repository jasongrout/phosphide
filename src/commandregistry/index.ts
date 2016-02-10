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
   * A signal emitted when a command is executed.
   */
  commandExecuted: ISignal<ICommandRegistry, { id: string, args: any }>;

  /**
   * List the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[];

  /**
   * Test whether the registry contains a command.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  has(id: string): boolean;

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

  /**
   * Execute a registered command.
   *
   * @param id - The id of the command of interest.
   *
   * @param args - The arguments to pass to the command, if necessary.
   *
   * #### Notes
   * If the command id is not registered, a warning will be logged.
   *
   * If the handler throws an exception, it will be caught and logged.
   */
  execute(id: string, args?: any): void;
}


/**
 * The dependency token for the `ICommandRegistry` interface.
 */
export
const ICommandRegistry = new Token<ICommandRegistry>('phosphide.ICommandRegistry');
