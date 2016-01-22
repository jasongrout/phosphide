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

    let id = 'demo:colors:blue-0';
    let command = new SimpleCommand({
      handler: (message: string) => { console.log(`COMMAND: ${message}`); }
    });
    this._registry.add([{ id, command }]);

    this._shortcuts.add([
      {
        sequence: ['Ctrl B'],
        selector: '*',
        command: id,
        args: 'Blue is best!'
      }
    ]);

    this._palette.add([
      {
        text: 'All colors',
        items: [
          {
            id: 'demo:colors:blue-0',
            title: 'Blue',
            caption: 'Blue is best!',
            args: 'Blue is best!'
          }
        ]
      },
      {
        text: 'Blue',
        items: [
          {
            id: 'demo:colors:blue-foo',
            title: 'Blue #0',
            caption: 'Unregistered blue'
          },
          {
            id: 'demo:colors:blue-0',
            title: 'Blue #1',
            args: 'Blue number one'
          },
          {
            id: 'demo:colors:blue-0',
            title: 'Blue #2',
            caption: 'Blue number two',
            args: 'Blue number two'
          },
          {
            id: 'demo:colors:blue-0',
            title: 'Blue three is a very very very long title',
            caption: 'Blue number three has an extra long, long, long' +
              ' caption, too.',
            args: 'Blue number three'
          },
          {
            id: 'demo:colors:blue-0',
            title: 'Blue #4',
            caption: 'Blue number four',
            args: 'Blue number four'
          },
          {
            id: 'demo:colors:blue-0',
            title: 'Blue #5',
            caption: 'Blue number five',
            args: 'Blue number five'
          }
        ]
      }
    ]);
  }

  private _commandDisposable: IDisposable;
  private _shell: IAppShell;
  private _palette: ICommandPalette;
  private _registry: ICommandRegistry;
  private _shortcuts: IShortcutManager;
}
