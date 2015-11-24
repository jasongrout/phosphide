import { ICommandMenuItem } from './menuiteminterface';
import { IDisposable } from 'phosphor-disposable';
import { IExtension } from 'phosphor-plugins';
/**
 * The interface required for `menus` extension points.
 */
export interface IMenuExtension {
    items: ICommandMenuItem[];
}
/**
 * Extension receiver for `menus:main`.
 */
export declare function receiveMain(extension: IExtension): IDisposable;
/**
 * Extension point initializer for `menus:main`.
 */
export declare function initializeMain(): Promise<IDisposable>;
