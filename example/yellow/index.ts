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
  return container.resolve(YellowHandler).then(handler => { handler.run(); });
}


class YellowHandler {

  static requires = [IShellView];

  static create(shell: IShellView): YellowHandler {
    return new YellowHandler(shell);
  }

  constructor(shell: IShellView) {
    this._shell = shell;
  }

  run(): void {
    let view = new Widget();
    view.addClass('yellow-content');
    view.title.text = 'Yellow';
    this._shell.addLeftView(view);
  }

  private _shell: IShellView;
}
