import { ICommandMenuItem } from './menuiteminterface';
import { IReceiver } from 'phosphor-plugins';
/**
 * The interface required for `menus` extension points.
 */
export interface IMenuExtension {
    items: ICommandMenuItem[];
}
/**
 * Create menu receiver
 */
export declare function createMenuReceiver(): IReceiver;
