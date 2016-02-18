/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Application
} from 'phosphide/lib/core/application';

import {
  Widget
} from 'phosphor-widget';


export
const blueExtension = {
  id: 'phosphide.example.blue',
  activate: activateBlue
};


function createCommandItem(id: string, message: string) {
  return { id, handler: () => { console.log(`COMMAND: ${message}`); } };
}


function activateBlue(app: Application): Promise<void> {
  let widget = new Widget();
  widget.id = 'blue';
  widget.title.text = 'Blue';
  widget.addClass('blue-content');

  let commandItems = [
    createCommandItem('blue:show-0', 'Blue is best!'),
    createCommandItem('blue:show-1', 'Blue number one'),
    createCommandItem('blue:show-2', 'Blue number two'),
    createCommandItem('blue:show-3', 'Blue number three'),
    createCommandItem('blue:show-4', 'Blue number four'),
    createCommandItem('blue:show-5', 'Blue number five')
  ];

  let paletteItems = [
    {
      command: 'blue:show-0',
      text: 'Blue 0',
      caption: 'Blue is best!',
      category: 'All Colours'
    },
    {
      command: 'blue:show-1',
      text: 'Blue 1',
      caption: 'Blue number one',
      category: 'Blue'
    },
    {
      command: 'blue:show-2',
      text: 'Blue 2',
      caption: 'Blue number two',
      category: 'Blue'
    },
    {
      command: 'blue:show-3',
      text: 'Blue 3',
      caption: 'Blue number three',
      category: 'Blue'
    },
    {
      command: 'blue:show-4',
      text: 'Blue 4',
      caption: 'Blue number four',
      category: 'Blue'
    },
    {
      command: 'blue:show-5',
      text: 'Blue 5',
      caption: 'Blue number five',
      category: 'Blue'
    }
  ];

  let shortcutItems = [
    {
      sequence: ['Ctrl B'],
      selector: '*',
      command: 'blue:show-0'
    }
  ];

  app.commands.add(commandItems);

  app.shortcuts.add(shortcutItems);

  app.palette.add(paletteItems);

  app.shell.addToLeftArea(widget, { rank: 10 });

  return Promise.resolve<void>();
}
