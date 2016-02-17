/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  ABCCommandRegistry
} from './commandregistry';

import {
  ABCShortcutRegistry
} from './shortcutregistry';


/**
 *
 */
export
abstract class ABCPaletteRegistry {

}


/**
 *
 */
export
class PaletteRegistry extends ABCPaletteRegistry {
  /**
   *
   */
  constructor(commands: ABCCommandRegistry, shortcuts: ABCShortcutRegistry) {
    super();
    this._commands = commands;
    this._shortcuts = shortcuts;
  }

  private _commands: ABCCommandRegistry;
  private _shortcuts: ABCShortcutRegistry;
}


/**
 * The default palette registry service provider.
 */
export
const paletteRegistryProvider = {
  id: 'phosphide.services.paletteRegistry',
  provides: ABCPaletteRegistry,
  requires: [ABCCommandRegistry, ABCShortcutRegistry],
  resolve: (commands: ABCCommandRegistry, shortcuts: ABCShortcutRegistry) => {
    return new PaletteRegistry(commands, shortcuts);
  },
};


/**
 *
 */
namespace Private {

}
