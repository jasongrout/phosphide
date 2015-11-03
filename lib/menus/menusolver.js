/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';
var phosphor_menus_1 = require('phosphor-menus');
var phosphor_topsort_1 = require('phosphor-topsort');
/**
 * Solve the relationships between menu items and allow custom menu creation.
 *
 * #### Notes
 * We use topsort (topological sorting) to find the order of menu items
 * based on their names and constraints.
 * The constrains form dependencies (Before(y) means directed edge x->y)
 * and therefore we can use topsort to find a suitable order. We won't
 * use a full DAG topsort; we only solve one level of the menu at a
 * time because the menu is just a simple tree, for which we need the
 * results one branch at a time.
 */
function solveMenu(items) {
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
    return partialSolve(items, []);
}
exports.solveMenu = solveMenu;
/**
 * Flattens a shallow-nested array-of-arrays into a single array
 * with all elements.
 *
 * #### Examples
 * ```typescript
 * let data = [[1],[2],[3,4]];
 * shallowFlatten(data); // [1,2,3,4]
 * ```
 * or with strings:
 * ```typescript
 * let data = [['a'],['b'],['c','d']];
 * shallowFlatten(data); // ['a','b','c','d']
 * ```
 *
 * #### Notes
 *
 * This is called `shallowFlatten` because it will not flatten arrays
 * to arbitrary levels of nesting, this only works 2 levels deep. This
 * is sufficient for topsort as we're only dealing with edge lists.
 */
function shallowFlatten(nested) {
    return [].concat.apply([], nested);
}
/**
 * When combined with filter, returns the unique items in a flattened array.
 *
 * #### Examples
 * ```typescript
 * let data = [1,2,3,1];
 * testData.filter(unique); // [1,2,3]
 * ```
 */
function unique(val, i, self) {
    return self.indexOf(val) === i;
}
/**
 * Takes an item and returns the location with the item attached as 'menuItem'
 */
function itemTranspose(item) {
    var ret = item.location;
    ret.menuItem = item;
    return ret;
}
/**
 * Takes a transposed menu item and builds a phosphor MenuItem object for
 * direct use in the menus.
 */
function buildItem(item) {
    return new phosphor_menus_1.MenuItem({
        text: item[item.length - 1],
        shortcut: item.menuItem.shortcut
    });
}
/**
 * Builds a phosphor submenu (an array of menu items inside a Menu object)
 * from the items passed in and the text string for this MenuItem.
 */
function buildSubmenu(items, text) {
    var menuObj = new phosphor_menus_1.Menu();
    menuObj.items = items;
    return new phosphor_menus_1.MenuItem({ text: text, submenu: menuObj });
}
/**
 * Returns true if the arrays are equal, false otherwise.
 */
function arrayEquality(a, b) {
    return (a.length === b.length) && a.every(function (x, y) {
        return x === b[y];
    });
}
/**
 * Returns the all the items at a given level in the tree.
 *
 * #### Notes
 * This currently iterates over the items array twice; once for the map
 * and once for the filter. It would be nice to reduce this to a single
 * iteration, if we can do it without obscuring what's really going on.
 */
function getItemsAtLevel(items, level) {
    var num = level.length;
    return items
        .map(function (val) {
        var vloc = val.location;
        if ((vloc.length > num) && arrayEquality(vloc.slice(0, num), level)) {
            vloc.menuItem = val;
            return vloc;
        }
    })
        .filter(function (val) { return val !== undefined; });
}
/**
 * Tests whether the initial values in the given item match the ones in the
 * prefix argument. Essentially 'is this menu item in this part of the tree?'.
 */
function matchesPrefix(prefix, item) {
    return item.length >= prefix.length && arrayEquality(item.slice(0, prefix.length), prefix);
}
/**
 * Returns items that are in 'first' but not 'second' array. This is not symmetric.
 */
function difference(first, second) {
    return first.filter(function (i) { return second.indexOf(i) < 0; });
}
/**
 * Returns the constraints for all items at a given level in the
 * tree.
 *
 * Eg. if the constraints for ['File','New','Document'] include
 * 'file': before('edit'), 'new': before('open'), then
 * the constraints at level 0 will be ['File','Edit'], and the
 * constraints at level 1 will be ['New', 'Open']
 */
function getConstraintsAtLevel(item, level) {
    var constraints = [];
    var menuItem = (item).menuItem;
    var levelText = menuItem.location[level];
    if (menuItem.constraints === undefined) {
        return constraints;
    }
    var cons = menuItem.constraints[levelText];
    if (cons) {
        for (var c = 0; c < cons.length; ++c) {
            constraints.push(cons[c].constrain(levelText));
        }
    }
    return constraints;
}
/**
 * Returns the constraints as an unordered array of directed edges for the objects
 * in the level of the tree at 'prefix', for every item in 'items'.
 */
function getConstraints(items, prefix) {
    var constraints = [];
    for (var i = 0; i < items.length; ++i) {
        if (matchesPrefix(prefix, items[i])) {
            var allCons = getConstraintsAtLevel(items[i], prefix.length);
            allCons.map(function (x) { constraints.push(x); });
        }
    }
    // The constraints array is now the list of edges defined by the constraints
    // on this menu system. However it does not take care of items which are in
    // the menu system, but are unconstrained.
    // In order to have a reliable, consistent mechanism for forming menus, we
    // therefore find all the items which have no constraints defined, and use
    // their position in the menu declaration to define their constraints.
    // This allows the user to only define constraints for the first item, and 
    // the rest will automatically fall into place, if defined in the required
    // order.
    // var flattened = shallowFlatten(constraints);
    // var allConstrained = flattened.filter(unique);
    // var unconstrained = difference(allItems, allConstrained);
    // unconstrained.sort();
    // for (var i=0; i<unconstrained.length - 1; i++) {
    //   constraints.push([unconstrained[i], unconstrained[i + 1]]);
    // }
    // TODO : do this properly - should be based on position defined.
    return constraints;
}
/**
 * Takes a list of IMenuItems and a prefix and returns a fully formed menu for
 * all objects below that tree level.
 */
function partialSolve(items, prefix) {
    var menuItems = [];
    var levelItems = getItemsAtLevel(items, prefix);
    // TODO : don't need to sort at every level, can just sort once at the top,
    // or require the items to be sorted before calling partialSolve.
    levelItems.sort();
    var startIdx = 0;
    var endIdx = 0;
    var preLen = prefix.length;
    while (endIdx < levelItems.length) {
        var currentVal = levelItems[startIdx];
        // This is the real centre of the menu solver - 
        // if the prefix passed in is one less than the location length, then this
        // is a leaf node, so we build a menu item and push it onto the array (order
        // solving is done later). If the location length is longer than (prefix
        // length +1), then this is an intermediate node which has its own submenu.
        // In the latter case we recursively call partialSolve with a new prefix
        // containing the intermediate level.
        // That partialSolve clearly returns a built menu with the items at theat level,
        // so we just append that to our current array.
        if (levelItems[endIdx].length === preLen + 1) {
            menuItems.push(buildItem(levelItems[endIdx]));
            endIdx++;
            startIdx = endIdx;
        }
        else {
            // iterate over all the items at this level in the tree
            // take prefix length, use that as index into levelItems[endIdx]
            var match = levelItems[endIdx][preLen];
            while (levelItems[endIdx] && levelItems[endIdx][preLen] === match) {
                endIdx++;
            }
            var subItems = levelItems.slice(startIdx, endIdx).map(function (val) {
                return val.menuItem;
            });
            var submenu = partialSolve(subItems, currentVal.slice(0, preLen + 1));
            var menuObj = buildSubmenu(submenu, currentVal[preLen]);
            menuItems.push(menuObj);
            startIdx = endIdx;
            endIdx++;
        }
    }
    // At this point we have a fully formed menu for the 'prefix' level in the tree.
    // All we do now is sort based on the constraints given for all menu items
    // *at this level or below*.
    var order = phosphor_topsort_1.TopSort.sort(getConstraints(levelItems, prefix));
    menuItems.sort(function (a, b) {
        return order.indexOf(a.text) - order.indexOf(b.text);
    });
    return menuItems;
}
