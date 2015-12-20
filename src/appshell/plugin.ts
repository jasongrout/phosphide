/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

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
  IAppShell, IMainAreaOptions, ISideAreaOptions
} from './index';

import {
  SideBar
} from './sidebar';


// TODO - need better solution for storing these class names

/**
 * The class name added to AppShell instances.
 */
const APP_SHELL_CLASS = 'p-AppShell';


/**
 * Register the plugin contributions.
 *
 * @param container - The dependency injection container to use for
 *   registering the types provided by the plugin.
 *
 * #### Notes
 * This is called automatically when the plugin is loaded.
 */
export
function register(container: Container): void {
  container.register(IAppShell, AppShell);
}


/**
 * A concrete implementation of `IAppShell`.
 */
class AppShell extends Widget implements IAppShell {
  /**
   * The dependencies required by the application shell.
   */
  static requires: Token<any>[] = [];

  /**
   * Create a new application shell instance.
   */
  static create(): IAppShell {
    let view = new AppShell();
    let update = () => { view.update(); };
    window.addEventListener('resize', update);
    view.attach(document.body);
    return view;
  }

  /**
   * Construct a new application shell.
   */
  constructor() {
    super();
    this.addClass(APP_SHELL_CLASS);

    let topPanel = new Panel();
    let dockPanel = new Widget();
    let hboxPanel = new BoxPanel();
    let hsplitPanel = new SplitPanel();
    let leftHandler = new SideBarHandler();
    let rightHandler = new SideBarHandler();
    let rootLayout = new BoxLayout();

    this._topPanel = topPanel;
    this._hboxPanel = hboxPanel;
    this._hsplitPanel = hsplitPanel;
    this._leftHandler = leftHandler;
    this._rightHandler = rightHandler;

    // leftStackedPanel.id = 'p-left-stack';
    // rightStackedPanel.id = 'p-right-stack';
    // this._dockPanel.id = 'p-main-dock-panel';
    // this._splitPanel.id = 'p-main-split-panel';
    // leftSideBar.addClass('p-mod-left');
    // rightSideBar.addClass('p-mod-right');

    hsplitPanel.orientation = SplitPanel.Horizontal;
    hsplitPanel.spacing = 1; // TODO make this configurable?

    SplitPanel.setStretch(leftHandler.stackedPanel, 0);
    SplitPanel.setStretch(dockPanel, 1);
    SplitPanel.setStretch(rightHandler.stackedPanel, 0);

    hsplitPanel.addChild(leftHandler.stackedPanel);
    hsplitPanel.addChild(dockPanel);
    hsplitPanel.addChild(rightHandler.stackedPanel);

    hboxPanel.direction = BoxPanel.LeftToRight;
    hboxPanel.spacing = 0; // TODO make this configurable?

    BoxPanel.setStretch(leftHandler.sideBar, 0);
    BoxPanel.setStretch(hsplitPanel, 1);
    BoxPanel.setStretch(rightHandler.sideBar, 0);

    hboxPanel.addChild(leftHandler.sideBar);
    hboxPanel.addChild(hsplitPanel);
    hboxPanel.addChild(rightHandler.sideBar);

    rootLayout.direction = BoxLayout.TopToBottom;
    rootLayout.spacing = 0; // TODO make this configurable?

    BoxLayout.setStretch(topPanel, 0);
    BoxLayout.setStretch(hboxPanel, 1);

    rootLayout.addChild(topPanel);
    rootLayout.addChild(hboxPanel);

    this.layout = rootLayout;
  }

  /**
   * Add a widget to the top content area.
   */
  addToTopArea(widget: Widget, options: ISideAreaOptions = {}): void {
    // TODO
  }

  /**
   * Add a widget to the left content area.
   */
  addToLeftArea(widget: Widget, options: ISideAreaOptions = {}): void {
    let rank = 'rank' in options ? options.rank : 100;
    this._leftHandler.addWidget(widget, rank);
  }

  /**
   * Add a widget to the right content area.
   */
  addToRightArea(widget: Widget, options: ISideAreaOptions = {}): void {
    let rank = 'rank' in options ? options.rank : 100;
    this._rightHandler.addWidget(widget, rank);
  }

  /**
   * Add a widget to the main content area.
   */
  addToMainArea(widget: Widget, options: IMainAreaOptions = {}): void {
    // TODO
  }

  private _topPanel: Panel;
  private _hboxPanel: BoxPanel;
  private _hsplitPanel: SplitPanel;
  private _leftHandler: SideBarHandler;
  private _rightHandler: SideBarHandler;
}


/**
 * An object which holds a widget and its sort rank.
 */
interface IRankItem {
  /**
   * The widget for the item.
   */
  widget: Widget;

  /**
   * The sort rank of the widget.
   */
  rank: number;
}


/**
 * A class which manages a side bar and related stacked panel.
 */
class SideBarHandler {
  /**
   * A less-than comparison function for side bar rank items.
   */
  static itemCmp(first: IRankItem, second: IRankItem): boolean {
    return first.rank < second.rank;
  }

  /**
   * Construct a new side bar handler.
   */
  constructor() {
    this._sideBar = new SideBar();
    this._stackedPanel = new StackedPanel();
    this._sideBar.hide();
    this._stackedPanel.hide();
    this._sideBar.currentChanged.connect(this._onCurrentChanged, this);
    this._stackedPanel.widgetRemoved.connect(this._onWidgetRemoved, this);
  }

  /**
   * Get the side bar managed by the handler.
   */
  get sideBar(): SideBar {
    return this._sideBar;
  }

  /**
   * Get the stacked panel managed by the handler
   */
  get stackedPanel(): StackedPanel {
    return this._stackedPanel;
  }

  /**
   * Add a widget and its title to the stacked panel and side bar.
   *
   * If the widget is already added, it will be moved.
   */
  addWidget(widget: Widget, rank: number): void {
    widget.parent = null;
    let item = { widget, rank };
    let index = this._findInsertIndex(item);
    arrays.insert(this._items, index, item);
    this._stackedPanel.insertChild(index, widget);
    this._sideBar.insertTitle(index, widget.title);
    this._refreshVisibility();
  }

  /**
   * Find the insertion index for a rank item.
   */
  private _findInsertIndex(item: IRankItem): number {
    return arrays.upperBound(this._items, item, SideBarHandler.itemCmp);
  }

  /**
   * Find the index of the item with the given widget, or `-1`.
   */
  private _findWidgetIndex(widget: Widget): number {
    return arrays.findIndex(this._items, item => item.widget === widget);
  }

  /**
   * Find the widget which owns the given title, or `null`.
   */
  private _findTitleWidget(title: Title): Widget {
    let item = arrays.find(this._items, item => item.widget.title === title);
    return item ? item.widget : null;
  }

  /**
   * Refresh the visibility of the side bar and stacked panel.
   */
  private _refreshVisibility(): void {
    this._sideBar.setHidden(this._sideBar.titleCount() === 0);
    this._stackedPanel.setHidden(this._stackedPanel.currentWidget === null);
  }

  /**
   * Handle the `currentChanged` signal from the sidebar.
   */
  private _onCurrentChanged(sender: SideBar, args: IChangedArgs<Title>): void {
    this._stackedPanel.currentWidget = this._findTitleWidget(args.newValue);
    this._refreshVisibility();
  }

  /*
   * Handle the `widgetRemoved` signal from the stacked panel.
   */
  private _onWidgetRemoved(sender: StackedPanel, widget: Widget): void {
    arrays.removeAt(this._items, this._findWidgetIndex(widget));
    this._sideBar.removeTitle(widget.title);
    this._refreshVisibility();
  }

  private _sideBar: SideBar;
  private _stackedPanel: StackedPanel;
  private _items: IRankItem[] = [];
}
