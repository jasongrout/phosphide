/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Command
} from 'phosphor-command';

import {
  Container, Token
} from 'phosphor-di';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ICommandItem, ICommandRegistry
} from './index';


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
  container.register(ICommandRegistry, CommandRegistry);
}


/**
 * A concrete implementation of ICommandRegistry.
 */
class CommandRegistry implements ICommandRegistry {
  /**
   * The dependencies required by the command registry.
   */
  static requires: Token<any>[] = [];

  /**
   * Create a new command registry instance.
   */
  static create(): CommandRegistry {
    return new CommandRegistry();
  }

  /**
   * Construct a new command registry.
   */
  constructor() {
    this._map = Object.create(null);
  }

  /**
   * A signal emitted when a command is added to the registry.
   */
  get commandsAdded(): ISignal<CommandRegistry, string[]> {
    return CommandRegistryPrivate.commandsAddedSignal.bind(this);
  }

  /**
   * A signal emitted when a command is removed from the registry.
   */
  get commandsRemoved(): ISignal<CommandRegistry, string[]> {
    return CommandRegistryPrivate.commandsRemovedSignal.bind(this);
  }

  /**
   * List the ids of the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[] {
    return Object.keys(this._map);
  }

  /**
   * Lookup a command with a specific id.
   *
   * @param id - The id of the command of interest.
   *
   * @returns The command with the specified id, or `undefined`.
   */
  get(id: string): Command {
    return this._map[id];
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
    for (let { id, command } of items) {
      if (id in this._map) {
        console.warn(`Command '${id}' is already registered.`);
      } else {
        this._map[id] = command;
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
      for (let id of added) delete this._map[id];
      this.commandsRemoved.emit(added.slice());
    });
  }

  private _map: { [id: string]: Command };
}


/**
 * The namespace for the `CommandRegistry` class private data.
 */
namespace CommandRegistryPrivate {
  /**
   * A signal emitted when a command is added to the registry.
   */
  export
  const commandsAddedSignal = new Signal<CommandRegistry, string[]>();

  /**
   * A signal emitted when a command is removed from the registry.
   */
  export
  const commandsRemovedSignal = new Signal<CommandRegistry, string[]>();
}
