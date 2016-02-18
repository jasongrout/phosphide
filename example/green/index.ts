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
const greenExtension = {
  id: 'phosphide.example.green',
  activate: activateGreen
};


function createCommandItem(id: string, message: string) {
  return { id, handler: () => { console.log(`COMMAND: ${message}`); } };
}


function activateGreen(app: Application): Promise<void> {
  let widget = new Widget();
  widget.id = 'green';
  widget.title.text = 'Green';
  widget.addClass('green-content');

  let commandItems = [
    createCommandItem('green:show-0', 'Green is best!'),
    createCommandItem('green:show-1', 'Green number one'),
    createCommandItem('green:show-2', 'Green number two'),
    createCommandItem('green:show-3', 'Green number three'),
    createCommandItem('green:show-4', 'Green number four'),
    createCommandItem('green:show-5', 'Green number five')
  ];

  let paletteItems = [
    {
      command: 'green:show-0',
      text: 'Green 0',
      caption: 'Green is best!',
      category: 'All Colours'
    },
    {
      command: 'green:show-1',
      text: 'Green 1',
      caption: 'Green number one',
      category: 'Green'
    },
    {
      command: 'green:show-2',
      text: 'Green 2',
      caption: 'Green number two',
      category: 'Green'
    },
    {
      command: 'green:show-3',
      text: 'Green 3',
      caption: 'Green number three',
      category: 'Green'
    },
    {
      command: 'green:show-4',
      text: 'Green 4',
      caption: 'Green number four',
      category: 'Green'
    },
    {
      command: 'green:show-5',
      text: 'Green 5',
      caption: 'Green number five',
      category: 'Green'
    }
  ];

  let shortcutItems = [
    {
      sequence: ['Ctrl G'],
      selector: '*',
      command: 'green:show-0'
    }
  ];

  app.commands.add(commandItems);

  app.shortcuts.add(shortcutItems);

  app.palette.add(paletteItems);

  app.shell.addToRightArea(widget, { rank: 40 });

  return Promise.resolve<void>();
}
