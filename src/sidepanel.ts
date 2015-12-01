/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  BoxPanel, Direction
} from 'phosphor-boxpanel';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  StackedPanel
} from 'phosphor-stackedpanel';

import {
  IChildWidgetList, Widget
} from 'phosphor-widget';

import {
  SideBar
} from './sidebar';


/**
 * The class name added to SidePanel instances.
 */
const SIDE_PANEL_CLASS = 'p-SidePanel';


/**
 * A panel which combines a `SideBar` and a `StackedPanel`.
 *
 * #### Notes
 * Children for this panel should be added to the [[widgets]] list.
 */
export
class SidePanel extends BoxPanel {
  /**
   * Create the `SideBar` for the side panel.
   *
   * @returns The side bar to use with the side panel.
   *
   * #### Notes
   * This may be reimplemented by a subclass to create a custom
   * side bar for use with the side panel.
   */
  static createSideBar(): SideBar<Widget> {
    return new SideBar<Widget>();
  }

  /**
   * Create the `StackedPanel` for the side panel.
   *
   * @returns The stacked panel to use with the side panel.
   *
   * #### Notes
   * This may be reimplemented by a subclass to create a custom
   * stacked panel for use with the side panel.
   */
  static createStackedPanel(): StackedPanel {
    return new StackedPanel();
  }

  /**
   * Construct a new side panel.
   */
  constructor() {
    super();
    this.addClass(SIDE_PANEL_CLASS);

    let ctor = this.constructor as typeof SidePanel;
    this._bar = ctor.createSideBar();
    this._stack = ctor.createStackedPanel();
    this._stack.hidden = true;

    this._bar.items = this._stack.children;
    this._bar.currentItemChanged.connect(this.onCurrentItemChanged, this);

    BoxPanel.setStretch(this._bar, 0);
    BoxPanel.setStretch(this._stack, 1);

    this.direction = Direction.LeftToRight;
    this.spacing = 0;

    this.children.add(this._bar);
    this.children.add(this._stack);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._bar = null;
    this._stack = null;
    super.dispose();
  }

  /**
   * Get the currently selected widget.
   *
   * #### Notes
   * This is a convenience alias to the `currentItem` property of the
   * side bar.
   */
  get currentWidget(): Widget {
    return this._bar.currentItem;
  }

  /**
   * Set the currently selected widget.
   *
   * #### Notes
   * This is a convenience alias to the `currentItem` property of the
   * side bar.
   */
  set currentWidget(widget: Widget) {
    this._bar.currentItem = widget;
  }

  /**
   * Get the observable list of widgets for the side panel.
   *
   * #### Notes
   * Widgets to arrange in the side panel should be added to this list.
   *
   * This is a read-only alias of the `children` property of the
   * stacked panel.
   */
  get widgets(): IChildWidgetList {
    return this._stack.children;
  }

  /**
   * Get the side bar associated with the side panel.
   *
   * #### Notes
   * The items in the side bar are automatically synchronized with the
   * children of the stacked panel.
   *
   * This is a read-only property.
   */
  get bar(): SideBar<Widget> {
    return this._bar;
  }

  /**
   * Get the stacked panel associated with the side panel.
   *
   * #### Notes
   * The children of the stacked panel are automatically synchronized
   * with the items in the side bar.
   *
   * This is a read-only property.
   */
  get stack(): StackedPanel {
    return this._stack;
  }

  /**
   * Handle the `currentItemChanged` signal from the side bar.
   *
   * #### Notes
   * This can be reimplemented by subclasses as needed.
   *
   * The default implementation of this method synchronizes the current
   * side bar item with current widget of the stacked panel.
   */
  protected onCurrentItemChanged(sender: SideBar<Widget>, args: IChangedArgs<Widget>): void {
    this._stack.currentWidget = args.newValue;
    this._stack.hidden = !!args.newValue;
  }

  private _bar: SideBar<Widget>;
  private _stack: StackedPanel;
}
