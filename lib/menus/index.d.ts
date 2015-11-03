import { ICommandMenuItem } from './menuiteminterface';
import { IExtension } from 'phosphor-plugins';
import { IDisposable } from 'phosphor-disposable';
/**
 * The interface required for `menus` extension points.
 */
export interface IMenuExtension {
    items: ICommandMenuItem[];
}
/**
 * Extension receiver for `menus:main`.
 */
export declare function receiveMain(extension: IExtension<IMenuExtension>): IDisposable;
/**
 * Extension point initializer for `menus:main`.
 */
export declare function initializeMain(): Promise<IDisposable>;
