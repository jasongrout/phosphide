/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Token
} from 'phosphor-di';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  Widget
} from 'phosphor-widget';


/**
 * The public interface of the command palette.
 */
export
interface ICommandPalette {
  /**
   * Add new command items to the palette.
   *
   * @param commands - An array of command IDs and arguments
   *
   * @returns An `IDisposable` to remove the added commands from the palette
   */
  add(commands: { id: string, args: any }[]): IDisposable;
  /**
   * The underlying palette widget.
   */
  widget: Widget;
}


/**
 * The dependency token for the `ICommandPalette` interface.
 */
export
const ICommandPalette = new Token<ICommandPalette>('phosphide.ICommandPalette');
