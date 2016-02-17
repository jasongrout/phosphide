/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IType, ServiceRegistry
} from './serviceregistry';


/**
 *
 */
export
interface IExtension<T> {
  /**
   *
   * This must be a non-empty string.
   */
  id: string;

  /**
   *
   */
  requires?: IType<any>[];

  /**
   *
   */
  activate: (context: T, ...args: any[]) => Promise<void>;
}


/**
 *
 */
export
class ExtensionRegistry<T> {
  /**
   *
   */
  constructor() { }

  /**
   *
   */
  registerExtension(extension: IExtension<T>): void {

  }

  /**
   *
   */
  listExtensions(): string[] {
    return Object.keys(this._extensions);
  }

  /**
   *
   */
  hasExtension(id: string): boolean {
    return id in this._extensions;
  }

  /**
   *
   */
  activateExtension(id: string, context: T, services: ServiceRegistry): Promise<void> {
    return null;
  }

  private _extensions = Private.createExtensionMap();
}


/**
 *
 */
namespace Private {
  /**
   *
   */
  export
  interface IExtensionEx<T> extends IExtension<T> {
    /**
     *
     */
    resolved: boolean;

    /**
     *
     */
    promise: Promise<void>;
  }

  /**
   *
   */
  export
  type ExtensionMap = { [id: string]: IExtensionEx<any> };

  /**
   *
   */
  export
  function createExtensionMap(): ExtensionMap {
    return Object.create(null);
  }

  /**
   *
   */
  export
  function createExtensionEx<T>(ext: IExtension<T>): IExtensionEx<T> {
    let { id, requires, activate } = ext;
    requires = requires ? requires.slice() : [];
    return { id, requires, activate, resolved: false, promise: null };
  }
}
