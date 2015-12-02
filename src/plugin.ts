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
  SidePanel
} from './sidepanel';


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
    this.id = 'phosphide-main-panel';
    this.direction = Direction.TopToBottom;
    this.spacing = 0;

    this._menuBar = new MenuBar();

    this._dockPanel = new DockPanel();

    this._leftPanel = new SidePanel();
    this._leftPanel.direction = Direction.LeftToRight;

    this._rightPanel = new SidePanel();
    this._rightPanel.direction = Direction.RightToLeft;

    this._splitPanel = new SplitPanel();
    this._splitPanel.orientation = Orientation.Horizontal;
    this._splitPanel.spacing = 1;

    this._splitPanel.children.add(this._leftPanel);
    this._splitPanel.children.add(this._dockPanel);
    this._splitPanel.children.add(this._rightPanel);

    this.children.add(this._menuBar);
    this.children.add(this._splitPanel);
  }

  /**
   *
   */
  dispose(): void {
    this._menuBar = null;
    this._dockPanel = null;
    this._leftPanel = null;
    this._rightPanel = null;
    this._splitPanel = null;
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
  get leftPanel(): SidePanel {
    return this._leftPanel;
  }

  /**
   *
   */
  get rightPanel(): SidePanel {
    return this._rightPanel;
  }

  /**
   *
   */
  get splitPanel(): SplitPanel {
    return this._splitPanel;
  }

  private _menuBar: MenuBar;
  private _dockPanel: DockPanel;
  private _leftPanel: SidePanel;
  private _rightPanel: SidePanel;
  private _splitPanel: SplitPanel;
}
