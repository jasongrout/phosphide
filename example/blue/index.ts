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
  return container.resolve(BlueHandler).then(handler => { handler.run(); });
}


function createHandler(): (args: any) => void {
  return (message: string) => { console.log(`COMMAND: ${message}`); };
}


class BlueHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry, IShortcutManager];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager): BlueHandler {
    return new BlueHandler(shell, palette, registry, shortcuts);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
    this._shortcuts = shortcuts;
  }

  run(): void {
    let widget = new Widget();
    widget.id = 'blue';
    widget.addClass('blue-content');
    widget.title.text = 'Blue';
    this._shell.addToLeftArea(widget, { rank: 10 });
    let registryItems = [
      { id: 'blue:show-0', handler: createHandler() },
      { id: 'blue:show-1', handler: createHandler() },
      { id: 'blue:show-2', handler: createHandler() },
      { id: 'blue:show-3', handler: createHandler() },
      { id: 'blue:show-4', handler: createHandler() },
      { id: 'blue:show-5', handler: createHandler() }
    ];
    let paletteItems = [
      {
        id: 'blue:show-0',
        args: 'Blue is best!',
        text: 'Blue 0',
        caption: 'Blue is best!',
        category: 'All Colours'
      },
      {
        id: 'blue:show-1',
        args: 'Blue number one',
        text: 'Blue 1',
        caption: 'Blue number one',
        category: 'Blue'
      },
      {
        id: 'blue:show-2',
        args: 'Blue number two',
        text: 'Blue 2',
        caption: 'Blue number two',
        category: 'Blue'
      },
      {
        id: 'blue:show-3',
        args: 'Blue number three',
        text: 'Blue 3',
        caption: 'Blue number three',
        category: 'Blue'
      },
      {
        id: 'blue:show-4',
        args: 'Blue number four',
        text: 'Blue 4',
        caption: 'Blue number four',
        category: 'Blue'
      },
      {
        id: 'blue:show-5',
        args: 'Blue number five',
        text: 'Blue 5',
        caption: 'Blue number five',
        category: 'Blue'
      }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl B'],
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
