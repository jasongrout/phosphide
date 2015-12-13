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
  Container, Token
} from 'phosphor-di';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  Orientation, SplitPanel
} from 'phosphor-splitpanel';

import {
  StackedPanel
} from 'phosphor-stackedpanel';

import {
  IChildWidgetList, Panel, Widget
} from 'phosphor-widget';

import {
  IMainViewOptions, IShellView, IViewOptions
} from './index';

import {
  SideBar
} from './sidebar';


/**
 *
 */
const SHELL_VIEW_CLASS = 'p-ShellView';


/**
 *
 */
export
function register(container: Container): void {
  container.register(IShellView, ShellView);
}


/**
 *
 */
class ShellView extends BoxPanel implements IShellView {
  /**
   *
   */
  static requires: Token<any>[] = [];

  /**
   *
   */
  static create(): IShellView {
    let view = new ShellView();
    Widget.attach(view, document.body);
    window.addEventListener('resize', () => { view.update(); });
    return view;
  }

  /**
   *
   */
  constructor() {
    super();

    // TODO fix many of these hard coded values

    this.addClass(SHELL_VIEW_CLASS);
    this.direction = Direction.TopToBottom;
    this.spacing = 0;

    this._menuPanel = new Panel();
    this._boxPanel = new BoxPanel();
    this._dockPanel = new DockPanel();
    this._splitPanel = new SplitPanel();
    this._leftSideBar = new SideBar<Widget>();
    this._rightSideBar = new SideBar<Widget>();
    this._leftStackedPanel = new StackedPanel();
    this._rightStackedPanel = new StackedPanel();

    this._leftSideBar.hidden = true;
    this._rightSideBar.hidden = true;
    this._leftStackedPanel.hidden = true;
    this._rightStackedPanel.hidden = true;

    this._boxPanel.direction = Direction.LeftToRight;
    this._boxPanel.spacing = 0;

    this._splitPanel = new SplitPanel();
    this._splitPanel.orientation = Orientation.Horizontal;
    this._splitPanel.spacing = 1;

    this._dockPanel.spacing = 8;

    BoxPanel.setStretch(this._menuPanel, 0);
    BoxPanel.setStretch(this._boxPanel, 1);

    BoxPanel.setStretch(this._leftSideBar, 0);
    BoxPanel.setStretch(this._splitPanel, 1);
    BoxPanel.setStretch(this._rightSideBar, 0);

    SplitPanel.setStretch(this._leftStackedPanel, 0);
    SplitPanel.setStretch(this._dockPanel, 1);
    SplitPanel.setStretch(this._rightStackedPanel, 0);

    this._leftSideBar.items = this._leftStackedPanel.children;
    this._leftSideBar.currentItemChanged.connect(this._onLeftCurrentChanged, this);
    this._leftStackedPanel.children.changed.connect(this._onLeftChildrenChanged, this);

    this._rightSideBar.items = this._rightStackedPanel.children;
    this._rightSideBar.currentItemChanged.connect(this._onRightCurrentChanged, this);
    this._rightStackedPanel.children.changed.connect(this._onRightChildrenChanged, this);

    this._splitPanel.children.add(this._leftStackedPanel);
    this._splitPanel.children.add(this._dockPanel);
    this._splitPanel.children.add(this._rightStackedPanel);

    this._boxPanel.children.add(this._leftSideBar);
    this._boxPanel.children.add(this._splitPanel);
    this._boxPanel.children.add(this._rightSideBar);

    this.children.add(this._menuPanel);
    this.children.add(this._boxPanel);

    // TOOD fix ids
    this.id = 'p-shell-view';
    this._leftStackedPanel.id = 'p-left-stack';
    this._rightStackedPanel.id = 'p-right-stack';
    this._dockPanel.id = 'p-main-dock-panel';
    this._splitPanel.id = 'p-main-split-panel';
    this._leftSideBar.addClass('p-mod-left');
    this._rightSideBar.addClass('p-mod-right');
  }

  /**
   *
   */
  dispose(): void {
    this._menuPanel = null;
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
  addTopView(view: Widget, options?: IViewOptions): void {
    // TODO support options
    // TODO support this panel
  }

  /**
   *
   */
  addLeftView(view: Widget, options?: IViewOptions): void {
    // TODO support options
    this._leftStackedPanel.children.add(view);
  }

  /**
   *
   */
  addRightView(view: Widget, options?: IViewOptions): void {
    // TODO support options
    this._rightStackedPanel.children.add(view);
  }

  /**
   *
   */
  addMainView(view: Widget, options?: IMainViewOptions): void {
    // TODO support options
    this._dockPanel.insertTabAfter(view);
  }

  /**
   *
   */
  private _onLeftCurrentChanged(sender: SideBar<Widget>, args: IChangedArgs<Widget>): void {
    this._leftStackedPanel.currentWidget = args.newValue;
    this._leftStackedPanel.hidden = !args.newValue;
  }

  /**
   *
   */
  private _onLeftChildrenChanged(sender: IChildWidgetList): void {
    if (sender.length === 0) {
      this._leftSideBar.hidden = true;
      this._leftStackedPanel.hidden = true;
    } else {
      this._leftSideBar.hidden = false;
    }
  }

  /**
   *
   */
  private _onRightCurrentChanged(sender: SideBar<Widget>, args: IChangedArgs<Widget>): void {
    this._rightStackedPanel.currentWidget = args.newValue;
    this._rightStackedPanel.hidden = !args.newValue;
  }

  /**
   *
   */
  private _onRightChildrenChanged(sender: IChildWidgetList): void {
    if (sender.length === 0) {
      this._rightSideBar.hidden = true;
      this._rightStackedPanel.hidden = true;
    } else {
      this._rightSideBar.hidden = false;
    }
  }

  private _menuPanel: Panel;
  private _boxPanel: BoxPanel;
  private _dockPanel: DockPanel;
  private _splitPanel: SplitPanel;
  private _leftSideBar: SideBar<Widget>;
  private _rightSideBar: SideBar<Widget>;
  private _leftStackedPanel: StackedPanel;
  private _rightStackedPanel: StackedPanel;
}
