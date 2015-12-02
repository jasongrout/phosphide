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
function createDockPanelReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new DockPanelReceiver(main.dockPanel);
}


/**
 *
 */
export
function createLeftSideBarReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new SideBarReceiver(main.leftSideBar, main.leftStackedPanel);
}


/**
 *
 */
export
function createRightSideBarReceiver(): IReceiver {
  let main = ensureMainPanel();
  return new SideBarReceiver(main.rightSideBar, main.rightStackedPanel);
}


/**
 *
 */
const ensureMainPanel = (() => {
  let main: MainPanel = null;
  return () => {
    if (main) return main;
    main = new MainPanel();
    Widget.attach(main, document.body);
    window.addEventListener('resize', () => { main.update(); });
    return main;
  };
})();
