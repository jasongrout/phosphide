import { ICommandMenuItem } from './menuiteminterface';
import { IExtension } from 'phosphor-plugins';
import { IDisposable } from 'phosphor-disposable';
/**
 * The interface required for `menu:items` extension point.
 */
export interface IItems {
    items: ICommandMenuItem[];
}
/**
 * Extension point receiver for `menu:items`.
 */
export declare function receiveItems(extension: IExtension<IItems>): IDisposable;
/**
 * Extension point initializer for `menu:items`.
 */
export declare function initialize(): Promise<IDisposable>;
