/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

var phosphide = require('phosphide/lib/core/application');

var app = new phosphide.Application({
  extensions: [
    require('phosphide/lib/extensions/commandpalette').commandPaletteExtension,
    require('blue/index').blueExtension,
    require('green/index').greenExtension,
    require('red/index').redExtension,
    require('yellow/index').yellowExtension,
    require('editor/index').editorExtension
  ]
});

app.run().then(() => {

  app.shortcuts.add([
    {
      command: 'command-palette:activate',
      sequence: ['Accel Shift P'],
      selector: '*'
    },
    {
      command: 'command-palette:hide',
      sequence: ['Escape'],
      selector: '[data-left-area="command-palette"]'
    }
  ]);

});
