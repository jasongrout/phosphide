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
 * The options for adding widgets to the side areas of the shell.
 */
export
interface ISideAreaOptions {
  /**
   * The rank value for sorting the widget amongst its siblings.
   */
  rank?: number;
}


/**
 * The options for adding widgets to the main area of the shell.
 */
export
interface IMainAreaOptions { }


/**
 * An object which provides the main application layout.
 *
 * #### Notes
 * A shell view is the top-level widget in a Phosphide application. It
 * is responsible for dividing the browser window into separate widget
 * areas
 *
 */
export
interface IShell extends Widget {
  /**
   * Add a view to the top shell area.
   *
   * @param view - The view to add to the top area.
   *
   * @param options - The configuration options for the view.
   *
   * #### Notes
   * If the view is already added to the area, it will be moved.
   *
   * The view can be removed by setting its parent to `null`.
   */
  addToTopArea(widget: Widget, options?: ISideAreaOptions): void;

  /**
   * Add a view to the left shell area.
   *
   * @param view - The view to add to the top area.
   *
   * @param options - The configuration options for the view.
   *
   * #### Notes
   * If the view is already added to the area, it will be moved.
   *
   * The view can be removed by setting its parent to `null`.
   */
  addToLeftArea(widget: Widget, options?: ISideAreaOptions): void;

  /**
   * Add a view to the right shell area.
   *
   * @param view - The view to add to the top area.
   *
   * @param options - The configuration options for the view.
   *
   * #### Notes
   * If the view is already added to the area, it will be moved.
   *
   * The view can be removed by setting its parent to `null`.
   */
  addToRightArea(widget: Widget, options?: ISideAreaOptions): void;

  /**
   *
   */
  addToMainArea(widget: Widget, options?: IMainAreaOptions): void;
}


/**
 * The dependency token for the `IShell` interface.
 */
export
const IShell = new Token<IShell>('phosphide.IShell');
