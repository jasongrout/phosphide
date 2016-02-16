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
  } else {
    return '';
  }
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
    let modelItems = items.map(item => {
      let commandExists = this._commandRegistry.has(item.id);
      if (!commandExists) return null;
      let options: IStandardPaletteItemOptions = {
        handler: this._commandHandler,
        args: { id: item.id, args: item.args },
        text: item.text,
        shortcut: getShortcut(this._shortcutManager, item.id, item.args),
        category: item.category,
        caption: item.caption
      };
      return options;
    }).filter(item => !!item);
    if (!modelItems.length) return;
    let group = `palette-items-${++id}`;
    this._addedGroups[group] = this._paletteModel.addItems(modelItems);
    return new DisposableDelegate(() => {
      if (this._addedGroups[group]) {
        this._paletteModel.removeItems(this._addedGroups[group]);
        delete this._addedGroups[group];
      }
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
    let modifiedGroups: { [group: string]: void } = Object.create(null);
    let changeMap = items.reduce((acc, item) => {
      if (acc[item.command]) {
        acc[item.command].push(item.args);
      } else {
        acc[item.command] = [item.args];
      }
      return acc;
    }, {} as { [command: string]: any[] });
    let flatGroups = Object.keys(this._addedGroups).reduce((acc, group) => {
      return acc.concat(this._addedGroups[group].map(item => {
        return { group, item };
      }));
    }, [] as { group: string, item: StandardPaletteItem }[]);
    for (let groupItem of flatGroups) {
      let command = (groupItem.item.args as { id: string, args: any }).id;
      if (!(command in changeMap)) continue;
      let args = (groupItem.item.args as { id: string, args: any }).args;
      if (changeMap[command].indexOf(args) === -1) continue;
      modifiedGroups[groupItem.group] = null;
    }
    Object.keys(modifiedGroups).forEach(group => { this._updateGroup(group); });
  }

  /**
   * Update a disposable palette item group when it is stale.
   *
   * @param group - The internal ID of the disposable palette item group.
   */
  private _updateGroup(group: string): void {
    let items = this._addedGroups[group];
    let modelItems = items.map(item => {
      let command = item.args.id;
      let args = item.args.args;
      let commandExists = this._commandRegistry.has(command);
      if (!commandExists) return null;
      let options: IStandardPaletteItemOptions = {
        handler: this._commandHandler,
        args: { id: command, args: args },
        text: item.text,
        shortcut: getShortcut(this._shortcutManager, command, args),
        category: item.category,
        caption: item.caption
      };
      return options;
    }).filter(item => !!item);
    this._paletteModel.removeItems(items);
    if (modelItems.length) {
      this._addedGroups[group] = this._paletteModel.addItems(modelItems);
    } else {
      delete this._addedGroups[group];
    }
  }

  private _commandHandler = (commandSpec: any) => {
    this.commandTriggered.emit(commandSpec);
    this._commandRegistry.execute(commandSpec.id, commandSpec.args);
  };

  private _addedGroups: {
    [group: string]: StandardPaletteItem[];
  } = Object.create(null);
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
