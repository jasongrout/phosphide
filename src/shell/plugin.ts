/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  BoxLayout, BoxPanel
} from 'phosphor-boxpanel';

import {
  Container, Token
} from 'phosphor-di';

// import {
//   DockPanel
// } from 'phosphor-dockpanel';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  SplitPanel
} from 'phosphor-splitpanel';

import {
  StackedPanel
} from 'phosphor-stackedpanel';

import {
  Panel, Title, Widget
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
class ShellView extends Widget implements IShellView {
  /**
   *
   */
  static requires: Token<any>[] = [];

  /**
   *
   */
  static create(): IShellView {
    let view = new ShellView();
    view.attach(document.body);
    window.addEventListener('resize', () => { view.update(); });
    return view;
  }

  /**
   *
   */
  constructor() {
    super();
    this.addClass(SHELL_VIEW_CLASS);

    // TODO fix many of these hard coded values

    this._menuPanel = new Panel();
    this._boxPanel = new BoxPanel();
    this._dockPanel = new Widget(); //new DockPanel();
    this._splitPanel = new SplitPanel();
    let leftSideBar = new SideBar();
    let rightSideBar = new SideBar();
    let leftStackedPanel = new StackedPanel();
    let rightStackedPanel = new StackedPanel();
    this._leftHandler = new SideBarHandler(leftSideBar, leftStackedPanel);
    this._rightHandler = new SideBarHandler(rightSideBar, rightStackedPanel);

    //leftSideBar.hide();
    //rightSideBar.hide();
    leftStackedPanel.hide();
    rightStackedPanel.hide();

    this._boxPanel.direction = BoxPanel.LeftToRight;
    this._boxPanel.spacing = 0;

    this._splitPanel = new SplitPanel();
    this._splitPanel.orientation = SplitPanel.Horizontal;
    this._splitPanel.spacing = 1;

    //this._dockPanel.spacing = 8;

    // this._leftSideBar.items = this._leftStackedPanel.children;
    // this._leftSideBar.currentChanged.connect(this._onLeftCurrentChanged, this);

    // this._rightSideBar.items = this._rightStackedPanel.children;
    // this._rightSideBar.currentChanged.connect(this._onRightCurrentChanged, this);

    SplitPanel.setStretch(leftStackedPanel, 0);
    SplitPanel.setStretch(this._dockPanel, 1);
    SplitPanel.setStretch(rightStackedPanel, 0);

    this._splitPanel.addChild(leftStackedPanel);
    this._splitPanel.addChild(this._dockPanel);
    this._splitPanel.addChild(rightStackedPanel);

    BoxPanel.setStretch(leftSideBar, 0);
    BoxPanel.setStretch(this._splitPanel, 1);
    BoxPanel.setStretch(rightSideBar, 0);

    this._boxPanel.addChild(leftSideBar);
    this._boxPanel.addChild(this._splitPanel);
    this._boxPanel.addChild(rightSideBar);

    // TOOD fix ids
    this.id = 'p-shell-view';
    leftStackedPanel.id = 'p-left-stack';
    rightStackedPanel.id = 'p-right-stack';
    this._dockPanel.id = 'p-main-dock-panel';
    this._splitPanel.id = 'p-main-split-panel';
    leftSideBar.addClass('p-mod-left');
    rightSideBar.addClass('p-mod-right');

    let layout = new BoxLayout();
    layout.direction = BoxLayout.TopToBottom;
    layout.spacing = 0;

    BoxLayout.setStretch(this._menuPanel, 0);
    BoxLayout.setStretch(this._boxPanel, 1);

    layout.addChild(this._menuPanel);
    layout.addChild(this._boxPanel);

    this.layout = layout;
  }

  /**
   *
   */
  dispose(): void {
    this._menuPanel = null;
    this._boxPanel = null;
    this._dockPanel = null;
    this._splitPanel = null;
    this._leftHandler = null;
    this._rightHandler = null;
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
    this._leftHandler.add(view, options);
  }

  /**
   *
   */
  addRightView(view: Widget, options?: IViewOptions): void {
    this._rightHandler.add(view, options);
  }

  /**
   *
   */
  addMainView(view: Widget, options?: IMainViewOptions): void {
    // TODO support options
    // this._dockPanel.insertTabAfter(view);
  }


  private _menuPanel: Panel;
  private _boxPanel: BoxPanel;
  //private _dockPanel: DockPanel;
  private _dockPanel: Widget;
  private _splitPanel: SplitPanel;
  private _leftHandler: SideBarHandler;
  private _rightHandler: SideBarHandler;
}


class SideBarHandler {

  constructor(sideBar: SideBar, stackedPanel: StackedPanel) {
    this._sideBar = sideBar;
    this._stackedPanel = stackedPanel;
    sideBar.currentChanged.connect(this._onCurrentChanged, this);
  }

  get sideBar(): SideBar {
    return this._sideBar;
  }

  get stackedPanel(): StackedPanel {
    return this._stackedPanel;
  }

  add(view: Widget, options?: IViewOptions): void {
    this._stackedPanel.addChild(view);
    this._sideBar.addTitle(view.title);
  }

  private _findWidget(title: Title): Widget {
    let stack = this._stackedPanel;
    for (let i = 0, n = stack.childCount(); i < n; ++i) {
      let child = stack.childAt(i);
      if (child.title === title) return child;
    }
    return null;
  }

  private _onCurrentChanged(sender: SideBar, args: IChangedArgs<Title>): void {
    let widget = args.newValue ? this._findWidget(args.newValue) : null;
    this._stackedPanel.currentWidget = widget;
    if (widget) {
      this._stackedPanel.show();
    } else {
      this._stackedPanel.hide();
    }
  }

  private _sideBar: SideBar;
  private _stackedPanel: StackedPanel;
}
