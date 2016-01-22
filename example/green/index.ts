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
  return container.resolve(GreenHandler).then(handler => { handler.run(); });
}

function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
}


class GreenHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): GreenHandler {
    return new GreenHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('green-content');
    widget.title.text = 'Green';
    this._shell.addToRightArea(widget, { rank: 40 });
    let category = 'Green';
    let registryItems = [
      { id: 'demo:colors:green-0', command: createCommand() },
      { id: 'demo:colors:green-1', command: createCommand() },
      { id: 'demo:colors:green-2', command: createCommand() },
      { id: 'demo:colors:green-3', command: createCommand() },
      { id: 'demo:colors:green-4', command: createCommand() },
      { id: 'demo:colors:green-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'demo:colors:green-0', args: 'Green is best!' },
      { id: 'demo:colors:green-1', args: 'Green number one' },
      { id: 'demo:colors:green-2', args: 'Green number two' },
      { id: 'demo:colors:green-3', args: 'Green number three' },
      { id: 'demo:colors:green-4', args: 'Green number four' },
      { id: 'demo:colors:green-5', args: 'Green number five' }
    ];
    registryItems.forEach((item, idx) => {
      let title = item.id.split(':').pop().split('-')
        .map(token => token[0].toLocaleUpperCase() + token.substr(1)).join(' ');
      item.command.setCategory(category);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Green main');
    registryItems[0].command.setCategory('All colors');
    // Test blank command text
    registryItems[2].command.setText('');
    registryItems[3].command.setText('');
    this._registry.add(registryItems);
    this._palette.add(paletteItems);
  }

  private _commandDisposable: IDisposable;
  private _shell: IAppShell;
  private _palette: ICommandPalette;
  private _registry: ICommandRegistry;
}
