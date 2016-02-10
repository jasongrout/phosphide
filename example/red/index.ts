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
  return container.resolve(RedHandler).then(handler => { handler.run(); });
}

function createHandler(): (args: any) => void {
  return (message: string) => { console.log(`COMMAND: ${message}`); };
}


class RedHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry, IShortcutManager];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager): RedHandler {
    return new RedHandler(shell, palette, registry, shortcuts);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry, shortcuts: IShortcutManager) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
    this._shortcuts = shortcuts;
  }

  run(): void {
    let widget = new Widget();
    widget.id = 'red';
    widget.addClass('red-content');
    widget.title.text = 'Red';
    this._shell.addToRightArea(widget, { rank: 30 });
    let registryItems = [
      { id: 'red:show-0', handler: createHandler() },
      { id: 'red:show-1', handler: createHandler() },
      { id: 'red:show-2', handler: createHandler() },
      { id: 'red:show-3', handler: createHandler() },
      { id: 'red:show-4', handler: createHandler() },
      { id: 'red:show-5', handler: createHandler() }
    ];
    let paletteItems = [
      {
        id: 'red:show-0',
        args: 'Red is best!',
        text: 'Red 0',
        caption: 'Red is best!',
        category: 'All Colours'
      },
      {
        id: 'red:show-1',
        args: 'Red number one',
        text: 'Red 1',
        caption: 'Red number one',
        category: 'Red'
      },
      {
        id: 'red:show-2',
        args: 'Red number two',
        text: 'Red 2',
        caption: 'Red number two',
        category: 'Red'
      },
      {
        id: 'red:show-3',
        args: 'Red number three',
        text: 'Red 3',
        caption: 'Red number three',
        category: 'Red'
      },
      {
        id: 'red:show-4',
        args: 'Red number four',
        text: 'Red 4',
        caption: 'Red number four',
        category: 'Red'
      },
      {
        id: 'red:show-5',
        args: 'Red number five',
        text: 'Red 5',
        caption: 'Red number five',
        category: 'Red'
      }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl R'],
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
