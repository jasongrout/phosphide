/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
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
  IKeyBinding, KeymapManager
} from 'phosphor-keymap';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ABCCommandRegistry
} from './commandregistry';


/**
 * An object which can be added to a shortcut registry.
 */
export
interface IShortcutItem {
  /**
   * The key sequence to trigger the command.
   */
  sequence: string[];

  /**
   * The CSS selector required for the sequence to match.
   */
  selector: string;

  /**
   * The id of the command to execute.
   */
  command: string;
}


/**
 * An abstract base class which defines a shortcut registry.
 *
 * TODO - allow multiple shortcuts for a single command?
 */
export
abstract class ABCShortcutRegistry {
  /**
   * A signal emitted when shortcuts are added to the manager.
   */
  get shortcutsAdded(): ISignal<ABCShortcutRegistry, string[]> {
    return Private.shortcutsAddedSignal.bind(this);
  }

  /**
   * A signal emitted when shortcuts are removed from the manager.
   */
  get shortcutsRemoved(): ISignal<ABCShortcutRegistry, string[]> {
    return Private.shortcutsRemovedSignal.bind(this);
  }

  /**
   * List the currently registered command ids.
   *
   * @returns A new array of the registered command ids.
   */
  abstract list(): string[];

  /**
   * Test whether the registry contains a sequence for a command.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if a sequence is registered, `false` otherwise.
   */
  abstract has(command: string): boolean;

  /**
   * Get the key sequence for the given command id.
   *
   * @param command - The id of the command of interest.
   *
   * @returns The key sequence for the specified command, or null.
   */
  abstract sequenceFor(command: string): string[];

  /**
   * Add key bindings to the shortcut manager.
   *
   * @param bindings - The key bindings to add to the manager.
   *
   * @returns A disposable which removes the added key bindings.
   *
   * #### Notes
   * If a shortcut for a specific command is already registered,
   * a warning will be logged and that specific shortcut will be
   * ignored.
   */
  abstract add(items: IShortcutItem[]): IDisposable;

  /**
   * Process a `'keydown'` event dispatching a matching shortcut.
   *
   * @param event - The event object for the `'keydown'` event.
   *
   * #### Notes
   * This will typically be called automatically by the application.
   */
  abstract processKeydownEvent(event: KeyboardEvent): void;
}


/**
 * A concrete implementation of ABCShortcutRegistry.
 *
 * TODO - Support configurable keyboard layout.
 */
export
class ShortcutRegistry extends ABCShortcutRegistry {
  /**
   * Construct a shortcut manager.
   *
   * @param commands - The command registry for executing commands.
   */
  constructor(commands: ABCCommandRegistry) {
    super();
    this._commands = commands;
  }

  /**
   * List the currently registered command ids.
   *
   * @returns A new array of the registered command ids.
   */
  list(): string[] {
    return Object.keys(this._sequences);
  }

  /**
   * Test whether the registry contains a sequence for a command.
   *
   * @param id - The id of the command of interest.
   *
   * @returns `true` if a sequence is registered, `false` otherwise.
   */
  has(command: string): boolean {
    return command in this._sequences;
  }

  /**
   * Get the key sequence for the given command id.
   *
   * @param command - The id of the command of interest.
   *
   * @returns The key sequence for the specified command, or null.
   */
  sequenceFor(command: string): string[] {
    let sequence = this._sequences[command];
    return sequence ? sequence.slice() : null;
  }

  /**
   * Add key bindings to the shortcut manager.
   *
   * @param bindings - The key bindings to add to the manager.
   *
   * @returns A disposable which removes the added key bindings.
   *
   * #### Notes
   * If a shortcut for a specific command is already registered,
   * a warning will be logged and that specific shortcut will be
   * ignored.
   */
  add(items: IShortcutItem[]): IDisposable {
    // Setup the added ids and keybinding arrays.
    let added: string[] = [];
    let bindings: IKeyBinding[] = [];

    // Convert the shortcut items into key bindings.
    for (let { sequence, selector, command } of items) {

      // Log a warning if the command already has a shortcut.
      if (command in this._sequences) {
        console.warn(`shortcut already registered for '${command}'`);
        continue;
      }

      // Register a safe shallow copy of the sequence.
      sequence = sequence.slice();
      this._sequences[command] = sequence;

      // Add the command to the tracking array.
      added.push(command);

      // Add a keybinding to the tracking array.
      let handler = this._executeCommand;
      bindings.push({ sequence, selector, handler, args: command });
    }

    // If no items are added, return an empty delegate.
    if (added.length === 0) {
      return new DisposableDelegate(null);
    }

    // Add the keybindings to the keymap manager.
    // TODO - if any keybinding is invalid, we'll be out-of-sync.
    let addedResult = this._keymap.add(bindings);

    // Notify for the added shortcuts using a safe shallow copy.
    this.shortcutsAdded.emit(added.slice());

    // Return a delegate which will remove the added shortcuts.
    return new DisposableDelegate(() => {
      addedResult.dispose();
      for (let id of added) delete this._sequences[id];
      this.shortcutsRemoved.emit(added.slice());
    });
  }

  /**
   * Process a `'keydown'` event dispatching a matching shortcut.
   *
   * @param event - The event object for the `'keydown'` event.
   *
   * #### Notes
   * This will typically be called automatically by the application.
   */
  processKeydownEvent(event: KeyboardEvent): void {
    this._keymap.processKeydownEvent(event);
  }

  /**
   * The private key binding handler function.
   */
  private _executeCommand = (id: string) => {
    this._commands.execute(id);
    return true;
  };

  private _keymap = new KeymapManager();
  private _commands: ABCCommandRegistry = null;
  private _sequences = Private.createSequenceMap();
}


/**
 * The default shortcut registry service provider.
 */
export
const shortcutRegistryProvider = {
  id: 'phosphide.services.shortcutRegistry',
  provides: ABCShortcutRegistry,
  requires: [ABCCommandRegistry],
  resolve: (commands: ABCCommandRegistry) => new ShortcutRegistry(commands),
};


/**
 * The namespace for the private shortcut registry functionality.
 */
namespace Private {
  /**
   *
   */
  export
  const shortcutsAddedSignal = new Signal<ABCShortcutRegistry, string[]>();

  /**
   *
   */
  export
  const shortcutsRemovedSignal = new Signal<ABCShortcutRegistry, string[]>();

  /**
   *
   */
  export
  type SequenceMap = { [id: string]: string[] };

  /**
   *
   */
  export
  function createSequenceMap(): SequenceMap {
    return Object.create(null);
  }
}
