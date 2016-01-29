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
  CommandItem, ICommandItemOptions
} from 'phosphor-command';

import {
  CommandPalette
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
  ICommandRegistry
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
    this._commandPalette = new CommandPalette();
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
  add(items: { id: string, args: any }[]): IDisposable {
    let commandItems = items.map(item => {
      let command = this._commandRegistry.get(item.id);
      if (!command) return null;
      let options: ICommandItemOptions = { command: command };
      let shortcut = this._shortcutManager.getSequences(item.id, item.args);
      if (shortcut && shortcut.length > 0) {
        options.shortcut = shortcut[0]
          .map(s => s.replace(/\s/g, '-')).join(' ');
      }
      return new CommandItem(options);
    }).filter(item => !!item);
    if (!commandItems.length) return;
    this._commandPalette.add(commandItems);
    return new DisposableDelegate(() => {
      this._commandPalette.remove(commandItems);
    });
  }
  /**
   * Search for a specific query string among command titles and captions.
   *
   * @param query - The query string
   */
  search(query: string): void {
    this._commandPalette.search(query);
  }

  private _commandPalette: CommandPalette;
  private _commandRegistry: ICommandRegistry;
  private _shortcutManager: IShortcutManager;
}
