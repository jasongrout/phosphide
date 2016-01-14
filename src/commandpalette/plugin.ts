/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Container, Token, IFactory
} from 'phosphor-di';

import {
  CommandPalette
} from './palette';

import {
  ICommandPalette
} from './index';

import {
  ICommandRegistry
} from '../commandregistry/index';


const paletteFactory = {
  requires: [ICommandRegistry] as Token<any>[],
  create: (commandRegistry: ICommandRegistry): ICommandPalette => {
    return new CommandPalette(commandRegistry);
  }
} as IFactory<ICommandPalette>;

/**
 * Register the plugin contributions.
 *
 * @param container - The di container for type registration.
 *
 * #### Notes
 * This is called automatically when the plugin is loaded.
 */
export
function register(container: Container): void {
  container.register(ICommandPalette, paletteFactory);
}
