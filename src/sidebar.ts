/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

import {
  IDisposable
} from 'phosphor-disposable';

import {
  hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  NodeWrapper
} from 'phosphor-nodewrapper';

import {
  IListChangedArgs, IObservableList, ListChangeType
} from 'phosphor-observablelist';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal, clearSignalData
} from 'phosphor-signaling';

import {
  Title, Widget
} from 'phosphor-widget';


/**
 * The class name added to SideBar instances.
 */
const SIDE_BAR_CLASS = 'p-SideBar';

/**
 * The class name added to the side bar content node.
 */
const CONTENT_CLASS = 'p-SideBar-content';

/**
 * The class name added to SideBarButton instances.
 */
const BUTTON_CLASS = 'p-SideBarButton';

/**
 * The class name added to a button text node.
 */
const TEXT_CLASS = 'p-SideBarButton-text';

/**
 * The class name added to a button icon node.
 */
const ICON_CLASS = 'p-SideBarButton-icon';

/**
 * The class name added to the current side bar button.
 */
const CURRENT_CLASS = 'p-mod-current';


/**
 * An object which can be added to a side bar.
 */
export
interface ISideBarItem {
  /**
   * The title object which provides data for the item's button.
   *
   * #### Notes
   * This should be a read-only property.
   */
  title: Title;
}


/**
 * A widget which displays its items as a list of exclusive buttons.
 */
export
class SideBar<T extends ISideBarItem> extends Widget {
  /**
   * Create the DOM node for a side bar.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('ul');
    content.className = CONTENT_CLASS;
    node.appendChild(content);
    return node;
  }

  /**
   * The property descriptor for the currently selected side bar item.
   *
   * **See also:** [[currentItem]]
   */
  static currentItemProperty = new Property<SideBar<ISideBarItem>, ISideBarItem>({
    name: 'currentItem',
    value: null,
    coerce: (owner, value) => owner._coerceCurrentItem(value),
    changed: (owner, old, value) => { owner._onCurrentItemChanged(old, value); },
    notify: new Signal<SideBar<ISideBarItem>, IChangedArgs<ISideBarItem>>(),
  });

  /**
   * The property descriptor for the observable list of side bar items.
   *
   * **See also:** [[items]]
   */
  static itemsProperty = new Property<SideBar<ISideBarItem>, IObservableList<ISideBarItem>>({
    name: 'items',
    value: null,
    coerce: (owner, value) => value || null,
    changed: (owner, old, value) => { owner._onItemsChanged(old, value); },
  });

  /**
   * Construct a new side bar.
   */
  constructor() {
    super();
    this.addClass(SIDE_BAR_CLASS);
  }

  /**
   * Dispose of the resources held by the widget.
   */
  dispose(): void {
    this._buttons.forEach(btn => { btn.dispose(); });
    this._buttons.length = 0;
    super.dispose();
  }

  /**
   * Get the currently selected side bar item.
   *
   * #### Notes
   * This is a pure delegate to the [[currentItemProperty]].
   */
  get currentItem(): T {
    return SideBar.currentItemProperty.get(this) as T;
  }

  /**
   * Set the currently selected side bar item.
   *
   * #### Notes
   * This is a pure delegate to the [[currentItemProperty]].
   */
  set currentItem(value: T) {
    SideBar.currentItemProperty.set(this, value);
  }

  /**
   * A signal emitted when the current side bar item is changed.
   *
   * #### Notes
   * This is the notify signal for the [[currentItemProperty]].
   */
  get currentItemChanged(): ISignal<SideBar<T>, IChangedArgs<T>> {
    return SideBar.currentItemProperty.notify.bind(this);
  }

  /**
   * Get the list of side bar items for the side bar.
   *
   * #### Notes
   * This is a pure delegate to the [[itemsProperty]].
   */
  get items(): IObservableList<T> {
    return SideBar.itemsProperty.get(this) as IObservableList<T>;
  }

  /**
   * Set the list side bar items for the side bar.
   *
   * #### Notes
   * This is a pure delegate to the [[itemsProperty]].
   */
  set items(value: IObservableList<T>) {
    SideBar.itemsProperty.set(this, value);
  }

  /**
   * Get the side bar content node.
   *
   * #### Notes
   * This is the node which holds the side bar button nodes. Modifying
   * the content of this node indiscriminately can lead to undesired
   * behavior.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Handle the DOM events for the side bar.
   *
   * @param event - The DOM event sent to the side bar.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the side bar's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    if (event.type === 'mousedown') {
      this._evtMouseDown(event as MouseEvent);
    }
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('mousedown', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
  }

  /**
   * Handle the `'mousedown'` event for the side bar.
   */
  private _evtMouseDown(event: MouseEvent): void {
    // Do nothing if it's not a left mouse press.
    if (event.button !== 0) {
      return;
    }

    // Do nothing if the press is not on a button.
    let index = hitTestButtons(this._buttons, event.clientX, event.clientY);
    if (index < 0) {
      return;
    }

    // Pressing on a button stops the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Update or toggle the current item.
    let btn = this._buttons[index];
    if (btn.item !== this.currentItem) {
      this.currentItem = btn.item;
    } else {
      this.currentItem = null;
    }
  }

  /**
   * The coerce handler for the [[currentItemProperty]].
   */
  private _coerceCurrentItem(item: T): T {
    let list = this.items;
    return (item && list && list.contains(item)) ? item : null;
  }

  /**
   * The change handler for the [[currentItemProperty]].
   */
  private _onCurrentItemChanged(oldItem: T, newItem: T): void {
    let oldBtn = arrays.find(this._buttons, btn => btn.item === oldItem);
    let newBtn = arrays.find(this._buttons, btn => btn.item === newItem);
    if (oldBtn) oldBtn.removeClass(CURRENT_CLASS);
    if (newBtn) newBtn.addClass(CURRENT_CLASS);
  }

  /**
   * The change handler for the [[itemsProperty]].
   */
  private _onItemsChanged(oldList: IObservableList<T>, newList: IObservableList<T>): void {
    // Disconnect the old list and dispose the old buttons.
    if (oldList) {
      oldList.changed.disconnect(this._onItemsListChanged, this);
      let content = this.contentNode;
      while (this._buttons.length) {
        let btn = this._buttons.pop();
        content.removeChild(btn.node);
        btn.dispose();
      }
    }

    // Create the new buttons and connect the new list.
    if (newList) {
      let content = this.contentNode;
      for (let i = 0, n = newList.length; i < n; ++i) {
        let btn = new SideBarButton(newList.get(i));
        content.appendChild(btn.node);
        this._buttons.push(btn);
      }
      newList.changed.connect(this._onItemsListChanged, this);
    }

    // Reset the current item to null.
    this.currentItem = null;
  }

  /**
   * The change handler for the items list `changed` signal.
   */
  private _onItemsListChanged(sender: IObservableList<T>, args: IListChangedArgs<T>): void {
    switch (args.type) {
    case ListChangeType.Add:
      this._onItemsListAdd(args);
      break;
    case ListChangeType.Move:
      this._onItemsListMove(args);
      break;
    case ListChangeType.Remove:
      this._onItemsListRemove(args);
      break;
    case ListChangeType.Replace:
      this._onItemsListReplace(args);
      break;
    case ListChangeType.Set:
      this._onItemsListSet(args);
      break;
    }
  }

  /**
   * The handler invoked on a items list change of type `Add`.
   */
  private _onItemsListAdd(args: IListChangedArgs<T>): void {
    // Create the button for the new side bar item.
    let btn = new SideBarButton(args.newValue as T);

    // Add the button to the same location in the internal array.
    arrays.insert(this._buttons, args.newIndex, btn);

    // Lookup the next sibling reference.
    let ref = this._buttons[args.newIndex + 1];

    // Add the button node to the DOM before its next sibling.
    this.contentNode.insertBefore(btn.node, ref && ref.node);
  }

  /**
   * The handler invoked on a items list change of type `Move`.
   */
  private _onItemsListMove(args: IListChangedArgs<T>): void {
    // Move the button in the internal array.
    arrays.move(this._buttons, args.oldIndex, args.newIndex);

    // Lookup the target button.
    let btn = this._buttons[args.newIndex];

    // Lookup the next sibling reference.
    let ref = this._buttons[args.newIndex + 1];

    // Move the button in the DOM before its next sibling.
    this.contentNode.insertBefore(btn.node, ref && ref.node);
  }

  /**
   * The handler invoked on an items list change of type `Remove`.
   */
  private _onItemsListRemove(args: IListChangedArgs<T>): void {
    // Remove the button from the internal array.
    let btn = arrays.removeAt(this._buttons, args.oldIndex);

    // Remove the button node from the DOM.
    this.contentNode.removeChild(btn.node);

    // Clear the current item if it was removed.
    if (this.currentItem === btn.item) {
      this.currentItem = null;
    }

    // Dispose of the old button.
    btn.dispose();
  }

  /**
   * The handler invoked on a items list change of type `Replace`.
   */
  private _onItemsListReplace(args: IListChangedArgs<T>): void {
    // Create the new buttons for the new side bar items.
    let newItems = args.newValue as T[];
    let newBtns = newItems.map(item => new SideBarButton(item));

    // Replace the buttons in the internal array.
    let oldItems = args.oldValue as T[];
    let oldBtns = this._buttons.splice(args.newIndex, oldItems.length, ...newBtns);

    // Remove the old buttons from the DOM.
    let content = this.contentNode;
    oldBtns.forEach(btn => { content.removeChild(btn.node); });

    // Lookup the next sibiling reference.
    let ref = this._buttons[args.newIndex + newBtns.length];
    let refNode = ref && ref.node;

    // Add the new buttons to the DOM before the next sibling.
    newBtns.forEach(btn => { content.insertBefore(btn.node, refNode); });

    // Clear the current item if it was removed.
    if (oldItems.indexOf(this.currentItem) !== -1) {
      this.currentItem = null;
    }

    // Dispose of the old buttons.
    oldBtns.forEach(btn => { btn.dispose(); });
  }

  /**
   * The handler invoked on a items list change of type `Set`.
   */
  private _onItemsListSet(args: IListChangedArgs<T>): void {
    // If the item was not actually changed, there is nothing to do.
    if (args.oldValue === args.newValue) {
      return;
    }

    // Create the button for the new side bar item.
    let newBtn = new SideBarButton(args.newValue as T);

    // Swap the new button in the internal array.
    let oldBtn = this._buttons[args.newIndex];
    this._buttons[args.newIndex] = newBtn;

    // Swap the new button node in the DOM.
    this.contentNode.replaceChild(newBtn.node, oldBtn.node);

    // Clear the current item if it was removed.
    if (this.currentItem === oldBtn.item) {
      this.currentItem = null;
    }

    // Dispose of the old button.
    oldBtn.dispose();
  }

  private _buttons: SideBarButton<T>[] = [];
}


/**
 * An object which manages a button node for a side bar.
 */
class SideBarButton<T extends ISideBarItem> extends NodeWrapper implements IDisposable {
  /**
   * Create the DOM node for a side bar button.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('li');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    icon.className = ICON_CLASS;
    text.className = TEXT_CLASS;
    node.appendChild(icon);
    node.appendChild(text);
    return node;
  }

  /**
   * Construct a new side bar button.
   *
   * @param item - The side bar item to associate with the button.
   */
  constructor(item: T) {
    super();
    this.addClass(BUTTON_CLASS);
    this._item = item;

    let title = item.title;
    this.textNode.textContent = title.text;
    if (title.icon) exAddClass(this.iconNode, title.icon);
    if (title.className) exAddClass(this.node, title.className);

    title.changed.connect(this._onTitleChanged, this);
  }

  /**
   * Dispose of the resources held by the button.
   */
  dispose(): void {
    this._item = null;
    clearSignalData(this);
  }

  /**
   * Test whether the button is disposed.
   */
  get isDisposed(): boolean {
    return this._item === null;
  }

  /**
   * Get the icon node for the button.
   *
   * #### Notes
   * This is a read-only property.
   */
  get iconNode(): HTMLElement {
    return this.node.childNodes[0] as HTMLElement;
  }

  /**
   * Get the text node for the button.
   *
   * #### Notes
   * This is a read-only property.
   */
  get textNode(): HTMLElement {
    return this.node.childNodes[1] as HTMLElement;
  }

  /**
   * Get the side bar item associated with the button.
   *
   * #### Notes
   * This is a read-only property.
   */
  get item(): T {
    return this._item;
  }

  /**
   * The handler for the title `changed` signal.
   */
  private _onTitleChanged(sender: Title, args: IChangedArgs<any>): void {
    switch (args.name) {
    case 'text':
      this._onTitleTextChanged(args as IChangedArgs<string>);
      break;
    case 'icon':
      this._onTitleIconChanged(args as IChangedArgs<string>);
      break;
    case 'className':
      this._onTitleClassNameChanged(args as IChangedArgs<string>);
      break;
    }
  }

  /**
   * A method invoked when the title text changes.
   */
  private _onTitleTextChanged(args: IChangedArgs<string>): void {
    this.textNode.textContent = args.newValue;
  }

  /**
   * A method invoked when the title icon changes.
   */
  private _onTitleIconChanged(args: IChangedArgs<string>): void {
    let node = this.iconNode;
    if (args.oldValue) exRemClass(node, args.oldValue);
    if (args.newValue) exAddClass(node, args.newValue);
  }

  /**
   * A method invoked when the title class name changes.
   */
  private _onTitleClassNameChanged(args: IChangedArgs<string>): void {
    let node = this.node;
    if (args.oldValue) exRemClass(node, args.oldValue);
    if (args.newValue) exAddClass(node, args.newValue);
  }

  private _item: T;
}


// TODO - move `exAddClass` and `exRemClass` to `phosphor-domutil`?

/**
 * Add a whitespace separated class name to the given node.
 */
function exAddClass(node: HTMLElement, name: string): void {
  let list = node.classList;
  let parts = name.split(/\s+/);
  for (let i = 0, n = parts.length; i < n; ++i) {
    if (parts[i]) list.add(parts[i]);
  }
}


/**
 * Remove a whitespace separated class name to the given node.
 */
function exRemClass(node: HTMLElement, name: string): void {
  let list = node.classList;
  let parts = name.split(/\s+/);
  for (let i = 0, n = parts.length; i < n; ++i) {
    if (parts[i]) list.remove(parts[i]);
  }
}


/**
 * Perform a client position hit test on an array of side bar buttons.
 *
 * Returns the index of the first matching button, or `-1`.
 */
function hitTestButtons(buttons: SideBarButton<ISideBarItem>[], clientX: number, clientY: number): number {
  for (let i = 0, n = buttons.length; i < n; ++i) {
    if (hitTest(buttons[i].node, clientX, clientY)) return i;
  }
  return -1;
}
