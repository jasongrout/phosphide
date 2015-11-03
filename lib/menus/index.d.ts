import { ICommandMenuItem } from './menuiteminterface';
import { IExtension } from 'phosphor-plugins';
import { IDisposable } from 'phosphor-disposable';
export * from './menuiteminterface';
export * from './menumanagerinterface';
export * from './menusolver';
export * from './menusolverfunctions';
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
