import { IReceiver } from 'phosphor-plugins';
import { Tab } from 'phosphor-tabs';
import { Widget } from 'phosphor-widget';
/**
 * The interface for `ui` extension point.
 */
export interface IUIExtension {
    items: Widget[];
    tabs: Tab[];
}
/**
 * The factory function for the `ui:main` extension point.
 */
export declare function createUIReceiver(): IReceiver;
