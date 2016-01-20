/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Container, Token
} from 'phosphor-di';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ICommandRecord, ICommandRegistry
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
    this._stateMap = Object.create(null);
  }

  /**
   * A signal emitted when a command is added to the registry.
   */
  get commandAdded(): ISignal<CommandRegistry, string> {
    return CommandRegistryPrivate.commandAddedSignal.bind(this);
  }

  /**
   * A signal emitted when a command is removed from the registry.
   */
  get commandRemoved(): ISignal<CommandRegistry, string> {
    return CommandRegistryPrivate.commandRemovedSignal.bind(this);
  }

  /**
   * A signal emitted when the state of a command is changed.
   */
  get commandChanged(): ISignal<ICommandRegistry, string> {
    return CommandRegistryPrivate.commandChangedSignal.bind(this);
  }

  /**
   * List the currently registered commands.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[] {
    return Object.keys(this._stateMap);
  }

  /**
   * Test whether a command is registered.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is registered, `false` otherwise.
   */
  has(id: string): boolean {
    return id in this._stateMap;
  }

  /**
   * Test whether a command is checked.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is checked, `false` otherwise.
   */
  isChecked(id: string): boolean {
    let state = this._stateMap[id];
    return state ? state.checked : false;
  }

  /**
   * Test whether a command is disabled.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if the command is disabled, `false` otherwise.
   */
  isDisabled(id: string): boolean {
    let state = this._stateMap[id];
    return state ? state.disabled : false;
  }

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
  canExecute(id: string): boolean {
    let state = this._stateMap[id];
    return state ? !state.disabled : false;
  }

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
  execute(id: string, args: any): void {
    let state = this._stateMap[id];
    if (!state) {
      console.warn(`Command '${id}' is not registered.`);
      return;
    }
    if (state.disabled) {
      console.warn(`Command '${id}' is disabled.`);
      return;
    }
    try {
      state.handler.call(void 0, args);
    } catch (err) {
      console.error(`Error in command '${id}':`, err);
    }
  }

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
  add(id: string, handler: (args: any) => void): ICommandRecord {
    if (id in this._stateMap) {
      throw new Error(`Command '${id}' is already registered.`);
    }
    let state = { handler, checked: false, disabled: false };
    let record = new CommandRecord(this, id);
    this._stateMap[id] = state;
    this.commandAdded.emit(id);
    return record;
  }

  /**
   * Get the handler function for the given command id.
   *
   * #### Notes
   * This is an `internal` method.
   */
  _getHandler(id: string): (args: any) => void {
    let state = this._stateMap[id];
    return state ? state.handler : null;
  }

  /**
   * Set the checked state for the given command id.
   *
   * #### Notes
   * This is an `internal` method.
   */
  _setChecked(id: string, value: boolean): void {
    let state = this._stateMap[id];
    if (!state || state.checked === value) {
      return;
    }
    state.checked = value;
    this.commandChanged.emit(id);
  }

  /**
   * Set the disabled state for the given command id.
   *
   * #### Notes
   * This is an `internal` method.
   */
  _setDisabled(id: string, value: boolean): void {
    let state = this._stateMap[id];
    if (!state || state.disabled === value) {
      return;
    }
    state.disabled = value;
    this.commandChanged.emit(id);
  }

  /**
   * Remove the command with the given id.
   *
   * #### Notes
   * This is an `internal` method.
   */
  _remove(id: string): void {
    if (!(id in this._stateMap)) {
      return;
    }
    delete this._stateMap[id];
    this.commandRemoved.emit(id);
  }

  private _stateMap: CommandStateMap;
}


/**
 * An object which holds the state for a command.
 */
interface ICommandState {
  /**
   * The handler function for the command.
   */
  handler: (args: any) => void;

  /**
   * The checked state for the command.
   */
  checked: boolean;

  /**
   * The disabled state for the command.
   */
  disabled: boolean;
}


/**
 * A type alias for a mapping of command id to command state.
 */
type CommandStateMap = { [id: string]: ICommandState };


/**
 * A concrete implementation of ICommandRecord.
 */
class CommandRecord implements ICommandRecord {
  /**
   * Construct a new command record.
   *
   * @param registry - The registry which owns the command.
   *
   * @param id - The unique id of the command.
   */
  constructor(registry: CommandRegistry, id: string) {
    this._registry = registry;
    this._id = id;
  }

  /**
   * Dispose the record and remove the command from the registry.
   */
  dispose(): void {
    if (this.isDisposed) {
      return;
    }
    let id = this._id;
    let registry = this._registry;
    this._id = '';
    this._registry = null;
    registry._remove(id);
  }

  /**
   * Test whether the command record is disposed.
   */
  get isDisposed(): boolean {
    return this._registry === null;
  }

  /**
   * Get the command registry which owns the command.
   */
  get registry(): ICommandRegistry {
    if (this.isDisposed) throw new Error('object is disposed');
    return this._registry;
  }

  /**
   * Get the id of the registered command.
   */
  get id(): string {
    if (this.isDisposed) throw new Error('object is disposed');
    return this._id;
  }

  /**
   * Get the handler function for the command.
   */
  get handler(): (args: any) => void {
    if (this.isDisposed) throw new Error('object is disposed');
    return this._registry._getHandler(this._id);
  }

  /**
   * Get the checked state of the command.
   */
  get checked(): boolean {
    if (this.isDisposed) throw new Error('object is disposed');
    return this._registry.isChecked(this._id);
  }

  /**
   * Set the checked state of the command.
   */
  set checked(value: boolean) {
    if (this.isDisposed) throw new Error('object is disposed');
    this._registry._setChecked(this._id, value);
  }

  /**
   * Get the disabled state of the command.
   */
  get disabled(): boolean {
    if (this.isDisposed) throw new Error('object is disposed');
    return this._registry.isDisabled(this._id);
  }

  /**
   * Set the disabled state of the command.
   */
  set disabled(value: boolean) {
    if (this.isDisposed) throw new Error('object is disposed');
    this._registry._setDisabled(this._id, value);
  }

  private _id: string;
  private _registry: CommandRegistry;
}


/**
 * The namespace for the `CommandRegistry` class private data.
 */
namespace CommandRegistryPrivate {
  /**
   * A signal emitted when a command is added to the registry.
   */
  export
  const commandAddedSignal = new Signal<CommandRegistry, string>();

  /**
   * A signal emitted when a command is removed from the registry.
   */
  export
  const commandRemovedSignal = new Signal<CommandRegistry, string>();

  /**
   * A signal emitted when the state of a command is changed.
   */
  export
  const commandChangedSignal = new Signal<CommandRegistry, string>();
}
