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
  DockPanel
} from 'phosphor-dockpanel';

import {
  MenuBar
} from 'phosphor-menus';

import {
  Orientation, SplitPanel
} from 'phosphor-splitpanel';

import {
  StackedPanel
} from 'phosphor-stackedpanel';

import {
  Widget
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
export
class MainPanel extends BoxPanel {
  /**
   *
   */
  constructor() {
    super();
    this.addClass(MAIN_PANEL_CLASS);
    this.direction = Direction.TopToBottom;
    this.spacing = 0;

    this._menuBar = new MenuBar();
    this._boxPanel = new BoxPanel();
    this._dockPanel = new DockPanel();
    this._splitPanel = new SplitPanel();
    this._leftSideBar = new SideBar<Widget>();
    this._rightSideBar = new SideBar<Widget>();
    this._leftStackedPanel = new StackedPanel();
    this._rightStackedPanel = new StackedPanel();

    this._menuBar.hidden = true;
    this._leftSideBar.hidden = true;
    this._rightSideBar.hidden = true;
    this._leftStackedPanel.hidden = true;
    this._rightStackedPanel.hidden = true;

    this._boxPanel.direction = Direction.LeftToRight;
    this._boxPanel.spacing = 0;

    this._splitPanel = new SplitPanel();
    this._splitPanel.orientation = Orientation.Horizontal;
    this._splitPanel.spacing = 1;

    BoxPanel.setStretch(this._leftSideBar, 0);
    BoxPanel.setStretch(this._rightSideBar, 0);
    BoxPanel.setStretch(this._splitPanel, 1);

    SplitPanel.setStretch(this._leftStackedPanel, 0);
    SplitPanel.setStretch(this._rightStackedPanel, 0);
    SplitPanel.setStretch(this._dockPanel, 1);

    this._splitPanel.children.add(this._leftStackedPanel);
    this._splitPanel.children.add(this._dockPanel);
    this._splitPanel.children.add(this._rightStackedPanel);

    this._boxPanel.children.add(this._leftSideBar);
    this._boxPanel.children.add(this._splitPanel);
    this._boxPanel.children.add(this._rightSideBar);

    this.children.add(this._menuBar);
    this.children.add(this._boxPanel);
  }

  /**
   *
   */
  dispose(): void {
    this._menuBar = null;
    this._boxPanel = null;
    this._dockPanel = null;
    this._splitPanel = null;
    this._leftSideBar = null;
    this._rightSideBar = null;
    this._leftStackedPanel = null;
    this._rightStackedPanel = null;
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
  get boxPanel(): BoxPanel {
    return this._boxPanel;
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
  get splitPanel(): SplitPanel {
    return this._splitPanel;
  }

  /**
   *
   */
  get leftSideBar(): SideBar<Widget> {
    return this._leftSideBar;
  }

  /**
   *
   */
  get rightSideBar(): SideBar<Widget> {
    return this._rightSideBar;
  }

  /**
   *
   */
  get leftStackedPanel(): StackedPanel {
    return this._leftStackedPanel;
  }

  /**
   *
   */
  get rightStackedPanel(): StackedPanel {
    return this._rightStackedPanel;
  }

  private _menuBar: MenuBar;
  private _boxPanel: BoxPanel;
  private _dockPanel: DockPanel;
  private _splitPanel: SplitPanel;
  private _leftSideBar: SideBar<Widget>;
  private _rightSideBar: SideBar<Widget>;
  private _leftStackedPanel: StackedPanel;
  private _rightStackedPanel: StackedPanel;
}
