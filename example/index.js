/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

var phosphide = require('phosphide');
var di = require('phosphor-di');


phosphide.loadPlugins(new di.Container(), [
  require('phosphide/lib/shellview/plugin'),
  require('red/index'),
  require('blue/index'),
  require('green/index'),
  require('yellow/index'),
  require('editor/index')
]).then(function() {
  console.log('loading finished');
});
