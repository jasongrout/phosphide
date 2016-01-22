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
  return container.resolve(RedHandler).then(handler => { handler.run(); });
}

function createCommand(): SimpleCommand {
  return new SimpleCommand({
    handler: (message: string) => { console.log(`COMMAND: ${message}`); }
  });
}


class RedHandler {

  static requires = [IAppShell, ICommandPalette, ICommandRegistry];

  static create(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry): RedHandler {
    return new RedHandler(shell, palette, registry);
  }

  constructor(shell: IAppShell, palette: ICommandPalette, registry: ICommandRegistry) {
    this._shell = shell;
    this._palette = palette;
    this._registry = registry;
  }

  run(): void {
    let widget = new Widget();
    widget.addClass('red-content');
    widget.title.text = 'Red';
    this._shell.addToRightArea(widget, { rank: 30 });
    let category = 'Red';
    let registryItems = [
      { id: 'demo:colors:red-0', command: createCommand() },
      { id: 'demo:colors:red-1', command: createCommand() },
      { id: 'demo:colors:red-2', command: createCommand() },
      { id: 'demo:colors:red-3', command: createCommand() },
      { id: 'demo:colors:red-4', command: createCommand() },
      { id: 'demo:colors:red-5', command: createCommand() }
    ];
    let paletteItems = [
      { id: 'demo:colors:red-0', args: 'Red is best!' },
      { id: 'demo:colors:red-1', args: 'Red number one' },
      { id: 'demo:colors:red-2', args: 'Red number two' },
      { id: 'demo:colors:red-3', args: 'Red number three' },
      { id: 'demo:colors:red-4', args: 'Red number four' },
      { id: 'demo:colors:red-5', args: 'Red number five' }
    ];
    registryItems.forEach((item, idx) => {
      let title = item.id.split(':').pop().split('-')
        .map(token => token[0].toLocaleUpperCase() + token.substr(1)).join(' ');
      item.command.setCategory(category);
      item.command.setText(title);
      item.command.setCaption(paletteItems[idx].args);
    });
    registryItems[0].command.setText('Red main');
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
