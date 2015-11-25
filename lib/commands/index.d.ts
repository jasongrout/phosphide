import { IReceiver } from 'phosphor-plugins';
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
export declare function createCommandReceiver(): IReceiver;
