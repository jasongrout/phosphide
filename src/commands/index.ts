/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';


import {
  IDisposable, DisposableDelegate
} from 'phosphor-disposable';

import {
  MenuItem, IMenuItemOptions
} from 'phosphor-menus';

import {
  IExtension
} from 'phosphor-plugins';

import {
  ICommandMenuItem
} from '../menus/menuiteminterface.ts';


export
interface ICommandExtension {
  id: string;
  caption: string;
  handler: () => void;
}


/**
 * The receiver for the `command:main` extension point.
 */
export
function receiveMain(extension: IExtension<ICommandExtension>): IDisposable {
  if (extension.object && extension.object.hasOwnProperty('id')) {
    let id = extension.object.id;
    if (id in commandMap) {
      throw new Error('Command already exists');
    }
    commandMap[id] = extension.object;
    return new DisposableDelegate(() => {
      delete commandMap[id];
    });
  }
}


/**
 * The initializer for the `command:main` extension point.
 */
export function initializeMain(): Promise<IDisposable> {
  commandMap = {};
  var disposable = new DisposableDelegate(() => {
    for (var item in commandMap) {
      delete commandMap[item];
    }
  });
  return Promise.resolve(disposable);
}

/**
 * The invoker for the `command:invoke` extension point.
 */
export
function receiveInvoke(name: string): Promise<IDisposable> {
  console.log("receiveInvoke called: " + name);
  if (name in commandMap) {
    console.log("NAME FOUND... calling.");
    commandMap[name].handler();
    return Promise.resolve(void 0);
  } else {
    console.log("MISS: " + Object.keys(commandMap).toString());
  }
  return Promise.reject(void 0);
}


/**
 * The initializer for the `command:invoke` extension point.
 *
 * #### Notes
 * This is a no-op, and shouldn't be required.
 */
export
function initializeInvoker(): Promise<IDisposable> {
  return Promise.resolve(void 0);
}

// global command manager
var commandMap: { [key: string]: any } = {};
