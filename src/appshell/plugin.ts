/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
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

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  Panel
} from 'phosphor-panel';

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
  Title, Widget
} from 'phosphor-widget';

import {
  ICommandRegistry, ICommandItem
} from '../commandregistry/index';

import {
  IAppShell, IMainAreaOptions, ISideAreaOptions
} from './index';

import {
  SideBar
} from './sidebar';

import './plugin.css';


// TODO - need better solution for storing these class names

/**
 * The class name added to AppShell instances.
 */
const APP_SHELL_CLASS = 'p-AppShell';


/**
 * Register the plugin contributions.
 *
 * @param container - The di container for type registration.
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
export
class AppShell extends Widget implements IAppShell {
  /**
   * The dependencies required by the application shell.
   */
  static requires: Token<any>[] = [ICommandRegistry];

  /**
   * Create a new application shell instance.
   */
  static create(registry: ICommandRegistry): IAppShell {
    return new AppShell(registry);
  }

  /**
   * Construct a new application shell.
   */
  constructor(registry: ICommandRegistry) {
    super();
    this.addClass(APP_SHELL_CLASS);

    let topPanel = new Panel();
    let hboxPanel = new BoxPanel();
    let dockPanel = new DockPanel();
    let hsplitPanel = new SplitPanel();
    let leftHandler = new SideBarHandler('left');
    let rightHandler = new SideBarHandler('right');
    let rootLayout = new BoxLayout();

    this._topPanel = topPanel;
    this._hboxPanel = hboxPanel;
    this._dockPanel = dockPanel;
    this._hsplitPanel = hsplitPanel;
    this._leftHandler = leftHandler;
    this._rightHandler = rightHandler;

    // TODO fix these
    hsplitPanel.id = 'p-main-split-panel';
    leftHandler.sideBar.addClass('p-mod-left');
    rightHandler.sideBar.addClass('p-mod-right');
    leftHandler.stackedPanel.id = 'p-left-stack';
    rightHandler.stackedPanel.id = 'p-right-stack';
    dockPanel.id = 'p-main-dock-panel';

    dockPanel.spacing = 8; // TODO make this configurable?

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

    registry.add([
      {
        id: 'appshell:activate-left',
        handler: (args: any) => { this._leftHandler.activate(args.id); }
      },
      {
        id: 'appshell:activate-right',
        handler: (args: any) => { this._rightHandler.activate(args.id); }
      },
      {
        id: 'appshell:collapse-left',
        handler: () => { this._leftHandler.sideBar.currentTitle = null; }
      },
      {
        id: 'appshell:collapse-right',
        handler: () => { this._rightHandler.sideBar.currentTitle = null; }
      },
      {
        id: 'appshell:collapse-both',
        handler: () => {
          this._leftHandler.sideBar.currentTitle = null;
          this._rightHandler.sideBar.currentTitle = null;
        }
      }
    ]);
  }

  /**
   * Add a widget to the top content area.
   */
  addToTopArea(widget: Widget, options: ISideAreaOptions = {}): void {
    // TODO
    if (!widget.id) {
      console.error('widgets added to app shell must have unique id property');
      return;
    }
  }

  /**
   * Add a widget to the left content area.
   */
  addToLeftArea(widget: Widget, options: ISideAreaOptions = {}): void {
    if (!widget.id) {
      console.error('widgets added to app shell must have unique id property');
      return;
    }
    let rank = 'rank' in options ? options.rank : 100;
    this._leftHandler.addWidget(widget, rank);
  }

  /**
   * Add a widget to the right content area.
   */
  addToRightArea(widget: Widget, options: ISideAreaOptions = {}): void {
    if (!widget.id) {
      console.error('widgets added to app shell must have unique id property');
      return;
    }
    let rank = 'rank' in options ? options.rank : 100;
    this._rightHandler.addWidget(widget, rank);
  }

  /**
   * Add a widget to the main content area.
   */
  addToMainArea(widget: Widget, options: IMainAreaOptions = {}): void {
    // TODO
    if (!widget.id) {
      console.error('widgets added to app shell must have unique id property');
      return;
    }
    this._dockPanel.insertTabAfter(widget);
  }

  private _topPanel: Panel;
  private _hboxPanel: BoxPanel;
  private _dockPanel: DockPanel;
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
  constructor(side: string) {
    this._side = side;
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
   * Activate a widget residing in the side bar by ID.
   *
   * @param id - The widget's unique ID.
   */
  activate(id: string):void {
    for (let i = 0, n = this._stackedPanel.childCount(); i < n; ++i) {
      let widget = this._stackedPanel.childAt(i);
      if (widget.id === id) {
        this._sideBar.currentTitle = widget.title;
        return;
      }
    }
  }


  /**
   * Add a widget and its title to the stacked panel and side bar.
   *
   * If the widget is already added, it will be moved.
   */
  addWidget(widget: Widget, rank: number): void {
    widget.parent = null;
    widget.hide();
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
    this._stackedPanel.setHidden(this._sideBar.currentTitle === null);
  }

  /**
   * Handle the `currentChanged` signal from the sidebar.
   */
  private _onCurrentChanged(sender: SideBar, args: IChangedArgs<Title>): void {
    let oldWidget = this._findTitleWidget(args.oldValue);
    let newWidget = this._findTitleWidget(args.newValue);
    if (oldWidget) oldWidget.hide();
    if (newWidget) {
      newWidget.show();
      document.body.dataset[`${this._side}Area`] = newWidget.id;
    } else {
      delete document.body.dataset[`${this._side}Area`];
    }
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

  private _side: string;
  private _sideBar: SideBar;
  private _stackedPanel: StackedPanel;
  private _items: IRankItem[] = [];
}
