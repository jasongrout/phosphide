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
  return container.resolve(YellowHandler).then(handler => { handler.run(); });
}

function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
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
    widget.addClass('yellow-content');
    widget.title.text = 'Yellow';
    this._shell.addToLeftArea(widget, { rank: 20 });
    let registryItems = [
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-0`,
        command: createCommand()
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-1`,
        command: createCommand()
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-2`,
        command: createCommand()
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-3`,
        command: createCommand()
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-4`,
        command: createCommand()
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-5`,
        command: createCommand()
      }
    ];
    let paletteItems = [
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-0`,
        args: `${widget.title.text} is best!`
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-1`,
        args: `${widget.title.text} number one`
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-2`,
        args: `${widget.title.text} number two`
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-3`,
        args: `${widget.title.text} number three`
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-4`,
        args: `${widget.title.text} number four`
      },
      {
        id: `demo:colors:${widget.title.text.toLowerCase()}-5`,
        args: `${widget.title.text} number five`
      }
    ];
    let shortcutItems = [
      {
        sequence: [`Ctrl ${widget.title.text[0]}`],
        selector: '*',
        command: paletteItems[0].id,
        args: paletteItems[0].args
      }
    ];
    registryItems.forEach((item, idx) => {
      let title = `${widget.title.text} ${idx}`;
      item.command.setCategory(widget.title.text);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText(`${widget.title.text} main`);
    registryItems[0].command.setCategory('All colors');
    // Test disabled command.
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
