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
  SimpleCommand
} from 'phosphor-command';

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


function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
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
    widget.addClass('blue-content');
    widget.title.text = 'Blue';
    this._shell.addToLeftArea(widget, { rank: 10 });
    let registryItems = [
      { id: 'blue:show-0', command: createCommand() },
      { id: 'blue:show-1', command: createCommand() },
      { id: 'blue:show-2', command: createCommand() },
      { id: 'blue:show-3', command: createCommand() },
      { id: 'blue:show-4', command: createCommand() },
      { id: 'blue:show-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'blue:show-0', args: 'Blue is best!' },
      { id: 'blue:show-1', args: 'Blue number one' },
      { id: 'blue:show-2', args: 'Blue number two' },
      { id: 'blue:show-3', args: 'Blue number three' },
      { id: 'blue:show-4', args: 'Blue number four' },
      { id: 'blue:show-5', args: 'Blue number five' }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl B'],
        selector: '*',
        command: paletteItems[0].id,
        args: paletteItems[0].args
      }
    ];
    registryItems.forEach((item, idx) => {
      let title = `Blue ${idx}`;
      item.command.setCategory(widget.title.text);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Blue main');
    registryItems[0].command.setCategory('All colors');
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
