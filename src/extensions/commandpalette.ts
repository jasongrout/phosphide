/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  CommandPalette
} from 'phosphor-commandpalette';

import {
  Application
} from '../core/application';

import {
  ABCCommandRegistry
} from '../services/commandregistry';

import {
  ABCPaletteRegistry
} from '../services/paletteregistry';


/**
 * The default commmand palette extension.
 */
export
const commandPaletteExtension = {
  name: 'phosphide.extensions.commandPalette',
  requires: [ABCCommandRegistry, ABCPaletteRegistry],
  activate: activateCommandPalette
};


/**
 *
 */
function activateCommandPalette(app: Application, commands: ABCCommandRegistry, palette: ABCPaletteRegistry): Promise<void> {
  let widget = new CommandPalette();
  widget.title.text = 'Commands';
  widget.model = palette.model;
  widget.id = 'command-palette';

  commands.add([
    { id: 'command-palette:activate', handler: activatePalette }
  ]);

  palette.commandTriggered.connect(hidePalette);

  app.shell.addToLeftArea(widget);

  return Promise.resolve<void>();

  function activatePalette(): void {
    app.shell.activateLeft(widget.id);
    widget.inputNode.focus();
    widget.inputNode.select();
  }

  function hidePalette(): void {
    if (!widget.isHidden) app.shell.collapseLeft();
  }
}
