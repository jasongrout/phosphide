/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Container, Lifetime
} from 'phosphor-di';

import {
  CommandPalette, StandardPaletteModel,
  IStandardPaletteItemOptions, StandardPaletteItem
} from 'phosphor-commandpalette';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

import {
  Signal, ISignal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';

import {
  ICommandPalette
} from './index';

import {
  ICommandRegistry, ICommandItem
} from '../commandregistry/index';

import {
  IShortcutManager, IShortcutItem
} from '../shortcutmanager/index';

/**
 * The ID seed for added groups of palette items.
 */
var id = 0;


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
  container.register(ICommandPalette, {
    lifetime: Lifetime.Singleton,
    requires: [ICommandRegistry, IShortcutManager],
    create: (commandRegistry: ICommandRegistry, shortcutManager: IShortcutManager): ICommandPalette => {
      return new CommandPaletteManager(commandRegistry, shortcutManager);
    }
  });
}


/**
 * Fetch and format a shortcut sequence.
 *
 * @param shortcutManager - The shortcut manager that will be queried.
 *
 * @param command - The ID of the comand.
 *
 * @param args - The arguments passed to the command.
 */
function getShortcut(shortcutManager: IShortcutManager, command: string, args: any): string {
  let shortcut = shortcutManager.getSequences(command, args);
  if (shortcut && shortcut.length > 0) {
    return shortcut[0].map(s => s.replace(/\s/g, '-')).join(' ');
  }
  return '';
}


class CommandPaletteManager implements ICommandPalette {
  /**
   * Create a new `CommandPaletteManager`
   *
   * @param commandRegistry - An instance of a command registry.
   *
   * @param shortcutManager - An instance of a shortcut manager.
   */
  constructor(commandRegistry: ICommandRegistry, shortcutManager: IShortcutManager) {
    this._paletteModel = new StandardPaletteModel();
    this._commandPalette = new CommandPalette();
    this._commandPalette.model = this._paletteModel;
    this._commandRegistry = commandRegistry;
    this._shortcutManager = shortcutManager;

    shortcutManager.shortcutsAdded.connect(this._onShortcutsChanged, this);
    shortcutManager.shortcutsRemoved.connect(this._onShortcutsChanged, this);

    commandRegistry.add([
      {
        id: 'command-palette:focus-input',
        handler: () => {
          this._commandPalette.inputNode.focus();
          this._commandPalette.inputNode.select();
        }
      }
    ]);
  }

  /**
   * A signal emitted when a command is triggered by the palette.
   *
   * #### Note
   * The order in which the command executes and the signal emits is undefined.
   */
  get commandTriggered(): ISignal<CommandPaletteManager, { id: string, args: any }> {
    return CommandPaletteManagerPrivate.commandTriggeredSignal.bind(this);
  }

  /**
   * The underlying palette widget.
   */
  get widget(): Widget {
    return this._commandPalette;
  }

  /**
   * Add new command items to the palette.
   *
   * @param commands - An array of command IDs and arguments
   *
   * @returns An `IDisposable` to remove the added commands from the palette
   */
  add(items: { id: string, args: any, caption: string, category: string, text: string }[]): IDisposable {
    let modelOptions = items.map(item => {
      if (!this._commandRegistry.has(item.id)) {
        return null;
      }
      return {
        handler: this._commandHandler,
        args: { id: item.id, args: item.args },
        text: item.text,
        shortcut: getShortcut(this._shortcutManager, item.id, item.args),
        category: item.category,
        caption: item.caption
      } as IStandardPaletteItemOptions;
    }).filter(item => !!item);

    if (!modelOptions.length) {
      return;
    }

    // Keep a local reference to the set of items that are disposed together.
    let disposable = `palette-items-${++id}`;
    let additions = this._paletteModel.addItems(modelOptions).map(item => {
      return { disposable, item };
    });
    Array.prototype.push.apply(this._additions, additions);

    return new DisposableDelegate(() => {
      let rest = this._additions.filter(addition => {
        let keep = addition.disposable !== disposable;
        if (!keep) this._paletteModel.removeItem(addition.item);
        return keep;
      });
      if (rest.length === this._additions.length) {
        return;
      }
      this._additions = rest;
    });
  }

  /**
   * A handler for shortcut manager add and remove signals.
   *
   * @param sender - The shortcut manager triggering the signal.
   *
   * @param items - The list of shortcuts being added or removed.
   */
  private _onShortcutsChanged(sender: IShortcutManager, items: IShortcutItem[]): void {
    // Create a map of items for easily checking whether a command has changed.
    let changes = items.reduce((acc, item) => {
      if (acc[item.command]) {
        acc[item.command].push(item.args);
      } else {
        acc[item.command] = [item.args];
      }
      return acc;
    }, {} as { [command: string]: any[] });
    // Check if each added item is in the map and needs to be updated.
    for (let i = 0, n = this._additions.length; i < n; ++i) {
      let addition = this._additions[i];
      let command = addition.item.args.id;
      let args = addition.item.args.args;

      if (!(command in changes)) continue;
      if (changes[command].indexOf(args) === -1) continue;

      let removed = this._updateCommand(addition.item, i);

      // If the command was removed, change loop bounds.
      if (removed) {
        n -= 1;
        i -= 1;
      }
    }
  }

  /**
   * Update a palette item in the model and replace its internal cached version.
   *
   * @param item - The palette item to update.
   *
   * @param index - The local index in `_additions` where it is stored.
   *
   * @returns `true` if the item was removed.
   */
  private _updateCommand(item: StandardPaletteItem, index: number): boolean {
    let command = item.args.id;
    let args = item.args.args;

    if (!this._commandRegistry.has(command)) {
      this._paletteModel.removeItem(item);
      this._additions.splice(index, 1);
      return true;
    };

    let options: IStandardPaletteItemOptions = {
      handler: this._commandHandler,
      args: { id: command, args: args },
      text: item.text,
      shortcut: getShortcut(this._shortcutManager, command, args),
      category: item.category,
      caption: item.caption
    };

    this._paletteModel.removeItem(item);
    this._additions[index].item = this._paletteModel.addItem(options);
    return false;
  }

  private _commandHandler = (commandSpec: any) => {
    this.commandTriggered.emit(commandSpec);
    this._commandRegistry.execute(commandSpec.id, commandSpec.args);
  };

  private _additions: { disposable: string, item: StandardPaletteItem }[] = [];
  private _commandPalette: CommandPalette;
  private _commandRegistry: ICommandRegistry;
  private _paletteModel: StandardPaletteModel;
  private _shortcutManager: IShortcutManager;
}


/**
 * The namespace for the `CommandPaletteManager` class private data.
 */
namespace CommandPaletteManagerPrivate {
  /**
   * A signal emitted when a command is triggered by the palette.
   *
   * #### Note
   * The order in which the command executes and the signal emits is undefined.
   */
  export
  const commandTriggeredSignal = new Signal<CommandPaletteManager, { id: string, args: any }>();
}
