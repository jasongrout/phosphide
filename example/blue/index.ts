/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IAppShell, ICommandPalette
} from 'phosphide';

import {
  Container
} from 'phosphor-di';

import {
  Widget
} from 'phosphor-widget';


export
function resolve(container: Container): Promise<void> {
  return container.resolve(BlueHandler).then(handler => { handler.run(); });
}


class BlueHandler {

  static requires = [IAppShell, ICommandPalette];

  static create(shell: IAppShell, palette: ICommandPalette): BlueHandler {
    return new BlueHandler(shell, palette);
  }

  constructor(shell: IAppShell, palette: ICommandPalette) {
    this._shell = shell;
    this._palette = palette;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('blue-content');
    widget.title.text = 'Blue';
    this._shell.addToLeftArea(widget, { rank: 10 });
    this._palette.add([
      {
        text: 'Colors',
        items: [
          {
            id: 'demo:colors:blue-0',
            title: 'Blue',
            caption: 'Blue is best!'
          }
        ]
      },
      {
        text: 'Blue',
        items: [
          {
            id: 'demo:colors:blue-1',
            title: 'Blue #1',
            caption: 'Blue number one'
          },
          {
            id: 'demo:colors:blue-2',
            title: 'Blue #2',
            caption: 'Blue number two'
          },
          {
            id: 'demo:colors:blue-3',
            title: 'Blue #3',
            caption: 'Blue number three'
          },
          {
            id: 'demo:colors:blue-4',
            title: 'Blue #4',
            caption: 'Blue number four'
          },
          {
            id: 'demo:colors:blue-5',
            title: 'Blue #5',
            caption: 'Blue number five'
          }
        ]
      }
    ]);
  }

  private _shell: IAppShell;
  private _palette: ICommandPalette;
}
