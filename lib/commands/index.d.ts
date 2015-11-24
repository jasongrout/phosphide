import { IDisposable } from 'phosphor-disposable';
import { IExtension } from 'phosphor-plugins';
/**
 * The extension interface to be used for commands.
 */
export interface ICommandExtension {
    /**
     * The unique identifier for the command.
     */
    id: string;
    /**
     * The human readable string to clarify the functionality.
     */
    caption: string;
    /**
     * The callable which performs the command action.
     */
    handler: () => void;
}
/**
 * The receiver for the `command:main` extension point.
 */
export declare function receiveMain(extension: IExtension): IDisposable;
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
