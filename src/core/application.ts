/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  ApplicationShell
} from './applicationshell';

import {
  ExtensionRegistry, IExtension
} from './extensionregistry';

import {
  IServiceProvider, IType, ServiceRegistry
} from './serviceregistry';

import {
  ABCCommandRegistry, commandRegistryProvider
} from '../services/commandregistry';

import {
  ABCPaletteRegistry, paletteRegistryProvider
} from '../services/paletteregistry';

import {
  ABCShortcutRegistry, shortcutRegistryProvider
} from '../services/shortcutregistry';


/**
 * The extension type for use with an application object.
 */
export
interface IApplicationExtension extends IExtension<Application> { }


/**
 * An options object for initializing an application.
 */
export
interface IApplicationOptions {
  /**
   * The initial service providers for the application, if any.
   */
  providers?: IServiceProvider<any>[];

  /**
   * The initial application extensions for the application, if any.
   */
  extensions?: IApplicationExtension[];
}


/**
 * An options object for running an application.
 */
export
interface IApplicationRunOptions {
  /**
   * Whether to activate the application extensions.
   *
   * The default value is `true` and will cause all extensions to be
   * activated. If this is `false`, no extensions will be activated.
   * An array of string IDs will activate the specified extensions.
   */
  activateExtensions?: boolean | string[];

  /**
   * The element id of the host node for the application shell.
   *
   * If this is not provided, the document body will be the host.
   */
  shellHostID?: string;
}


/**
 * A class which provides the main Phosphide application logic.
 *
 * A phosphide application manages the registration of services and
 * extensions, and provides the top-level application shell widget.
 */
export
class Application {
  /**
   * Construct a new application.
   *
   * @param options - The options for initializing the application.
   */
  constructor(options?: IApplicationOptions) {
    if (options) Private.initFrom(this, options);
  }

  /**
   * Get the application shell widget.
   *
   * #### Notes
   * The shell widget is not a service, and can only be accessed as a
   * property of the application. Since the application object is not
   * passed to service providers, services do not have access to the
   * shell. This is by design. The intent is to encourage authors to
   * maintain a distinct separation between generic services and the
   * application extensions which manipulates the UI.
   *
   * This is a read-only property.
   */
  get shell(): ApplicationShell {
    return this._shell;
  }

  /**
   * Get the application command registry.
   *
   * #### Notes
   * The command registry is a service, and is provided as a property
   * for the convenience of application extension authors. A service
   * provider may require the command registry as needed.
   *
   * This is a read-only property.
   */
  get commands(): ABCCommandRegistry {
    return this._commands;
  }

  /**
   * Get the application palette registry.
   *
   * #### Notes
   * The palette registry is a service, and is provided as a property
   * for the convenience of application extension authors. A service
   * provider may require the palette registry as needed.
   *
   * This is a read-only property.
   */
  get palette(): ABCPaletteRegistry {
    return this._palette;
  }

  /**
   * Get the application shortcut registry.
   *
   * #### Notes
   * The shortcut registry is a service, and is provided as a property
   * for the convenience of application extension authors. A service
   * provider may require the shortcut registry as needed.
   *
   * This is a read-only property.
   */
  get shortcuts(): ABCShortcutRegistry {
    return this._shortcuts;
  }

  /**
   * Register a service provider with the application.
   *
   * @param provider - The service provider to register.
   *
   * #### Notes
   * An error will be thrown if a provider with the same id is already
   * registered, if a provider which provides the identical service is
   * already registered, or if the provider has a circular dependency.
   */
  registerProvider<T>(provider: IServiceProvider<T>): void {
    this._services.registerProvider(provider);
  }

  /**
   * List the IDs of all service providers in the application.
   *
   * @returns A new array of all provider IDs in the application.
   */
  listProviders(): string[] {
    return this._services.listProviders();
  }

  /**
   * Test whether the application has a registered service provider.
   *
   * @param id - The id of the provider of interest.
   *
   * @returns `true` if a service provider with the specified id is
   *   registered, `false` otherwise.
   */
  hasProvider(id: string): boolean {
    return this._services.hasProvider(id);
  }

  /**
   * Test whether the application has a provider for a service type.
   *
   * @param kind - The type of the service of interest.
   *
   * @returns `true` if a service provider is registered for the
   *   given service type, `false` otherwise.
   */
  hasProviderFor<T>(kind: IType<T>): boolean {
    return this._services.hasProviderFor(kind);
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
   *
   * User code will not normally call this method directly. Instead
   * the required services for the user's providers and extensions
   * will be resolved automatically as needed.
   */
  resolveService<T>(kind: IType<T>): Promise<T> {
    return this._services.resolveService(kind);
  }

  /**
   * Register an extension with the application.
   *
   * @param extension - The application extension to register.
   *
   * #### Notes
   * An error will be thrown if the extension id is already registered.
   */
  registerExtension(extension: IApplicationExtension): void {
    this._extensions.registerExtension(extension);
  }

  /**
   * List the IDs of all extensions in the application.
   *
   * @returns A new array of all extension IDs in the application.
   */
  listExtensions(): string[] {
    return this._extensions.listExtensions();
  }

  /**
   * Test whether the application has a registered extension.
   *
   * @param id - The id of the extension of interest.
   *
   * @returns `true` if an application extension with the specified
   *   id is registered, `false` otherwise.
   */
  hasExtension(id: string): boolean {
    return this._extensions.hasExtension(id);
  }

  /**
   * Activate the application extension with the given id.
   *
   * @param id - The ID of the extension of interest.
   *
   * @returns A promise which resolves when the extension is fully
   *   activated or rejects with an error if it cannot be activated.
   */
  activateExtension(id: string): Promise<void> {
    return this._extensions.activateExtension(id, this, this._services);
  }

  /**
   * Run the bootstrapping process for the application.
   *
   * @param options - The options for bootstrapping the application.
   *
   * @returns A promise which resolves when all bootstrapping work
   *   is complete and the shell is mounted to the DOM, or rejects
   *   with an error if the bootstrapping process fails.
   *
   * #### Notes
   * This should be called once by the application creator after all
   * initial providers and extensions have been registered.
   *
   * Bootstrapping the application consists of the following steps:
   * 1. Create the application shell
   * 2. Register the default providers
   * 3. Register the default extensions
   * 4. Resolve the application services
   * 5. Activate the initial extensions
   * 6. Attach the shell widget to the DOM
   * 7. Add the application event listeners
   */
  run(options: IApplicationRunOptions = {}): Promise<void> {
    // Resolve immediately if the application is already started.
    if (this._started) {
      return Promise.resolve<void>();
    }

    // Return the pending bootstrapping promise if it exists.
    if (this._promise) {
      return this._promise;
    }

    // Create the application shell.
    this._shell = this.createApplicationShell();

    // Register the default providers.
    this.registerDefaultProviders();

    // Register the default extensions.
    this.registerDefaultExtensions();

    // Resolve the application services.
    let promises = [
      this.resolveService(ABCCommandRegistry),
      this.resolveService(ABCPaletteRegistry),
      this.resolveService(ABCShortcutRegistry)
    ] as Promise<any>[];

    // Setup the promise for the rest of the bootstrapping.
    this._promise = Promise.all(promises).then(results => {

      // Store the resolved default services.
      this._commands = results[0] as ABCCommandRegistry;
      this._palette = results[1] as ABCPaletteRegistry;
      this._shortcuts = results[2] as ABCShortcutRegistry;

      // Compute the extension ids to activate.
      let extIDs: string[];
      let optVal = options.activateExtensions;
      if (optVal === true) {
        extIDs = this.listExtensions();
      } else if (optVal === false) {
        extIDs = [];
      } else if (optVal) {
        extIDs = optVal as string[];
      } else {
        extIDs = this.listExtensions();
      }

      // Activate the initial extensions.
      return Promise.all(extIDs.map(id => this.activateExtension(id)));

    }).then(() =>  {

      // Mark the application as started and clear the stored promise.
      this._promise = null;
      this._started = true;

      // Compute the id of the shell host node.
      let shellHostID = options.shellHostID || '';

      // Attach the application shell to the host node.
      this.attachApplicationShell(shellHostID);

      // Add the application event listeners.
      this.addEventsListeners();

    }).catch(error => {

      // Clear the stored promise.
      this._promise = null;

      // Rethrow the error to reject the promise.
      throw error;

    });

    // Return the pending bootstrapping promise.
    return this._promise;
  }

  /**
   * Handle the DOM events for the application.
   *
   * @param event - The DOM event sent to the application.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events registered for the application. It
   * should not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'resize':
      this.evtResize(event);
      break;
    case 'keydown':
      this.evtKeydown(event as KeyboardEvent);
      break;
    }
  }

  /**
   * Create the shell widget for the application.
   *
   * @returns An instance of an application shell.
   *
   * #### Notes
   * A subclass may reimplement this this method for a custom shell.
   */
  protected createApplicationShell(): ApplicationShell {
    return new ApplicationShell();
  }

  /**
   * Register the default service providers for the application.
   *
   * #### Notes
   * The default implementation of this method registers default
   * providers for the `ABCCommandRegistry`, `ABCPaletteRegistry`,
   * and `ABCShortcutRegistry` services, unless providers for these
   * services have already been registered.
   *
   * A subclass may reimplement this this method to register custom
   * default providers, but it should ensure that providers for the
   * default services are also registered.
   */
  protected registerDefaultProviders(): void {
    if (!this.hasProviderFor(ABCCommandRegistry)) {
      this.registerProvider(commandRegistryProvider);
    }
    if (!this.hasProviderFor(ABCShortcutRegistry)) {
      this.registerProvider(shortcutRegistryProvider);
    }
    if (!this.hasProviderFor(ABCPaletteRegistry)) {
      this.registerProvider(paletteRegistryProvider);
    }
  }

  /**
   * Register the default extensions for the application.
   *
   * #### Notes
   * The default implementation of this method is a no-op.
   *
   * A subclass may reimplement this method as needed.
   */
  protected registerDefaultExtensions(): void { }

  /**
   * Attach the application shell to the DOM.
   *
   * @param id - The id of the host node for shell, or `''`.
   *
   * #### Notes
   * If the id is not provided, the document body will be the host.
   *
   * A subclass may reimplement this method for custom attachment.
   */
  protected attachApplicationShell(id: string): void {
    this._shell.attach(id ? document.getElementById(id) : document.body);
  }

  /**
   * Add the application event listeners.
   *
   * #### Notes
   * The default implementation of this method listens for `'resize'`
   * and `'keydown'` events.
   *
   * A subclass may reimplement this method as needed.
   */
  protected addEventsListeners(): void {
    document.addEventListener('resize', this);
    document.addEventListener('keydown', this);
  }

  /**
   * A method invoked on a document `'resize'` event.
   *
   * #### Notes
   * The default implementation of this method updates the shell.
   *
   * A subclass may reimplement this method as needed.
   */
  protected evtResize(event: Event): void {
    this._shell.update();
  }

  /**
   * A method invoked on a document `'keydown'` event.
   *
   * #### Notes
   * The default implementation of this method invokes the key-down
   * processing method of the shortcut manager.
   *
   * A subclass may reimplement this method as needed.
   */
  protected evtKeydown(event: KeyboardEvent): void {
    this._shortcuts.processKeydownEvent(event);
  }

  private _started = false;
  private _promise: Promise<void> = null;
  private _shell: ApplicationShell = null;
  private _commands: ABCCommandRegistry = null;
  private _palette: ABCPaletteRegistry = null;
  private _shortcuts: ABCShortcutRegistry = null;
  private _services = new ServiceRegistry();
  private _extensions = new ExtensionRegistry<Application>();
}


/**
 * The namespace for the application private data.
 */
namespace Private {
  /**
   * Initialize an application with the given options object.
   */
  export
  function initFrom(app: Application, options: IApplicationOptions): void {
    let providers = options.providers || [];
    let extensions = options.extensions || [];
    providers.forEach(p => { app.registerProvider(p); });
    extensions.forEach(e => { app.registerExtension(e); });
  }
}
