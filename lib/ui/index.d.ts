import { IDisposable } from 'phosphor-disposable';
import { Tab } from 'phosphor-tabs';
import { Widget } from 'phosphor-widget';
import { IExtension } from 'phosphor-plugins';
/**
 * The interface that must be adhered to in order to interact
 * with the DockAreaExtensionPoint.
 */
export interface IItems {
    items: Widget[];
    tabs: Tab[];
}
export declare function receiveItems(extension: IExtension<IItems>): IDisposable;
export declare function initialize(): Promise<IDisposable>;
