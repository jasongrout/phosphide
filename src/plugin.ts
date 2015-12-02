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
  IDisposable
} from 'phosphor-disposable';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  MenuBar
} from 'phosphor-menus';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  clearSignalData
} from 'phosphor-signaling';

import {
  Orientation, SplitPanel
} from 'phosphor-splitpanel';

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
 *
 */
const MAIN_PANEL_CLASS = 'p-MainPanel';


/**
 *
 */
class SideBarHandler implements IDisposable {
  /**
   *
   */
  constructor() {
    this._bar = new SideBar<Widget>();
    this._stack = new StackedPanel();

    this._bar.hidden = true;
    this._stack.hidden = true;

    this._bar.items = this._stack.children;
    this._bar.currentItemChanged.connect(this._onCurrentItemChanged, this);
    this._stack.children.changed.connect(this._onChildrenChanged, this);
  }

  /**
   *
   */
  dispose(): void {
    this._bar = null;
    this._stack = null;
    clearSignalData(this);
  }

  /**
   *
   */
  get isDisposed(): boolean {
    return this._bar === null;
  }

  /**
   *
   */
  get sideBar(): SideBar<Widget> {
    return this._bar;
  }

  /**
   *
   */
  get stackedPanel(): StackedPanel {
    return this._stack;
  }

  /**
   *
   */
  private _onCurrentItemChanged(sender: SideBar<Widget>, args: IChangedArgs<Widget>): void {
    this._stack.currentWidget = args.newValue;
    this._stack.hidden = !!args.newValue;
  }

  /**
   *
   */
  private _onChildrenChanged(sender: IChildWidgetList): void {
    if (sender.length === 0) {
      this._bar.hidden = true;
      this._stack.hidden = true;
    } else {
      this._bar.hidden = false;
    }
  }

  private _bar: SideBar<Widget>;
  private _stack: StackedPanel;
}


/**
 *
 */
class MainPanel extends BoxPanel {
  /**
   *
   */
  static instance(): MainPanel {
    return this._instance || (this._instance = new MainPanel());
  }

  /**
   *
   */
  private static _instance: MainPanel = null;

  /**
   *
   */
  constructor() {
    super();
    this.addClass(MAIN_PANEL_CLASS);
    this.direction = Direction.TopToBottom;
    this.spacing = 0;

    this._menuBar = new MenuBar();
    this._outerBox = new BoxPanel();
    this._dockPanel = new DockPanel();
    this._innerSplit = new SplitPanel();
    this._leftHandler = new SideBarHandler();
    this._rightHandler = new SideBarHandler();

    this._outerBox.direction = Direction.LeftToRight;
    this._outerBox.spacing = 0;

    this._innerSplit = new SplitPanel();
    this._innerSplit.orientation = Orientation.Horizontal;
    this._innerSplit.spacing = 1;

    this._innerSplit.children.add(this._leftHandler.stackedPanel);
    this._innerSplit.children.add(this._dockPanel);
    this._innerSplit.children.add(this._rightHandler.stackedPanel);

    this._outerBox.children.add(this._leftHandler.sideBar);
    this._outerBox.children.add(this._innerSplit);
    this._outerBox.children.add(this._rightHandler.sideBar);

    this.children.add(this._menuBar);
    this.children.add(this._outerBox);
  }

  /**
   *
   */
  dispose(): void {
    this._leftHandler.dispose();
    this._rightHandler.dispose();
    this._menuBar = null;
    this._outerBox = null;
    this._dockPanel = null;
    this._innerSplit = null;
    this._leftHandler = null;
    this._rightHandler = null;
    super.dispose();
  }

  /**
   *
   */
  get menuBar(): MenuBar {
    return this._menuBar;
  }

  /**
   *
   */
  get dockPanel(): DockPanel {
    return this._dockPanel;
  }

  /**
   *
   */
  get leftSideBar(): SideBar<Widget> {
    return this._leftHandler.sideBar;
  }

  /**
   *
   */
  get rightSideBar(): SideBar<Widget> {
    return this._rightHandler.sideBar;
  }

  private _menuBar: MenuBar;
  private _outerBox: BoxPanel;
  private _dockPanel: DockPanel;
  private _innerSplit: SplitPanel;
  private _leftHandler: SideBarHandler;
  private _rightHandler: SideBarHandler;
}
