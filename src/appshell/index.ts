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
  Widget
} from 'phosphor-widget';


/**
 * The options for adding a widget to a side area of the shell.
 */
export
interface ISideAreaOptions {
  /**
   * The rank order of the widget among its siblings.
   */
  rank?: number;
}


/**
 * The options for adding a widget to the main area of the shell.
 */
export
interface IMainAreaOptions { /* TODO */ }


/**
 * A widget which provides the main application layout.
 *
 * #### Notes
 * An application shell is the root widget in a Phosphide application.
 *
 * The shell is responsible for separating the UI into multiple areas
 * where plugins may contribute user-defined content widgets.
 */
export
interface IAppShell extends Widget {
  /**
   * Add a widget to the top content area.
   *
   * @param widget - The widget to add to the top content area.
   *
   * @param options - The configuration options for the widget.
   *
   * #### Notes
   * If the widget is already added to the area, it will be moved.
   *
   * The widget can be removed by setting its parent to `null`.
   */
  addToTopArea(widget: Widget, options?: ISideAreaOptions): void;

  /**
   * Add a widget to the left content area.
   *
   * @param widget - The widget to add to the left content area.
   *
   * @param options - The configuration options for the widget.
   *
   * #### Notes
   * If the widget is already added to the area, it will be moved.
   *
   * The widget can be removed by setting its parent to `null`.
   */
  addToLeftArea(widget: Widget, options?: ISideAreaOptions): void;

  /**
   * Add a widget to the right content area.
   *
   * @param widget - The widget to add to the right content area.
   *
   * @param options - The configuration options for the widget.
   *
   * #### Notes
   * If the widget is already added to the area, it will be moved.
   *
   * The widget can be removed by setting its parent to `null`.
   */
  addToRightArea(widget: Widget, options?: ISideAreaOptions): void;

  /**
   * Add a widget to the main content area.
   *
   * @param widget - The widget to add to the main content area.
   *
   * @param options - The configuration options for the widget.
   *
   * #### Notes
   * If the widget is already added to the area, it will be moved.
   *
   * The widget can be removed by setting its parent to `null`.
   */
  addToMainArea(widget: Widget, options?: IMainAreaOptions): void;
}


/**
 * The dependency token for the `IAppShell` interface.
 */
export
const IAppShell = new Token<IAppShell>('phosphide.IAppShell');
