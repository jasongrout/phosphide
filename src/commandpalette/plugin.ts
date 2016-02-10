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
  CommandPalette, IStandardPaletteItemOptions, StandardPaletteModel
} from 'phosphor-commandpalette';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

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
  IShortcutManager
} from '../shortcutmanager/index';


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


class CommandPaletteManager implements ICommandPalette {
  /**
   * The underlying palette widget.
   */
  get widget(): Widget {
    return this._commandPalette;
  }

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
        handler: (args: any) => {
          this._commandRegistry.execute(item.id, args);
        },
        args: item.args,
        text: item.text,
        shortcut: '',
        category: item.category,
        caption: item.caption };
      let shortcut = this._shortcutManager.getSequences(item.id, item.args);
      if (shortcut && shortcut.length > 0) {
        options.shortcut = shortcut[0]
          .map(s => s.replace(/\s/g, '-')).join(' ');
      }
      return options;
    }).filter(item => !!item);
    if (!modelItems.length) return;
    let paletteItems = this._paletteModel.addItems(modelItems);
    return new DisposableDelegate(() => {
      this._paletteModel.removeItems(paletteItems);
    });
  }

  private _paletteModel: StandardPaletteModel;
  private _commandPalette: CommandPalette;
  private _commandRegistry: ICommandRegistry;
  private _shortcutManager: IShortcutManager;
}
