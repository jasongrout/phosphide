/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IShellView
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

  static requires = [IShellView];

  static create(shell: IShellView): GreenHandler {
    return new GreenHandler(shell);
  }

  constructor(shell: IShellView) {
    this._shell = shell;
  }

  run(): void {
    let view = new Widget();
    view.addClass('green-content');
    view.title.text = 'Green';
    this._shell.addRightView(view);
  }

  private _shell: IShellView;
}
