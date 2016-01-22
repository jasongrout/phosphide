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
  return container.resolve(GreenHandler).then(handler => { handler.run(); });
}


function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
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
    widget.addClass('green-content');
    widget.title.text = 'Green';
    this._shell.addToRightArea(widget, { rank: 40 });
    let registryItems = [
      { id: 'green:show-0', command: createCommand() },
      { id: 'green:show-1', command: createCommand() },
      { id: 'green:show-2', command: createCommand() },
      { id: 'green:show-3', command: createCommand() },
      { id: 'green:show-4', command: createCommand() },
      { id: 'green:show-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'green:show-0', args: 'Green is best!' },
      { id: 'green:show-1', args: 'Green number one' },
      { id: 'green:show-2', args: 'Green number two' },
      { id: 'green:show-3', args: 'Green number three' },
      { id: 'green:show-4', args: 'Green number four' },
      { id: 'green:show-5', args: 'Green number five' }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl G'],
        selector: '*',
        command: paletteItems[0].id,
        args: paletteItems[0].args
      }
    ];
    registryItems.forEach((item, idx) => {
      let title = `Green ${idx}`;
      item.command.setCategory(widget.title.text);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Green main');
    registryItems[0].command.setCategory('All colors');
    // Test disabled commands.
    registryItems[1].command.setEnabled(false);
    registryItems[5].command.setEnabled(false);
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
