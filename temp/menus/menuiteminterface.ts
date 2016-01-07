/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IMenuItemOptions, MenuItem
} from 'phosphor-menus';


/**
 * The interface required for declaring before/after constraints.
 */
export
interface IConstraints {
  /**
   * An array of strings defining the items which this item comes before.
   */
  before?: string[];
  /**
   * An array of strings defining the items which this item comes after.
   */
  after?: string[];
}


export type ConstraintsMap = { [id: string]: IConstraints };


/**
 * An interface describing attributes of a menu item.
 *
 * Menu items can be declared in an external JSON file, with the only
 * required fields being "location" and "command".
 */
export
interface ICommandMenuItem {
  /**
   * This is a menubar-specific array of strings to denote the location
   * in the menu hierarchy where this command should be placed.
   */
  location: string[];

  /**
   * The command that this menu item should invoke when called.
   */
  command: string;

  /**
   * The shortcut(s) for this specific command.
   */
  shortcut?: string;

  /**
   * Menu constraints are a list of items which denote the position of a
   * given menu item in each 1-D array.
   *
   * We will need to solve the menu order for any item with child items,
   * in order that the constraints can be defined for any level in the
   * hierarchy.
   */
  constraints?: ConstraintsMap;

  /**
   * Allows menu items to override the default text from the command
   * to be show shown in the menu.
   */
  titleOverride?: string;
}


/**
 * A menu item which takes a command name to be fired when selected.
 */
export
class CommandMenuItem extends MenuItem {
  /**
   * Construct a command menu item.
   */
  constructor(options?: any) {
    super(options as IMenuItemOptions);
    this._command = options.command;
    // TODO: set command invoker here.
  }

  private _command: string;
}
