/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IAppShell, ICommandPalette, ICommandRegistry
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

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): YellowHandler {
    return new YellowHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('yellow-content');
    widget.title.text = 'Yellow';
    this._shell.addToLeftArea(widget, { rank: 20 });
    let five = { id: 'demo:colors:yellow-5', command: createCommand() };
    five.command.setEnabled(false);
    this._registry.add([
      { id: 'demo:colors:yellow-0', command: createCommand() },
      { id: 'demo:colors:yellow-1', command: createCommand() },
      { id: 'demo:colors:yellow-2', command: createCommand() },
      { id: 'demo:colors:yellow-3', command: createCommand() },
      { id: 'demo:colors:yellow-4', command: createCommand() },
      five
    ]);
    this._palette.add([
      {
        text: 'All colors',
        items: [
          {
            id: 'demo:colors:yellow-0',
            title: 'Yellow',
            caption: 'Yellow is best!',
            args: 'Yellow is best!'
          }
        ]
      },
      {
        text: 'Yellow',
        items: [
          {
            id: 'demo:colors:yellow-1',
            title: 'Yellow #1',
            caption: 'Yellow number one',
            args: 'Yellow number one'
          },
          {
            id: 'demo:colors:yellow-2',
            title: 'Yellow #2',
            caption: 'Yellow number two',
            args: 'Yellow number two'
          },
          {
            id: 'demo:colors:yellow-3',
            title: 'Yellow #3',
            caption: 'Yellow number three',
            args: 'Yellow number three'
          },
          {
            id: 'demo:colors:yellow-4',
            title: 'Yellow #4',
            caption: 'Yellow number four',
            args: 'Yellow number four'
          },
          {
            id: 'demo:colors:yellow-5',
            title: 'Yellow #5',
            caption: 'Yellow number five',
            args: 'Yellow number five'
          }
        ]
      }
    ]);
  }

  private _commandDisposable: IDisposable;
  private _shell: IAppShell;
  private _palette: ICommandPalette;
  private _registry: ICommandRegistry;
}
