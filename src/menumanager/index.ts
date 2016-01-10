/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
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
  MenuItem
} from 'phosphor-menus';


/**
 * An object which specifies a menu item for a menu manager.
 */
export
interface IMenuItemSpec {
  /**
   * The type of the item: `'normal'`, `'check'`, or `'separator'`.
   *
   * The type is ignored for menu items with a submenu.
   */
  type?: string;

  /**
   * The display text for the menu item.
   *
   * The text is ignored for separator items.
   */
  text?: string;

  /**
   * The class name to add to the menu item's icon node.
   *
   * The icon is ignored for separators and items with a submenu.
   */
  icon?: string;

  /**
   * The class name to add to the menu item's node.
   *
   * The class name is ignored for separators and items with a submenu.
   */
  className?: string;

  /**
   * The id of the command to execute for the item.
   *
   * The command is ignored for separators and items with a submenu.
   */
  command?: string;

  /**
   * The arguments to pass to the command.
   *
   * The args are ignored for separators and items with a submenu.
   */
  commandArgs?: any;

  /**
   * The submenu items for the menu item.
   *
   * These items will be merged with other items on the same path.
   */
  submenu?: IMenuItemSpec[];

  /**
   * The item(s) before which this item should be placed in the menu.
   *
   * The sibling items are referenced using their display `text`.
   */
  rank?: number;
}


/**
 * An object which manages menu item contributions.
 *
 * The menu manager accepts menu item definitions from multiple sources
 * and merges them into a single hiearchy of concrete menu items which
 * can be used in menu bars and context menus.
 */
export
interface IMenuManager {
  /**
   * A signal emitted when the primary menu items have changed.
   */
  menuItemsChanged: ISignal<IMenuManager, void>;

  /**
   * Add primary menu items to the menu manager.
   */
  addMenuItems(items: IMenuItemSpec[]): IDisposable;

  /**
   * Add context menu items to the menu manager.
   */
  addContextItems(selector: string, items: IMenuItemSpec[]): IDisposable;

  /**
   * Resolve and merge the primary menu items.
   */
  resolveMenuItems(): MenuItem[];

  /**
   * Resolve and merge the matching context menu items.
   */
  resolveContextItems(node: HTMLElement): MenuItem[];
}


/**
 * The dependency token for the `IMenuManager` interface.
 */
export
const IMenuManager = new Token<IMenuManager>('phosphide.IMenuManager');
