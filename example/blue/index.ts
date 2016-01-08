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
  return container.resolve(BlueHandler).then(handler => { handler.run(); });
}

function createCommand(id: string): ICommandItem {
  let command = new DelegateCommand((message: string) => {
    console.log(`COMMAND: ${message}`);
  });
  return { id, command };
}


class BlueHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): BlueHandler {
    return new BlueHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('blue-content');
    widget.title.text = 'Blue';
    this._shell.addToLeftArea(widget, { rank: 10 });
    this._commandDisposable = this._registry.add([
      createCommand('demo:colors:blue-0')
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
            id: 'demo:colors:blue-0',
            title: 'Blue #1',
            caption: 'Blue number one',
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
            title: 'Blue #3',
            caption: 'Blue number three',
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
}
