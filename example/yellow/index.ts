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
const yellowExtension = {
  id: 'phosphide.example.yellow',
  activate: activateYellow
};


function createCommandItem(id: string, message: string) {
  return { id, handler: () => { console.log(`COMMAND: ${message}`); } };
}


function activateYellow(app: Application): Promise<void> {
  let widget = new Widget();
  widget.id = 'yellow';
  widget.title.text = 'Yellow';
  widget.addClass('yellow-content');

  let commandItems = [
    createCommandItem('yellow:show-0', 'Yellow is best!'),
    createCommandItem('yellow:show-1', 'Yellow number one'),
    createCommandItem('yellow:show-2', 'Yellow number two'),
    createCommandItem('yellow:show-3', 'Yellow number three'),
    createCommandItem('yellow:show-4', 'Yellow number four'),
    createCommandItem('yellow:show-5', 'Yellow number five')
  ];

  let paletteItems = [
    {
      command: 'yellow:show-0',
      text: 'Yellow 0',
      caption: 'Yellow is best!',
      category: 'All Colours'
    },
    {
      command: 'yellow:show-1',
      text: 'Yellow 1',
      caption: 'Yellow number one',
      category: 'Yellow'
    },
    {
      command: 'yellow:show-2',
      text: 'Yellow 2',
      caption: 'Yellow number two',
      category: 'Yellow'
    },
    {
      command: 'yellow:show-3',
      text: 'Yellow 3',
      caption: 'Yellow number three',
      category: 'Yellow'
    },
    {
      command: 'yellow:show-4',
      text: 'Yellow 4',
      caption: 'Yellow number four',
      category: 'Yellow'
    },
    {
      command: 'yellow:show-5',
      text: 'Yellow 5',
      caption: 'Yellow number five',
      category: 'Yellow'
    }
  ];

  let shortcutItems = [
    {
      sequence: ['Ctrl Y'],
      selector: '*',
      command: 'yellow:show-0'
    }
  ];

  app.commands.add(commandItems);

  app.shortcuts.add(shortcutItems);

  app.palette.add(paletteItems);

  app.shell.addToLeftArea(widget, { rank: 20 });

  return Promise.resolve<void>();
}
