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
 * The options object for adding side views to the shell.
 */
export
interface IViewOptions {
  /**
   * The sort order rank for the view.
   *
   * The default rank is `100`.
   */
  rank?: number;
}


/**
 *
 */
export
interface IMainViewOptions {
  /**
   *
   */
  mode?: string;

  /**
   *
   */
  ref?: string;
}


/**
 * An which provides the main application layout.
 *
 * #### Notes
 * A shell view is the top-level widget in a Phosphide application. It
 * is responsible for dividing the browser window into separate widget
 * areas
 *
 */
export
interface IShellView extends Widget {
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
  addTopView(view: Widget, options?: IViewOptions): void;

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
  addLeftView(view: Widget, options?: IViewOptions): void;

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
  addRightView(view: Widget, options?: IViewOptions): void;

  /**
   *
   */
  addMainView(view: Widget, options?: IMainViewOptions): void;
}


/**
 * The dependency token for the `IShellView` interface.
 */
export
const IShellView = new Token<IShellView>('phosphide.IShellView');
