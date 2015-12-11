/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';


/**
 *
 */
export
function loadExtensions(paths: string[]): Promise<void> {
  let imports = paths.map(path => System.import(path));
  return Promise.all(imports).then(bootstrap);
}


/**
 *
 */
function bootstrap(extensions: any[]): Promise<void> {
  extensions.forEach(register);
  let results = extensions.map(resolve);
  return Promise.all(results).then(() => { });
}


/**
 *
 */
function register(extension: any): void {
  if (extension && typeof extension.register === 'function') {
    extension.register();
  }
}


/**
 *
 */
function resolve(extension: any): any {
  if (extension && typeof extension.resolve === 'function') {
    return extension.resolve();
  }
  return null;
}
