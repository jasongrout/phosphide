import { IDisposable } from 'phosphor-disposable';
import { MenuItem } from 'phosphor-menus';
import { IExtension } from 'phosphor-plugins';
import { ICommandMenuItem } from '../menus/menuiteminterface.ts';
export interface ICommandExtension {
    id: string;
    caption: string;
    handler: () => void;
}
/**
 * A menu item which takes a command name to be fired when selected.
 */
export declare class CommandMenuItem extends MenuItem {
    /**
     * Construct a command menu item.
     */
    constructor(options?: ICommandMenuItem);
    private _command;
}
/**
 * The receiver for the `command:main` extension point.
 */
export declare function receiveMain(extension: IExtension<ICommandExtension>): IDisposable;
/**
 * The initializer for the `command:main` extension point.
 */
export declare function initializeMain(): Promise<IDisposable>;
/**
 * The invoker for the `command:invoke` extension point.
 */
export declare function receiveInvoke(name: string): Promise<IDisposable>;
/**
 * The initializer for the `command:invoke` extension point.
 *
 * #### Notes
 * This is a no-op, and shouldn't be required.
 */
export declare function initializeInvoker(): Promise<IDisposable>;
