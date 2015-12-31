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
  IDisposable, DisposableDelegate
} from 'phosphor-disposable';

import {
  Signal, ISignal
} from 'phosphor-signaling';

/**
 * An object which manages and executes commands.
 *
 * **See also:** [[CommandRegistry]]
 */
export
interface ICommandRegistry {
  /**
   * Get a singleton instance of `CommandRegistry`.
   *
   * This singleton is useful for applications where all (or most) of
   * the commands should be centrally registered and accessible. This
   * method will always return the same command registry instance.
   */
  // instance(): ICommandRegistry;
  /**
   * A signal emitted when commands are added to the registry.
   */
  commandsAdded: ISignal<ICommandRegistry, ICommandItem[]>;
  /**
   * A signal emitted when commands are removed from the registry.
   */
  commandsRemoved: ISignal<ICommandRegistry, ICommandItem[]>;
  /**
   * List the ids of the currently registered commands.
   *
   * @returns A new array of the current command ids.
   */
  list(): string[];
  /**
   * Get the command with the specified id.
   *
   * @param id - The id of the command of interest.
   *
   * @returns The command with the specified id, or `undefined`.
   */
  get(id: string): ICommandItem;
  /**
   * Add commands to the registry.
   *
   * @param items - The command items to add to the registry.
   *
   * @returns A disposable which will remove the added commands.
   */
  add(items: ICommandItem[]): IDisposable;
}


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
   * The descriptive caption for the command.
   */
  caption: string;

  /**
   * The command to add to the registry.
   */
  command: ICommand;

  /**
   * The shortcut for the command.
   */
  shortcut?: string;

  /**
   * The title of the command.
   */
  title: string;
}


/**
 * A registry object for managing a collection of commands.
 */
export
class CommandRegistry implements ICommandRegistry {
  /**
   * Get a singleton instance of `CommandRegistry`.
   *
   * This singleton is useful for applications where all (or most) of
   * the commands should be centrally registered and accessible. This
   * method will always return the same command registry instance.
   */
  static instance(): ICommandRegistry {
    return this._instance || (this._instance = new CommandRegistry());
  }

  /**
   * A signal emitted when commands are added to the registry.
   *
   * **See also:** [[commandsAdded]]
   */
  static commandsAddedSignal = new Signal<ICommandRegistry, ICommandItem[]>();

  /**
   * A signal emitted when commands are removed from the registry.
   *
   * **See also:** [[commandsAdded]]
   */
  static commandsRemovedSignal = new Signal<ICommandRegistry, ICommandItem[]>();

  /**
   * A signal emitted when commands are added to the registry.
   *
   * #### Notes
   * This is a pure delegate to the [[commandsAddedSignal]].
   */
  get commandsAdded(): ISignal<ICommandRegistry, ICommandItem[]> {
    return CommandRegistry.commandsAddedSignal.bind(this);
  }

  /**
   * A signal emitted when commands are removed from the registry.
   *
   * #### Notes
   * This is a pure delegate to the [[commandsRemovedSignal]].
   */
  get commandsRemoved(): ISignal<ICommandRegistry, ICommandItem[]> {
    return CommandRegistry.commandsRemovedSignal.bind(this);
  }

  /**
   * List the ids of the currently registered commands.
   *
   * @returns A new array of the current command ids.
   */
  list(): string[] {
    return Object.keys(this._commands);
  }

  /**
   * Get the command with the specified id.
   *
   * @param id - The id of the command of interest.
   *
   * @returns The command with the specified id, or `undefined`.
   */
  get(id: string): ICommandItem {
    return this._commands[id];
  }

  /**
   * Add commands to the registry.
   *
   * @param items - The command items to add to the registry.
   *
   * @returns A disposable which will remove the added commands.
   *
   * #### Notes
   * If the `id` for a command is already registered, a warning will
   * be logged and that specific command will be ignored.
   */
  add(items: ICommandItem[]): IDisposable {
    // Register the commands and warn for duplicate command ids.
    let added: ICommandItem[] = [];
    for (let item of items) {
      if (item.id in this._commands) {
        console.warn(`Command '${item.id}' is already registered.`);
      } else {
        added.push(item);
        this._commands[item.id] = item;
      }
    }

    // If there are no new commands, there is nothing to do.
    if (added.length === 0) {
      return new DisposableDelegate(() => { });
    }

    // Emit the `commandsAdded` signal with a copy of the array
    // to protect the internal state from external modification.
    this.commandsAdded.emit(added.slice());

    // Return a dispospable which will remove the the commands.
    return new DisposableDelegate(() => {
      for (let cmd of added) {
        delete this._commands[cmd.id];
      }
      this.commandsRemoved.emit(added.slice());
    });
  }

  private static _instance: CommandRegistry = null;
  private _commands: { [id: string]: ICommandItem } = Object.create(null);
}
