/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

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
  ICommandPalette
} from './index';

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

/**
 * Register the plugin contributions.
 *
 * @param container - The di container for type registration.
 *
 * #### Notes
 * This is called automatically when the plugin is loaded.
 */
export
function register(container: Container): void {
  container.register(ICommandPalette, CommandPalette);
}

class CommandPaletteHandler {

  static requires = [IAppShell, ICommandRegistry, ICommandPalette];

  static create(shell: IAppShell, commands: ICommandRegistry, palette: CommandPalette): CommandPaletteHandler {
    return new CommandPaletteHandler(shell, commands, palette);
  }

  constructor(shell: IAppShell, commands: ICommandRegistry, palette: CommandPalette) {
    this._shell = shell;
    this._palette = palette;
    this._palette.title.text = 'Commands';
  }

  run(): void {
    this._shell.addToLeftArea(this._palette as CommandPalette, { rank: 40 });
  }

  private _shell: IAppShell;
  private _palette: ICommandPalette;
}
