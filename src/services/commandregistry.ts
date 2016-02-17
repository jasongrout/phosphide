/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

import {
  ISignal, Signal
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
   * The handler function for the command.
   */
  handler: () => void;
}


/**
 * An abstract base class which defines a command registry.
 */
export
abstract class ABCCommandRegistry {
  /**
   * A signal emitted when commands are added to the registry.
   */
  get commandsAdded(): ISignal<ABCCommandRegistry, string[]> {
    return Private.commandsAddedSignal.bind(this);
  }

  /**
   * A signal emitted when commands are removed from the registry.
   */
  get commandsRemoved(): ISignal<ABCCommandRegistry, string[]> {
    return Private.commandsRemovedSignal.bind(this);
  }

  /**
   * A signal emitted when a command is executed.
   */
  get commandExecuted(): ISignal<ABCCommandRegistry, string> {
    return Private.commandExecutedSignal.bind(this);
  }

  /**
   * List the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  abstract list(): string[];

  /**
   * Test whether the registry contains a command.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  abstract has(id: string): boolean;

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
  abstract add(items: ICommandItem[]): IDisposable;

  /**
   * Execute a registered command.
   *
   * @param id - The id of the command to execute.
   *
   * #### Notes
   * If the command id is not registered, a warning will be logged.
   *
   * If the handler throws an exception, it will be caught and logged.
   */
  abstract execute(id: string): void;
}


/**
 * A concrete implementation of ABCCommandRegistry.
 */
export
class CommandRegistry extends ABCCommandRegistry {
  /**
   * List the ids of the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[] {
    return Object.keys(this._commands);
  }

  /**
   * Test whether the registry contains a command.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  has(id: string): boolean {
    return id in this._commands;
  }

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
  add(items: ICommandItem[]): IDisposable {
    // Setup the array for the new unique ids.
    let added: string[] = [];

    // Add the new commands to the map and warn for duplicates.
    for (let { id, handler } of items) {
      if (id in this._commands) {
        console.warn(`Command '${id}' is already registered.`);
      } else {
        this._commands[id] = handler;
        added.push(id);
      }
    }

    // If no items are added, return an empty delegate.
    if (added.length === 0) {
      return new DisposableDelegate(null);
    }

    // Notify for the added commands using a safe shallow copy.
    this.commandsAdded.emit(added.slice());

    // Return a delegate which will remove the added commands.
    return new DisposableDelegate(() => {
      for (let id of added) delete this._commands[id];
      this.commandsRemoved.emit(added.slice());
    });
  }

  /**
   * Execute a registered command.
   *
   * @param id - The id of the command to execute.
   *
   * #### Notes
   * If the command id is not registered, a warning will be logged.
   *
   * If the handler throws an exception, it will be caught and logged.
   */
  execute(id: string): void {
    let handler = this._commands[id];
    if (!handler) {
      console.warn(`command '${id}' not registered`);
      return;
    }
    try {
      handler();
    } catch (err) {
      console.error(`error in command '${id}'`, err);
    }
    this.commandExecuted.emit(id);
  }

  private _commands = Private.createCommandMap();
}


/**
 * The default command registry service provider.
 */
export
const commandRegistryProvider = {
  id: 'phosphide.services.commandRegistry',
  provides: ABCCommandRegistry,
  resolve: () => new CommandRegistry(),
};


/**
 * The namespace for the private command registry functionality.
 */
namespace Private {
  /**
   *
   */
  export
  const commandsAddedSignal = new Signal<ABCCommandRegistry, string[]>();

  /**
   *
   */
  export
  const commandsRemovedSignal = new Signal<ABCCommandRegistry, string[]>();

  /**
   *
   */
  export
  const commandExecutedSignal = new Signal<ABCCommandRegistry, string>();

  /**
   *
   */
  export
  type CommandMap = { [id: string]: () => void; };

  /**
   *
   */
  export
  function createCommandMap(): CommandMap {
    return Object.create(null);
  }
}
