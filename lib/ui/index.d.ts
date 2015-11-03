import { IDisposable } from 'phosphor-disposable';
import { Tab } from 'phosphor-tabs';
import { Widget } from 'phosphor-widget';
import { IExtension } from 'phosphor-plugins';
/**
 * The interface for `ui` extension point.
 */
export interface IUIExtension {
    items: Widget[];
    tabs: Tab[];
}
/**
 * The receiver for the `ui:main` extension point.
 */
export declare function receiveMain(extension: IExtension<IUIExtension>): IDisposable;
/**
 * The initializer for the `ui:main` extension point.
 */
export declare function initializeMain(): Promise<IDisposable>;
