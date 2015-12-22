/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  ICommand
} from 'phosphor-command';

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
  command: ICommand;
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
   * List the ids of the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[];

  /**
   * Test whether a command with a specific id is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  has(id: string): boolean;

  /**
   * Lookup a command with a specific id.
   *
   * @param id - The id of the command of interest.
   *
   * @returns The command with the specified id, or `undefined`.
   */
  get(id: string): ICommand;

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
   * A convenience method to execute a registered command.
   *
   * @param id - The id of the command to execute.
   *
   * @param args - The arguments object to pass to the command. This
   *   may be `null` if the command does not require arguments.
   *
   * #### Notes
   * If the command is not registered or is not enabled, a warning will
   * be logged to the console. If the command throws an exception, the
   * exception will be propagated to the caller.
   *
   * If more control over execution is required, the command should be
   * retrieved from the registry and used directly.
   */
  execute(id: string, args: any): void;

  /**
   * A convenience method to safely execute a registered command.
   *
   * @param id - The id of the command to execute.
   *
   * @param args - The arguments object to pass to the command. This
   *   may be `null` if the command does not require arguments.
   *
   * #### Notes
   * If the command is not registered or is not enabled, a warning will
   * be logged to the console. If the command throws an exception, the
   * exception will be logged to the console.
   *
   * If more control over execution is required, the command should be
   * retrieved from the registry and used directly.
   */
  safeExecute(id: string, args: any): void;
}


/**
 * The dependency token for the `ICommandRegistry` interface.
 */
export
const ICommandRegistry = new Token<ICommandRegistry>('phosphide.ICommandRegistry');
