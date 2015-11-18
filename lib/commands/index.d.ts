import { IDisposable } from 'phosphor-disposable';
import { IExtension } from 'phosphor-plugins';
export interface ICommandExtension {
    id: string;
    caption: string;
    handler: () => void;
}
/**
 * The receiver for the `command:main` extension point.
 */
export declare function receiveMain(extension: IExtension<ICommandExtension>): IDisposable;
/**
 * The invoker for the `command:main` extension point.
 */
export declare function receiveInvoke(name: string): Promise<IDisposable>;
