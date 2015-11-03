import { ICommandMenuItem } from './menuiteminterface';
import { IDisposable } from 'phosphor-disposable';
import { MenuBar } from 'phosphor-menus';
import { ISignal } from 'phosphor-signaling';
/**
 * MenuManager stores the existing registered menu names, and presents
 * information about this menu system to other parts of the application,
 * such as the UI generation code.
 *
 * #### Notes
 * This is *not* a singleton, and should not be treated as such.
 * We should have, and expect to have, multiple menu managers around
 * the application, for example there may be a manager per context menu.
 */
export interface IMenuManager {
    /**
     * Signal emitted when the menu is updated.
     */
    menuUpdated: ISignal<IMenuManager, MenuBar>;
    /**
     * All currently registered menu items.
     *
     * #### Notes
     * This is a ready-only property
     * There is no guarantee that the objects returned here are the same
     * as the ones registered using registerMenuItem - that's implementation-
     * specific, and should *not* be relied upon.
     */
    allMenuItems: ICommandMenuItem[];
    /**
     * Registers a menu item with the manager.
     */
    add(items: ICommandMenuItem[]): IDisposable;
}
