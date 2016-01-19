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

function createCommand(): (args: any) => void {
  return (message: string) => {
    console.log(`COMMAND: ${message}`);
  };
}


class RedHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): RedHandler {
    return new RedHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('red-content');
    widget.title.text = 'Red';
    this._shell.addToRightArea(widget, { rank: 30 });
    this._registry.add('demo:colors:red-0', createCommand());
    this._registry.add('demo:colors:red-1', createCommand());
    this._registry.add('demo:colors:red-2', createCommand());
    this._registry.add('demo:colors:red-3', createCommand());
    this._registry.add('demo:colors:red-4', createCommand());
    this._registry.add('demo:colors:red-5', createCommand());

    this._palette.add([
      {
        text: 'All colors',
        items: [
          {
            id: 'demo:colors:red-0',
            title: 'Red',
            caption: 'Red is best!',
            args: 'Red is best!'
          }
        ]
      },
      {
        text: 'Red',
        items: [
          {
            id: 'demo:colors:red-1',
            title: 'Red #1',
            caption: 'Red number one',
            args: 'Red number one'
          },
          {
            id: 'demo:colors:red-2',
            title: 'Red #2',
            caption: 'Red number two',
            args: 'Red number two'
          },
          {
            id: 'demo:colors:red-3',
            title: 'Red #3',
            caption: 'Red number three',
            args: 'Red number three'
          },
          {
            id: 'demo:colors:red-4',
            title: 'Red #4',
            caption: 'Red number four',
            args: 'Red number four'
          },
          {
            id: 'demo:colors:red-5',
            title: 'Red #5',
            caption: 'Red number five',
            args: 'Red number five'
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
