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
 * An object which provides an extension to a context.
 */
export
interface IExtension<T> {
  /**
   * The human readable unique id of the service provider.
   */
  id: string;

  /**
   * The services required by the extension, if any.
   */
  requires?: IType<any>[];

  /**
   * A function which activates the extension.
   *
   * #### Notes
   * The function is passed the context object and the service objects
   * specified by the `requires` property. This function will not be
   * called unless all requirements can be fulfilled.
   *
   * The returned promise should resolve when activation is complete.
   */
  activate: (context: T, ...args: any[]) => Promise<void> | void;
}


/**
 * A class which manages a registry of extensions.
 *
 * #### Notes
 * A service registry is used by populating it with extension objects,
 * then calling the `activate` method to activate a specific extension.
 *
 * This class is used internally by the `Application` class. It will
 * not typically be used directly by user code.
 */
export
class ExtensionRegistry<T> {
  /**
   * Construct a new extension registry.
   */
  constructor() { }

  /**
   * Register an extension with the registry.
   *
   * @param extension - The extension to add to the registry.
   *
   * #### Notes
   * An error will be thrown if the extension id is already registered.
   */
  registerExtension(extension: IExtension<T>): void {
    // Throw an error if the extension id is already registered.
    if (extension.id in this._extensionsByID) {
      throw new Error(`extension '${extension.id}' already registered`);
    }

    // Create the extended extension and add it to the registry.
    let ext = Private.createExtensionEx(extension);
    this._extensionsByID[ext.id] = ext;
  }

  /**
   * List the IDs of all extensions in the registry.
   *
   * @returns A new array of all extension IDs in the registry.
   */
  listExtensions(): string[] {
    return Object.keys(this._extensionsByID);
  }

  /**
   * Test whether the registry has an extension with the given id.
   *
   * @param id - The id of the extension of interest.
   *
   * @returns `true` if an extension with the specified id is
   *   registered, `false` otherwise.
   */
  hasExtension(id: string): boolean {
    return id in this._extensionsByID;
  }

  /**
   * Activate the extension with the given id.
   *
   * @param id - The ID of the extension of interest.
   *
   * @param context - The context object to pass as the first argument
   *   to the extension's `activate` function.
   *
   * @param services - The service registry for resolving the services
   *   required by the extension.
   *
   * @returns A promise which resolves when the extension is fully
   *   activated or rejects with an error if it cannot be activated.
   */
  activateExtension(id: string, context: T, services: ServiceRegistry): Promise<void> {
    // Reject the promise if the extension is not registered.
    let ext = this._extensionsByID[id];
    if (!ext) {
      return Promise.reject(new Error(`extension '${id}' not registered`));
    }

    // Resolve immediately if the extension is already activated.
    if (ext.activated) {
      return Promise.resolve<void>();
    }

    // Return the pending resolver promise if it exists.
    if (ext.promise) {
      return ext.promise;
    }

    // Resolve the services required by the extension.
    let promises = ext.requires.map(req => services.resolveService(req));

    // Setup the resolver promise for the extension.
    ext.promise = Promise.all(promises).then(deps => {
      (deps as any[]).unshift(context);
      return ext.activate.apply(void 0, deps);
    }).then(() => {
      ext.promise = null;
      ext.activated = true;
    }).catch(error => {
      ext.promise = null;
      throw error;
    });

    // Return the pending resolver promise.
    return ext.promise;
  }

  private _extensionsByID = Private.createExtensionIDMap();
}


/**
 * The namespace for the private extension registry functionality.
 */
namespace Private {
  /**
   * An extension object with extra lifetime information.
   */
  export
  interface IExtensionEx<T> extends IExtension<T> {
    /**
     * Whether the extension has been activated.
     */
    activated: boolean;

    /**
     * The pending resolver promise, or null.
     */
    promise: Promise<void>;
  }

  /**
   * A type alias for a mapping of id to extension.
   */
  export
  type ExtensionIDMap = { [id: string]: IExtensionEx<any> };

  /**
   * Create new extension id map.
   */
  export
  function createExtensionIDMap(): ExtensionIDMap {
    return Object.create(null);
  }

  /**
   * Create a new extended extension.
   *
   * @param extension - The extension source object.
   *
   * @returns A new extended extension initialized with the data
   *   from the given extension.
   *
   * #### Notes
   * The `requires` property of the extended extension will always be
   * specified. If the original extension does not have dependencies,
   * the `requires` array will be empty.
   */
  export
  function createExtensionEx<T>(extension: IExtension<T>): IExtensionEx<T> {
    let { id, requires, activate } = extension;
    requires = requires ? requires.slice() : [];
    return { id, requires, activate, activated: false, promise: null };
  }
}
