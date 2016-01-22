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
  SimpleCommand
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


function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
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
    let category = 'Blue';
    let registryItems = [
      { id: 'demo:colors:blue-0', command: createCommand() },
      { id: 'demo:colors:blue-1', command: createCommand() },
      { id: 'demo:colors:blue-2', command: createCommand() },
      { id: 'demo:colors:blue-3', command: createCommand() },
      { id: 'demo:colors:blue-4', command: createCommand() },
      { id: 'demo:colors:blue-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'demo:colors:blue-0', args: 'Blue is best!' },
      { id: 'demo:colors:blue-1', args: 'Blue number one' },
      { id: 'demo:colors:blue-2', args: 'Blue number two' },
      { id: 'demo:colors:blue-3', args: 'Blue number three' },
      { id: 'demo:colors:blue-4', args: 'Blue number four' },
      { id: 'demo:colors:blue-5', args: 'Blue number five' }
    ];
    registryItems.forEach((item, idx) => {
      let title = item.id.split(':').pop().split('-')
        .map(token => token[0].toLocaleUpperCase() + token.substr(1)).join(' ');
      item.command.setCategory(category);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Blue main');
    registryItems[0].command.setCategory('All colors');
    this._registry.add(registryItems);
    this._palette.add(paletteItems);
  }

  private _commandDisposable: IDisposable;
  private _shell: IAppShell;
  private _palette: ICommandPalette;
  private _registry: ICommandRegistry;
}
