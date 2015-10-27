/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var menusolverfunctions_1 = require('./menusolverfunctions');
var phosphor_menus_1 = require('phosphor-menus');
/**
 * A class to solve the relationships between menu items and allow custom
 * menu creation.
 */
var MenuSolver = (function () {
    function MenuSolver() {
    }
    /**
     * We use topsort (topological sorting) to find the order of menu items
     * based on their names and constraints.
     * The constrains form dependencies (Before(y) means directed edge x->y)
     * and therefore we can use topsort to find a suitable order. We won't
     * use a full DAG topsort; we only solve one level of the menu at a
     * time because the menu is just a simple tree, for which we need the
     * results one branch at a time.
     */
    MenuSolver.solve = function (items) {
        /**
         * The very top level of a menu is a MenuBar which contains menu items.
         * Below this, everything is a MenuItem, either with 'text' and 'submenu'
         * (submenu contains a Menu() with a list of MenuItems) if it's not a
         * leaf node, or 'text' and 'shortcut' if it is a leaf node.
         * We therefore explicitly create the top-level here, and recursively
         * solve for the rest inside partialSolve.
         *
         * We could alternatively build this menu by putting an instance of a
         * solver at each non-leaf node in the tree to solve for its
         * children. I stayed away from that implementation because
         * it will clearly use more memory than a single solver solution; if
         * the performance of this version is sufficient, there's no need for
         * the more complex one.
         */
        var topLevel = menusolverfunctions_1.partialSolve(items, []);
        var menuBar = new phosphor_menus_1.MenuBar();
        menuBar.items = topLevel;
        return menuBar;
    };
    return MenuSolver;
})();
exports.MenuSolver = MenuSolver;
//# sourceMappingURL=menusolver.js.map