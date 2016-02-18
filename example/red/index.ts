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
const redExtension = {
  id: 'phosphide.example.red',
  activate: activateRed
};


function createCommandItem(id: string, message: string) {
  return { id, handler: () => { console.log(`COMMAND: ${message}`); } };
}


function activateRed(app: Application): Promise<void> {
  let widget = new Widget();
  widget.id = 'red';
  widget.title.text = 'Red';
  widget.addClass('red-content');

  let commandItems = [
    createCommandItem('red:show-0', 'Red is best!'),
    createCommandItem('red:show-1', 'Red number one'),
    createCommandItem('red:show-2', 'Red number two'),
    createCommandItem('red:show-3', 'Red number three'),
    createCommandItem('red:show-4', 'Red number four'),
    createCommandItem('red:show-5', 'Red number five')
  ];

  let paletteItems = [
    {
      command: 'red:show-0',
      text: 'Red 0',
      caption: 'Red is best!',
      category: 'All Colours'
    },
    {
      command: 'red:show-1',
      text: 'Red 1',
      caption: 'Red number one',
      category: 'Red'
    },
    {
      command: 'red:show-2',
      text: 'Red 2',
      caption: 'Red number two',
      category: 'Red'
    },
    {
      command: 'red:show-3',
      text: 'Red 3',
      caption: 'Red number three',
      category: 'Red'
    },
    {
      command: 'red:show-4',
      text: 'Red 4',
      caption: 'Red number four',
      category: 'Red'
    },
    {
      command: 'red:show-5',
      text: 'Red 5',
      caption: 'Red number five',
      category: 'Red'
    }
  ];

  let shortcutItems = [
    {
      sequence: ['Ctrl R'],
      selector: '*',
      command: 'red:show-0'
    }
  ];

  app.commands.add(commandItems);

  app.shortcuts.add(shortcutItems);

  app.palette.add(paletteItems);

  app.shell.addToRightArea(widget, { rank: 30 });

  return Promise.resolve<void>();
}
