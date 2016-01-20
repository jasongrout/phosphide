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
 * An object which manages a collection of commands.
 */
export
interface ICommandRegistry {
  /**
   * A signal emitted when a command is added to the registry.
   */
  commandAdded: ISignal<ICommandRegistry, string>;

  /**
   * A signal emitted when a command is removed from the registry.
   */
  commandRemoved: ISignal<ICommandRegistry, string>;

  /**
   * A signal emitted when the state of a command is changed.
   */
  commandChanged: ISignal<ICommandRegistry, string>;

  /**
   * List the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[];

  /**
   * Test whether a command is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  isRegistered(id: string): boolean;

  /**
   * Test whether a command is checked.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is checked, `false` otherwise.
   */
  isChecked(id: string): boolean;

  /**
   * Test whether a command is disabled.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is disabled, `false` otherwise.
   */
  isDisabled(id: string): boolean;

  /**
   * Test whether a command can execute in its current state.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command can execute, `false` otherwise.
   *
   * #### Notes
   * A command can execute if it is registered and is not disabled.
   */
  canExecute(id: string): boolean;

  /**
   * Execute a registered command.
   *
   * @param id - The id of the command to execute.
   *
   * @param args - The arguments object to pass to the command. This
   *   may be `null` if the command does not require arguments.
   *
   * #### Notes
   * If the command is not registered or is disabled, a warning will be
   * logged to the console. If the command throws an exception, it will
   * be caught and logged to the console.
   */
  execute(id: string, args: any): void;

  /**
   * Add a command to the registry.
   *
   * @param id - The unique id for the command.
   *
   * @param handler - The handler function for the command.
   *
   * @returns A command record which can be used to modify the state
   *   of the command. Disposing the record will remove the command
   *   from the registry.
   *
   * #### Notes
   * If the given command `id` is already registered, an exception
   * will be thrown.
   */
  add(id: string, handler: (args: any) => void): ICommandRecord;
}


/**
 * The dependency token for the `ICommandRegistry` interface.
 */
export
const ICommandRegistry = new Token<ICommandRegistry>('phosphide.ICommandRegistry');


/**
 * A registration record for a command.
 */
export
interface ICommandRecord extends IDisposable {
  /**
   * The command registry which owns the command.
   *
   * #### Notes
   * This is a read-only property.
   */
  registry: ICommandRegistry;

  /**
   * The id of the registered command.
   *
   * #### Notes
   * This is a read-only property.
   */
  id: string;

  /**
   * The checked state of the command.
   *
   * #### Notes
   * This is a read-write property.
   */
  checked: boolean;

  /**
   * The disabled state of the command.
   *
   * #### Notes
   * This is a read-write property.
   */
  disabled: boolean;
}
