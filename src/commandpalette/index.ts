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
 * A group of items that can added to a command palette with headings.
 */
export
interface ICommandPaletteSection {
  /**
   * The heading for the command section.
   */
  text: string;

  /**
   * The palette command items.
   */
  items: ICommandPaletteItem[];
}


/**
 * An object which can be added to a command palette section.
 */
export
interface ICommandPaletteItem {
  /**
   * The unique id for the command.
   */
  id: string;

  /**
   * The arguments the command will be called with.
   */
  args?: any;

  /**
   * The shortcut for the command.
   */
  shortcut?: string;

  /**
   * The title of the command.
   */
  title: string;

  /**
   * A descriptive caption for the command.
   */
  caption?: string;
}


/**
 * The public interface of the command palette.
 */
export
interface ICommandPalette extends Widget {
  /**
   * Add new sections with heading titles and command items to the palette.
   *
   * @param sections - An array of sections to be added to the palette
   *
   * @returns An `IDisposable` to remove the added items from the palette
   */
  add(sections: ICommandPaletteSection[]): IDisposable;
  /**
   * Search for a specific query string among command titles and captions.
   *
   * @param query - The query string
   */
  search(query: string): void;
}


/**
 * The dependency token for the `ICommandPalette` interface.
 */
export
const ICommandPalette = new Token<ICommandPalette>('phosphide.ICommandPalette');
