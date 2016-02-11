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
  ISignal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';


/**
 * The public interface of the command palette.
 *
 * #### Notes
 * In addition to the public API, an `ICommandPalette` instance also needs to
 *   register the following commands:
 * 1. `'command-palette:focus-input'`, which takes no arguments and focuses the
 *   search bar.
 */
export
interface ICommandPalette {
  /**
   * A signal emitted when a command is triggered by the palette.
   *
   * #### Note
   * The order in which the command executes and the signal emits is undefined.
   */
  commandTriggered: ISignal<ICommandPalette, { id: string, args: any }>;

  /**
   * The underlying palette widget.
   */
  widget: Widget;

  /**
   * Add new command items to the palette.
   *
   * @param items - An array of command IDs and arguments
   *
   * @returns An `IDisposable` to remove the added commands from the palette
   */
  add(items: { id: string, args: any, caption: string, category: string, text: string }[]): IDisposable;
}


/**
 * The dependency token for the `ICommandPalette` interface.
 */
export
const ICommandPalette = new Token<ICommandPalette>('phosphide.ICommandPalette');
