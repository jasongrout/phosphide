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
  return container.resolve(RedHandler).then(handler => { handler.run(); });
}

function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
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
    widget.addClass('red-content');
    widget.title.text = 'Red';
    this._shell.addToRightArea(widget, { rank: 30 });
    let registryItems = [
      { id: 'red:show-0', command: createCommand() },
      { id: 'red:show-1', command: createCommand() },
      { id: 'red:show-2', command: createCommand() },
      { id: 'red:show-3', command: createCommand() },
      { id: 'red:show-4', command: createCommand() },
      { id: 'red:show-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'red:show-0', args: 'Red is best!' },
      { id: 'red:show-1', args: 'Red number one' },
      { id: 'red:show-2', args: 'Red number two' },
      { id: 'red:show-3', args: 'Red number three' },
      { id: 'red:show-4', args: 'Red number four' },
      { id: 'red:show-5', args: 'Red number five' }
    ];
    let shortcutItems = [
      {
        sequence: ['Ctrl R'],
        selector: '*',
        command: paletteItems[0].id,
        args: paletteItems[0].args
      }
    ];
    registryItems.forEach((item, idx) => {
      let title = `Red ${idx}`;
      item.command.setCategory(widget.title.text);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Red main');
    registryItems[0].command.setCategory('All colors');
    // Test disabled command.
    registryItems[2].command.setEnabled(false);
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
