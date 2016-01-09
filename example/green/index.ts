/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IAppShell, ICommandPalette, ICommandRegistry, ICommandItem
} from 'phosphide';

import {
  DelegateCommand
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

function createCommand(id: string): ICommandItem {
  let command = new DelegateCommand((message: string) => {
    console.log(`COMMAND: ${message}`);
  });
  return { id, command };
}


class GreenHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): GreenHandler {
    return new GreenHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('green-content');
    widget.title.text = 'Green';
    this._shell.addToRightArea(widget, { rank: 40 });
    this._commandDisposable = this._registry.add([
      createCommand('demo:colors:green-0'),
      createCommand('demo:colors:green-1'),
      createCommand('demo:colors:green-2'),
      createCommand('demo:colors:green-3'),
      createCommand('demo:colors:green-4'),
      createCommand('demo:colors:green-5')
    ]);
    this._palette.add([
      {
        text: 'All colors',
        items: [
          {
            id: 'demo:colors:green-0',
            title: 'Green',
            caption: 'Green is best!',
            args: 'Green is best!'
          }
        ]
      },
      {
        text: 'Green',
        items: [
          {
            id: 'demo:colors:green-1',
            title: 'Green #1',
            caption: 'Green number one',
            args: 'Green is best!'
          },
          {
            id: 'demo:colors:green-2',
            title: 'Green #2',
            caption: 'Green number two',
            args: 'Green number two'
          },
          {
            id: 'demo:colors:green-3',
            title: 'Green #3',
            caption: 'Green number three',
            args: 'Green number three'
          },
          {
            id: 'demo:colors:green-4',
            title: 'Green #4',
            caption: 'Green number four',
            args: 'Green number four'
          },
          {
            id: 'demo:colors:green-5',
            title: 'Green #5',
            caption: 'Green number five',
            args: 'Green number five'
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
