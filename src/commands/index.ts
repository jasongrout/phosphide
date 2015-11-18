/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

// import {
//   IDelegateCommandOptions
// } from 'phosphor-command';

import {
  IDisposable, DisposableDelegate
} from 'phosphor-disposable';

import {
  IExtension
} from 'phosphor-plugins';


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
 * The invoker for the `command:main` extension point.
 */
export
function receiveInvoke(name: string): Promise<IDisposable> {
  if (name in commandMap) {
    commandMap[name].handler();
    return Promise.resolve(void 0);
  }
  return Promise.reject(void 0);
}

// global command manager
var commandMap: { [key: string]: any } = {};
