import { ICommandMenuItem } from './menuiteminterface';
import { MenuBar } from 'phosphor-menus';
/**
 * A class to solve the relationships between menu items and allow custom
 * menu creation.
 */
export declare class MenuSolver {
    /**
     * We use topsort (topological sorting) to find the order of menu items
     * based on their names and constraints.
     * The constrains form dependencies (Before(y) means directed edge x->y)
     * and therefore we can use topsort to find a suitable order. We won't
     * use a full DAG topsort; we only solve one level of the menu at a
     * time because the menu is just a simple tree, for which we need the
     * results one branch at a time.
     */
    static solve(items: ICommandMenuItem[]): MenuBar;
}
