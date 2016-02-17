/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';


/**
 * An interface which captures the type produced by a class.
 */
export
interface IType<T> extends Function {
  /**
   * The prototype for the class.
   */
  prototype: T;
}


/**
 * An object which provides a service for an application.
 */
export
interface IServiceProvider<T> {
  /**
   * The human readable unique id of the service provider.
   */
  id: string;

  /**
   * The type of the service resolved by the provider.
   */
  provides: IType<T>;

  /**
   * The other services required by the provider, if any.
   */
  requires?: IType<any>[];

  /**
   * A function which resolves the provider's service object.
   *
   * #### Notes
   * The arguments passed to the resolve function will be the service
   * objects specified by the `requires` property. This function will
   * not be called unless all requirements can be fulfilled.
   */
  resolve: (...args: any[]) => T | Promise<T>;
}


/**
 * A class which manages a registry of service providers.
 *
 * #### Notes
 * A service registry is used by populating it with service providers,
 * then calling the `resolve` method to get the singleton instance of
 * a specified service type.
 *
 * This class is used internally by the `Application` class. It will
 * not typically be used directly by user code.
 */
export
class ServiceRegistry {
  /**
   * Construct a new service registry.
   */
  constructor() { }

  /**
   * Register a service provider with the registry.
   *
   * @param provider - The service provider to add to the registry.
   *
   * #### Notes
   * An error will be thrown if a provider with the same id is already
   * registered, if a provider which provides the identical service is
   * already registered, or if the provider has a circular dependency.
   */
  registerProvider<T>(provider: IServiceProvider<T>): void {
    // Throw an error if the provider id is already registered.
    let pid = provider.id;
    if (pid in this._providersByID) {
      throw new Error(`provider '${pid}' already registered`);
    }

    // Throw an error if the service type is already registered.
    let other = this._providersByType.get(provider.provides);
    if (other) {
      throw new Error(`'${pid}' service already provided by '${other.id}'`);
    }

    // Throw an error if the provider has a circular dependency.
    let cycle = Private.findCycle(provider, this._providersByType);
    if (cycle) {
      throw new Error(`provider cycle detected: ${cycle.join(' -> ')}`);
    }

    // Create the extended provider and add it to the registry.
    let pex = Private.createProviderEx(provider);
    this._providersByType.set(pex.provides, pex);
    this._providersByID[pex.id] = pex;
  }

  /**
   * Test whether the registry has a provider with the given id.
   *
   * @param id - The id of the provider of interest.
   *
   * @returns `true` if a service provider with the specified id is
   *   registered, `false` otherwise.
   */
  hasProvider(id: string): boolean {
    return id in this._providersByID;
  }

  /**
   * Test whether the registry has a provider for the given service.
   *
   * @param kind - The type of the service of interest.
   *
   * @returns `true` if a service provider is registered for the
   *   specified service type, `false` otherwise.
   */
  hasProviderFor<T>(kind: IType<T>): boolean {
    return this._providersByType.has(kind);
  }

  /**
   * Resolve a service implementation for the given type.
   *
   * @param kind - The type of service object to resolve.
   *
   * @returns A promise which resolves the specified service type,
   *   or rejects with an error if it cannot be satisfied.
   *
   * #### Notes
   * Services are singletons. The same service instance will be
   * returned each time a given service type is resolved.
   */
  resolveService<T>(kind: IType<T>): Promise<T> {
    return Private.resolveService(kind, this._providersByType, []);
  }

  private _providersByID = Private.createProviderIDMap();
  private _providersByType = Private.createProviderTypeMap();
}


/**
 * The namespace for the private service registry functionality.
 */
namespace Private {
  /**
   * An extended service provider object.
   */
  export
  interface IProviderEx<T> extends IServiceProvider<T> {
    /**
     * The resolved value of the provider, or null.
     */
    value: T;

    /**
     * Whether the provider has been resolved.
     */
    resolved: boolean;

    /**
     * The pending resolver promise, or null.
     */
    promise: Promise<T>;
  }

  /**
   * A type alias for a mapping of id to extended provider.
   */
  export
  type ProviderIDMap = { [id: string]: IProviderEx<any> };

  /**
   * A type alias for a map of service type to extended provider.
   */
  export
  type ProviderTypeMap = Map<IType<any>, IProviderEx<any>>;

  /**
   * Create new provider id map.
   */
  export
  function createProviderIDMap(): ProviderIDMap {
    return Object.create(null);
  }

  /**
   * Create a new provider type map.
   */
  export
  function createProviderTypeMap(): ProviderTypeMap {
    return new Map<IType<any>, IProviderEx<any>>();
  }

  /**
   * Create a new extended provider.
   *
   * @param provider - The service provider source object.
   *
   * @returns A new extended provider initialized with the data
   *   from the given service provider.
   *
   * #### Notes
   * The `requires` property of the extended provider will always be
   * specified. If the original provider does not have dependencies,
   * the `requires` array will be empty.
   */
  export
  function createProviderEx<T>(provider: IServiceProvider<T>): IProviderEx<T> {
    let { id, provides, requires, resolve } = provider;
    requires = requires ? requires.slice() : [];
    return { id, provides, requires, resolve, value: null, resolved: false, promise: null };
  }

  /**
   * Find a cycle with the given service provider, if one exists.
   *
   * @param provider - The service provider to test for a cycle.
   *
   * @param map - The mapping of type to extended provider.
   *
   * @returns The ordered IDs of the cyclic providers, or null if
   *   no cycle is present.
   */
  export
  function findCycle(provider: IServiceProvider<any>, map: ProviderTypeMap): string[] {
    if (!provider.requires) return null;
    let trace = [provider.id];
    let root = provider.provides;
    return provider.requires.some(visit) ? trace : null;

    function visit(kind: IType<any>): boolean {
      if (kind === root) {
        return true;
      }
      let pex = map.get(kind);
      if (!pex) {
        return false;
      }
      trace.push(pex.id);
      if (pex.requires.some(visit)) {
        return true;
      }
      trace.pop();
      return false;
    }
  }

  /**
   * Resolve the instance of the specified service type.
   *
   * @param kind - The service type to resolve.
   *
   * @param map - The mapping of type to extended provider.
   *
   * @param path - An array of provider ids representing the current
   *   path of the resolver graph. This should be an empty array for
   *   the first call to this function.
   *
   * @returns A promise which resolves to an instance of the requested
   *   type, or rejects if the instance cannot be created.
   */
  export
  function resolveService<T>(kind: IType<T>, map: ProviderTypeMap, path: string[]): Promise<T> {
    // Reject the promise if there is provider for the type.
    let pex = map.get(kind);
    if (!pex) {
      return Promise.reject(missingProviderError(kind, path));
    }

    // Resolve immediately if the provider is already resolved.
    if (pex.resolved) {
      return Promise.resolve(pex.value);
    }

    // Return the pending resolver promise if it exists.
    if (pex.promise) {
      return pex.promise;
    }

    // Setup the resolver promise for the provider.
    pex.promise = resolveImpl(pex, map, path).then(value => {
      pex.value = value;
      pex.promise = null;
      pex.resolved = true;
      return value;
    }, error => {
      pex.promise = null;
      throw error;
    });

    // Return the pending resolver promise.
    return pex.promise;
  }

  /**
   * Resolve the service instance for the given provider.
   */
  function resolveImpl<T>(pex: IProviderEx<T>, map: ProviderTypeMap, path: string[]): Promise<T> {
    // Push the current provider id onto the path stack.
    path.push(pex.id);

    // Generate the resolver promises from the provider dependencies.
    let reqs = pex.requires.map(kind => resolveService(kind, map, path));

    // Pop the provider id from the path stack.
    path.pop();

    // Return the promise which resolves the type for the provider.
    return Promise.all(reqs).then(deps => pex.resolve.apply(void 0, deps));
  }

  /**
   * Create a formatted error for a missing provider.
   *
   * @param kind - The service type which cannot be fulfilled.
   *
   * @param path - The resolver path at the point of failure.
   *
   * @returns An error with a formatted message.
   */
  function missingProviderError(kind: IType<any>, path: string[]): Error {
    // The `any` cast is needed due to no `Function.name` on IE.
    let name = ((kind as any).name as string) || '';
    let head = `No registered provider for type: ${name}.`;
    let tail = `Provider resolution path: ${path.join(' -> ')}.`;
    return new Error(`${head} ${tail}`);
  }
}
