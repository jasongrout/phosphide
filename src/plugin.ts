/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IReceiver
} from 'phosphor-plugins';

import {
  Widget
} from 'phosphor-widget';

import {
  MainPanel
} from './mainpanel';

import {
  CSSReceiver
} from './cssreceiver';

import {
  DockPanelReceiver
} from './dockpanelreceiver';

import {
  MenuBarReceiver
} from './menubarreceiver';

import {
  SideBarReceiver
} from './sidebarreceiver';


/**
 *
 */
export
function createMenuBarReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new MenuBarReceiver(main.menuBar);
}


/**
 *
 */
export
function createMainReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new DockPanelReceiver(main.dockPanel);
}


/**
 *
 */
export
function createLeftReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new SideBarReceiver(main.leftSideBar, main.leftStackedPanel);
}


/**
 *
 */
export
function createRightReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new SideBarReceiver(main.rightSideBar, main.rightStackedPanel);
}


/**
 *
 */
export
function createCSSReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new CSSReceiver(main);
}


/**
 *
 */
const ensureMainPanel = (() => {
  let main: MainPanel = null;
  return () => {
    if (main) return main;

    main = new MainPanel();

    // temporary ids untils we figure out how best to tag things.
    main.id = 'p-main-panel';
    main.leftSideBar.id = 'p-left-sidebar';
    main.rightSideBar.id = 'p-right-sidebar';
    main.leftStackedPanel.id = 'p-left-stack';
    main.rightStackedPanel.id = 'p-right-stack';
    main.splitPanel.id = 'p-main-split-panel';
    main.dockPanel.id = 'p-main-dock-panel';
    main.boxPanel.id = 'p-main-box-panel';

    // temporary classes until we figure out how best to tag things.
    main.leftSideBar.addClass('p-mod-left');
    main.rightSideBar.addClass('p-mod-right');

    Widget.attach(main, document.body);
    window.addEventListener('resize', () => { main.update(); });
    return main;
  };
})();
