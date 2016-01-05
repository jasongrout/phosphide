/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  DelegateCommand, ICommand
} from 'phosphor-command';

import {
Message
} from 'phosphor-messaging';

// import {
// BoxPanel
// } from 'phosphor-boxpanel';

import {
  Widget
} from 'phosphor-widget';

import {
  Panel
} from 'phosphor-panel';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  ICommandRegistry, ICommandItem
} from '../commandregistry/index';

import {
  Container, Token
} from 'phosphor-di';

import {
  CommandPalette
} from './palette';

import {
  IAppShell
} from '../appshell/index';


/**
 * Resolve the plugin contributions.
 *
 * @param container - The di container for type registration.
 *
 * #### Notes
 * This is automatically called when the plugin is loaded.
 */
 export
 function resolve(container: Container): Promise<void> {
   return container.resolve(CommandPaletteHandler).then(handler => {
     handler.run();
   });
 }

export
class CommandPaletteHandler {

  static requires = [IAppShell, ICommandRegistry];

  static create(shell: IAppShell): CommandPaletteHandler {
    return new CommandPaletteHandler(shell);
  }

  constructor(shell: IAppShell) {
    this._shell = shell;
  }

  run(): void {
    let palette = new CommandPalette();
    palette.title.text = 'Commands';
    palette.add([
      {
        text: 'Demo',
        items: [
          {id: 'demo:id:a', title: 'A', caption: 'ABCDqrs'},
          {id: 'demo:id:e', title: 'E', caption: 'EFGH'}
        ]
      },
      {
        text: 'Demo',
        items: [
          {id: 'demo:id:i', title: 'I', caption: 'IJKL'},
          {id: 'demo:id:m', title: 'M', caption: 'MNOP'}
        ]
      },
      {
        text: 'Omed',
        items: [
          {id: 'omed:id:q', title: 'Q', caption: 'QRSTabc'},
          {id: 'omed:id:u', title: 'U', caption: 'UVWXq'}
        ]
      }
    ]);
    this._shell.addToLeftArea(palette, { rank: 40 });
  }

  private _shell: IAppShell;
}
