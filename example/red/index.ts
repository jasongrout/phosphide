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
  return container.resolve(RedHandler).then(handler => { handler.run(); });
}


class RedHandler {

  static requires = [IAppShell, ICommandPalette];

  static create(shell: IAppShell, palette: ICommandPalette): RedHandler {
    return new RedHandler(shell, palette);
  }

  constructor(shell: IAppShell, palette: ICommandPalette) {
    this._shell = shell;
    this._palette = palette;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('red-content');
    widget.title.text = 'Red';
    this._shell.addToRightArea(widget, { rank: 30 });
    this._palette.add([
      {
        text: 'Colors',
        items: [
          {
            id: 'demo:colors:red-1',
            title: 'Red 5',
            caption: 'Red number five'
          }
        ]
      }
    ]);
  }

  private _shell: IAppShell;
  private _palette: ICommandPalette;
}
