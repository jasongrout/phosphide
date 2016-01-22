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
  return container.resolve(YellowHandler).then(handler => { handler.run(); });
}

function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
}


class YellowHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): YellowHandler {
    return new YellowHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('yellow-content');
    widget.title.text = 'Yellow';
    this._shell.addToLeftArea(widget, { rank: 20 });
    let category = 'Yellow';
    let registryItems = [
      { id: 'demo:colors:yellow-0', command: createCommand() },
      { id: 'demo:colors:yellow-1', command: createCommand() },
      { id: 'demo:colors:yellow-2', command: createCommand() },
      { id: 'demo:colors:yellow-3', command: createCommand() },
      { id: 'demo:colors:yellow-4', command: createCommand() },
      { id: 'demo:colors:yellow-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'demo:colors:yellow-0', args: 'Yellow is best!' },
      { id: 'demo:colors:yellow-1', args: 'Yellow number one' },
      { id: 'demo:colors:yellow-2', args: 'Yellow number two' },
      { id: 'demo:colors:yellow-3', args: 'Yellow number three' },
      { id: 'demo:colors:yellow-4', args: 'Yellow number four' },
      { id: 'demo:colors:yellow-5', args: 'Yellow number five' }
    ];
    registryItems.forEach((item, idx) => {
      let title = item.id.split(':').pop().split('-')
        .map(token => token[0].toLocaleUpperCase() + token.substr(1)).join(' ');
      item.command.setCategory(category);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Yellow main');
    registryItems[0].command.setCategory('All colors');
    // Test disabled command.
    registryItems[5].command.setEnabled(false);
    this._registry.add(registryItems);
    this._palette.add(paletteItems);
  }

  private _commandDisposable: IDisposable;
  private _shell: IAppShell;
  private _palette: ICommandPalette;
  private _registry: ICommandRegistry;
}
