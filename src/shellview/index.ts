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
 *
 */
export
interface IViewOptions {
  /**
   *
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
 *
 */
export
interface IShellView extends Widget {
  /**
   *
   */
  addTopView(view: Widget, options?: IViewOptions): void;

  /**
   *
   */
  addLeftView(view: Widget, options?: IViewOptions): void;

  /**
   *
   */
  addRightView(view: Widget, options?: IViewOptions): void;

  /**
   *
   */
  addMainView(view: Widget, options?: IMainViewOptions): void;
}


/**
 *
 */
export
const IShellView = new Token<IShellView>('phosphide.IShellView');
