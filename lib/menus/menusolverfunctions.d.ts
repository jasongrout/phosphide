import { ICommandMenuItem } from './menuiteminterface';
import { MenuItem } from 'phosphor-menus';
/**
 * Flattens a shallow-nested array-of-arrays into a single array
 * with all elements.
 *
 * #### Examples
 * ```typescript
 * var data = [[1],[2],[3,4]];
 * shallowFlatten(data); // [1,2,3,4]
 * ```
 * or with strings:
 * ```typescript
 * var data = [['a'],['b'],['c','d']];
 * shallowFlatten(data); // ['a','b','c','d']
 * ```
 *
 * #### Notes
 *
 * This is called `shallowFlatten` because it will not flatten arrays
 * to arbitrary levels of nesting, this only works 2 levels deep. This
 * is sufficient for topsort as we're only dealing with edge lists.
 */
export declare function shallowFlatten(nested: any): any;
/**
 * When combined with filter, returns the unique items in a flattened array.
 *
 * #### Examples
 * ```typescript
 * var data = [1,2,3,1];
 * testData.filter(unique); // [1,2,3]
 * ```
 */
export declare function unique<T>(val: T, i: number, self: any): boolean;
/**
 * Takes a list of IMenuItems and a prefix and returns a fully formed menu for
 * all objects below that tree level.
 */
export declare function partialSolve(items: ICommandMenuItem[], prefix: string[]): MenuItem[];
