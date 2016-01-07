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
  return container.resolve(GreenHandler).then(handler => { handler.run(); });
}


class GreenHandler {

  static requires = [IAppShell, ICommandPalette];

  static create(shell: IAppShell, palette: ICommandPalette): GreenHandler {
    return new GreenHandler(shell, palette);
  }

  constructor(shell: IAppShell, palette: ICommandPalette) {
    this._shell = shell;
    this._palette = palette;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('green-content');
    widget.title.text = 'Green';
    this._shell.addToRightArea(widget, { rank: 40 });
    this._palette.add([
      {
        text: 'All colors',
        items: [
          {
            id: 'demo:colors:green-0',
            title: 'Green',
            caption: 'Green is best!'
          }
        ]
      },
      {
        text: 'Green',
        items: [
          {
            id: 'demo:colors:green-1',
            title: 'Green #1',
            caption: 'Green number one'
          },
          {
            id: 'demo:colors:green-2',
            title: 'Green #2',
            caption: 'Green number two'
          },
          {
            id: 'demo:colors:green-3',
            title: 'Green #3',
            caption: 'Green number three'
          },
          {
            id: 'demo:colors:green-4',
            title: 'Green #4',
            caption: 'Green number four'
          },
          {
            id: 'demo:colors:green-5',
            title: 'Green #5',
            caption: 'Green number five'
          }
        ]
      }
    ]);
  }

  private _shell: IAppShell;
  private _palette: ICommandPalette;
}
