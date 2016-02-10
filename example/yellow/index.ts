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
  return container.resolve(YellowHandler).then(handler => { handler.run(); });
}

function createHandler(): (args: any) => void {
  return (message: string) => { console.log(`COMMAND: ${message}`); };
}


class YellowHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry, IShortcutManager];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager): YellowHandler {
    return new YellowHandler(shell, palette, registry, shortcuts);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
    this._shortcuts = shortcuts;
  }

  run(): void {
    let widget = new Widget();
    widget.id = 'yellow';
    widget.addClass('yellow-content');
    widget.title.text = 'Yellow';
    this._shell.addToLeftArea(widget, { rank: 20 });
    let registryItems = [
      { id: 'yellow:show-0', handler: createHandler() },
      { id: 'yellow:show-1', handler: createHandler() },
      { id: 'yellow:show-2', handler: createHandler() },
      { id: 'yellow:show-3', handler: createHandler() },
      { id: 'yellow:show-4', handler: createHandler() },
      { id: 'yellow:show-5', handler: createHandler() }
    ];
    let paletteItems = [
      {
        id: 'yellow:show-0',
        args: 'Yellow is best!',
        text: 'Yellow 0',
        caption: 'Yellow is best!',
        category: 'All Colours'
      },
      {
        id: 'yellow:show-1',
        args: 'Yellow number one',
        text: 'Yellow 1',
        caption: 'Yellow number one',
        category: 'Yellow'
      },
      {
        id: 'yellow:show-2',
        args: 'Yellow number two',
        text: 'Yellow 2',
        caption: 'Yellow number two',
        category: 'Yellow'
      },
      {
        id: 'yellow:show-3',
        args: 'Yellow number three',
        text: 'Yellow 3',
        caption: 'Yellow number three',
        category: 'Yellow'
      },
      {
        id: 'yellow:show-4',
        args: 'Yellow number four',
        text: 'Yellow 4',
        caption: 'Yellow number four',
        category: 'Yellow'
      },
      {
        id: 'yellow:show-5',
        args: 'Yellow number five',
        text: 'Yellow 5',
        caption: 'Yellow number five',
        category: 'Yellow'
      }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl Y'],
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
