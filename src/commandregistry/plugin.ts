/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
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
   * Construct a new command registry instance.
   */
  constructor() {
    this._map = Object.create(null);
  }

  /**
   * A signal emitted when commands are added to the registry.
   */
  get commandsAdded(): ISignal<CommandRegistry, string[]> {
    return CommandRegistryPrivate.commandsAddedSignal.bind(this);
  }

  /**
   * A signal emitted when commands are removed from the registry.
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
   * Test whether a command with a specific id is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  has(id: string): boolean {
    return id in this._map;
  }

  /**
   * Lookup a command with a specific id.
   *
   * @param id - The id of the command of interest.
   *
   * @returns The command with the specified id, or `undefined`.
   */
  get(id: string): ICommand {
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
    let added: string[] = [];
    for (let { id, command } of items) {
      if (id in this._map) {
        console.warn(`Command '${id}' is already registered.`);
      } else {
        added.push(id);
        this._map[id] = command;
      }
    }

    if (added.length === 0) {
      return new DisposableDelegate(null);
    }

    this.commandsAdded.emit(added.slice());

    return new DisposableDelegate(() => {
      for (let id of added) delete this._map[id];
      this.commandsRemoved.emit(added.slice());
    });
  }

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
  execute(id: string, args: any): void {
    let cmd = this._map[id];
    if (!cmd) {
      console.warn(`Command '${id}' is not registered.`);
      return;
    }
    if (!cmd.isEnabled()) {
      console.warn(`Command '${id}' is not enabled.`);
      return;
    }
    cmd.execute(args);
  }

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
  safeExecute(id: string, args: any): void {
    try {
      this.execute(id, args);
    } catch (err) {
      console.error(err);
    }
  }

  private _map: { [id: string]: ICommand };
}


/**
 * The namespace for the `CommandRegistry` class private data.
 */
namespace CommandRegistryPrivate {
  /**
   * A signal emitted when commands are added to the registry.
   */
  export
  const commandsAddedSignal = new Signal<CommandRegistry, string[]>();

  /**
   * A signal emitted when commands are removed from the registry.
   */
  export
  const commandsRemovedSignal = new Signal<CommandRegistry, string[]>();
}
