/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IAppShell
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

  static requires = [IAppShell];

  static create(shell: IAppShell): BlueHandler {
    return new BlueHandler(shell);
  }

  constructor(shell: IAppShell) {
    this._shell = shell;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('blue-content');
    widget.title.text = 'Blue';
    this._shell.addToLeftArea(widget, { rank: 10 });
  }

  private _shell: IAppShell;
}
