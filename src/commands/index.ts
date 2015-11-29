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
  IExtension, IReceiver
} from 'phosphor-plugins';

import {
  ICommandMenuItem
} from '../menus/menuiteminterface.ts';


/**
 * The extension interface to be used for commands.
 */
export
interface ICommandExtension {
  /**
   * The unique identifier for the command.
   */
  id: string;
  /**
   * The human readable string to clarify the functionality.
   */
  caption: string;
  /**
   * The callable which performs the command action.
   */
  handler: () => void;
}


/**
 * The receiver for the `command:main` extension point.
 */
export
function createCommandReceiver(): IReceiver {
  return {
    add: function(extension: IExtension) {
      let id = extension.item.id;
      if (id in commandMap) {
        throw new Error('Command already exists');
      }
      commandMap[id] = extension.item;

      return new DisposableDelegate(() => {
        delete commandMap[id];
      });
    },
    remove: function(id) {
      // TODO
    },
    dispose: function() {
      // TODO
    }
  };

}
//   if (extension.item && extension.item.hasOwnProperty('id')) {
//     let id = extension.item.id;
//     if (id in commandMap) {
//       throw new Error('Command already exists');
//     }
//     commandMap[id] = extension.item;
//     return new DisposableDelegate(() => {
//       delete commandMap[id];
//     });
//   }
// }


/**
 * The initializer for the `command:main` extension point.
 */
// export
// function initializeMain(): Promise<IDisposable> {
//   commandMap = {};
//   var disposable = new DisposableDelegate(() => {
//     for (var item in commandMap) {
//       delete commandMap[item];
//     }
//   });
//   return Promise.resolve(disposable);
// }

/**
 * The invoker for the `command:invoke` extension point.
 */
// export
// function receiveInvoke(name: string): Promise<IDisposable> {
//   if (name in commandMap) {
//     commandMap[name].handler();
//     return Promise.resolve(void 0);
//   } else {
//     return Promise.reject(new Error("Invoker - name not found: " + name));
//   }
//   return Promise.reject(void 0);
// }


/**
 * The initializer for the `command:invoke` extension point.
 *
 * #### Notes
 * This is a no-op, and shouldn't be required.
 */
// export
// function initializeInvoker(): Promise<IDisposable> {
//   return Promise.resolve(void 0);
// }

// global command manager
var commandMap: { [key: string]: any } = {};
