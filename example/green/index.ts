/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IAppShell, ICommandPalette, ICommandRegistry, IShortcutManager
} from 'phosphide';

import {
  Container
} from 'phosphor-di';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  Widget
} from 'phosphor-widget';


export
function resolve(container: Container): Promise<void> {
  return container.resolve(GreenHandler).then(handler => { handler.run(); });
}


function createHandler(): (args: any) => void {
  return (message: string) => { console.log(`COMMAND: ${message}`); }
}


class GreenHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry, IShortcutManager];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager): GreenHandler {
    return new GreenHandler(shell, palette, registry, shortcuts);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
    this._shortcuts = shortcuts;
  }

  run(): void {
    let widget = new Widget();
    widget.id = 'green';
    widget.addClass('green-content');
    widget.title.text = 'Green';
    this._shell.addToRightArea(widget, { rank: 40 });
    let registryItems = [
      { id: 'green:show-0', handler: createHandler() },
      { id: 'green:show-1', handler: createHandler() },
      { id: 'green:show-2', handler: createHandler() },
      { id: 'green:show-3', handler: createHandler() },
      { id: 'green:show-4', handler: createHandler() },
      { id: 'green:show-5', handler: createHandler() }
    ];
    let paletteItems = [
      {
        id: 'green:show-0',
        args: 'Green is best!',
        text: 'Green 0',
        caption: 'Green is best!',
        category: 'All Colours'
      },
      {
        id: 'green:show-1',
        args: 'Green number one',
        text: 'Green 1',
        caption: 'Green number one',
        category: 'Green'
      },
      {
        id: 'green:show-2',
        args: 'Green number two',
        text: 'Green 2',
        caption: 'Green number two',
        category: 'Green'
      },
      {
        id: 'green:show-3',
        args: 'Green number three',
        text: 'Green 3',
        caption: 'Green number three',
        category: 'Green'
      },
      {
        id: 'green:show-4',
        args: 'Green number four',
        text: 'Green 4',
        caption: 'Green number four',
        category: 'Green' },
      {
        id: 'green:show-5',
        args: 'Green number five',
        text: 'Green 5',
        caption: 'Green number five',
        category: 'Green'
      }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl G'],
        selector: '*',
        command: paletteItems[0].id,
        args: paletteItems[0].args
      }
    ];
    // Add commands to registry.
    this._registry.add(registryItems);
    // Add shortcuts to shortcut manager.
    this._shortcuts.add(shortcutItems);
    // Add commands to palette.
    this._palette.add(paletteItems);
  }

  private _commandDisposable: IDisposable;
  private _shell: IAppShell;
  private _palette: ICommandPalette;
  private _registry: ICommandRegistry;
  private _shortcuts: IShortcutManager;
}
