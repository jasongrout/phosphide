import { IDisposable } from 'phosphor-disposable';
import { Tab } from 'phosphor-tabs';
import { Widget } from 'phosphor-widget';
import { IExtension } from 'phosphor-plugins';
/**
 * The interface for `ui:items` extension point.
 */
export interface IItems {
    items: Widget[];
    tabs: Tab[];
}
/**
 * The receiver for the `ui:items` extension point.
 */
export declare function receiveItems(extension: IExtension<IItems>): IDisposable;
/**
 * The initializer for the `ui:items extension point.
 */
export declare function initialize(): Promise<IDisposable>;
