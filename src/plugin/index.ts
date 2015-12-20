/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Container
} from 'phosphor-di';

import {
  Property
} from 'phosphor-properties';


/**
 * The interface which defines a Phosphide application plugin.
 *
 * #### Notes
 * Plugins are loaded in two phases: register and resolve. This allows
 * plugins to depend upon types implemented by other plugins, without
 * worrying about the order in which plugins are loaded.
 *
 * This interface can be easily implemented by a module which exports
 * the relevant functions.
 */
export
interface IPlugin {
  /**
   * The registration function for the plugin.
   *
   * @param container - The dependency injection container to use for
   *   registering the types provided by the plugin.
   *
   * #### Notes
   * This is the first phase of loading the plugin. The plugin should
   * register implementations of any external types which are consumed
   * by other parts of the application.
   *
   * If the plugin does not provide any external type implementations,
   * this function need not be defined.
   */
  register?(container: Container): void;

  /**
   * The resolver function for the plugin.
   *
   * @param container - The dependency injection container to use for
   *   resolving the types required by the plugin.
   *
   * @returns Void, or a promise which resolves when the plugin has
   *   finished resolving its required types.
   *
   * #### Notes
   * This is the second phase of loading the plugin. The plugin should
   * resolve the instances of the types it requires to begin operation.
   *
   * This will most commonly be defined by the application entry point,
   * or by plugins which act as independent entry points. If the plugin
   * does not act as an entry point, this function need not be defined.
   */
  resolve?(container: Container): void | Promise<void>;
}


/**
 * Load a collection of plugins for the application.
 *
 * @param container - The dependency injection container to use when
 *   loading the plugins.
 *
 * @param plugins - The plugins to load. A given plugin will only be
 *   loaded once for a specific container instance.
 *
 * @returns A promise which resolves when all plugins have been fully
 *   loaded, or rejects if an error occurs.
 */
export
function loadPlugins(container: Container, plugins: IPlugin[]): Promise<void> {
  // Lookup the plugin set for the container.
  let pluginSet = PluginPrivate.pluginSetProperty.get(container);

  // Filter for the new plugins.
  let newPlugins: IPlugin[] = [];
  for (let plugin of plugins) {
    if (plugin && !pluginSet.has(plugin)) {
      pluginSet.add(plugin);
      newPlugins.push(plugin);
    }
  }

  // Register the new plugins.
  for (let plugin of newPlugins) {
    if (plugin.register) {
      plugin.register(container);
    }
  }

  // Resolve the new plugins.
  let promises: Promise<void>[] = [];
  for (let plugin of newPlugins) {
    if (plugin.resolve) {
      let result = plugin.resolve(container);
      if (result) promises.push(result as Promise<void>);
    }
  }

  // Wait for the new plugins to finish.
  return Promise.all(promises).then(() => { });
}


/**
 * The namespace for the plugin private data.
 */
namespace PluginPrivate {
  /**
   * The property descriptor for a container's plugin set.
   */
  export
  const pluginSetProperty = new Property<Container, Set<IPlugin>>({
    name: 'pluginSet',
    create: () => new Set<IPlugin>(),
  });
}
