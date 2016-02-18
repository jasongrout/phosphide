/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays
  from 'phosphor-arrays';

import {
  hitTest
} from 'phosphor-domutil';

import {
  Message
} from 'phosphor-messaging';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Title, Widget
} from 'phosphor-widget';

import './sidebar.css';


/**
 * The class name added to SideBar instances.
 */
const SIDE_BAR_CLASS = 'p-SideBar';

/**
 * The class name added to the side bar content node.
 */
const CONTENT_CLASS = 'p-SideBar-content';

/**
 * The class name added to side bar button nodes.
 */
const BUTTON_CLASS = 'p-SideBar-button';

/**
 * The class name added to a side bar button text node.
 */
const TEXT_CLASS = 'p-SideBar-button-text';

/**
 * The class name added to a side bar button icon node.
 */
const ICON_CLASS = 'p-SideBar-button-icon';

/**
 * The class name added to the current side bar button.
 */
const CURRENT_CLASS = 'p-mod-current';


/**
 * A widget which displays titles as a row of exclusive buttons.
 */
export
class SideBar extends Widget {
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
    this._titles.length = 0;
    super.dispose();
  }

  /**
   * A signal emitted when the current side bar title is changed.
   */
  get currentChanged(): ISignal<SideBar, IChangedArgs<Title>> {
    return SideBarPrivate.currentChangedSignal.bind(this);
  }

  /**
   * Get the currently selected side bar title.
   */
  get currentTitle(): Title {
    return SideBarPrivate.currentTitleProperty.get(this);
  }

  /**
   * Set the currently selected side bar title.
   */
  set currentTitle(value: Title) {
    SideBarPrivate.currentTitleProperty.set(this, value);
  }

  /**
   * Get the content node which holds the side bar buttons.
   *
   * #### Notes
   * Modifying this node can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Get the number of title objects in the side bar.
   *
   * @returns The number of title objects in the side bar.
   */
  titleCount(): number {
    return this._titles.length;
  }

  /**
   * Get the title object at the specified index.
   *
   * @param index - The index of the title object of interest.
   *
   * @returns The title at the specified index, or `undefined`.
   */
  titleAt(index: number): Title {
    return this._titles[index];
  }

  /**
   * Get the index of the specified title object.
   *
   * @param title - The title object of interest.
   *
   * @returns The index of the specified title, or `-1`.
   */
  titleIndex(title: Title): number {
    return this._titles.indexOf(title);
  }

  /**
   * Add a title object to the end of the side bar.
   *
   * @param title - The title object to add to the side bar.
   *
   * #### Notes
   * If the title is already added to the side bar, it will be moved.
   */
  addTitle(title: Title): void {
    this.insertTitle(this.titleCount(), title);
  }

  /**
   * Insert a title object at the specified index.
   *
   * @param index - The index at which to insert the title.
   *
   * @param title - The title object to insert into to the side bar.
   *
   * #### Notes
   * If the title is already added to the side bar, it will be moved.
   */
  insertTitle(index: number, title: Title): void {
    let n = this.titleCount();
    let i = this.titleIndex(title);
    let j = Math.max(0, Math.min(index | 0, n));
    if (i !== -1) {
      if (j === n) j--;
      if (i === j) return;
      arrays.move(this._titles, i, j);
    } else {
      arrays.insert(this._titles, j, title);
      title.changed.connect(this._onTitleChanged, this);
    }
    this._dirty = true;
    this.update();
  }

  /**
   * Remove a title object from the side bar.
   *
   * @param title - The title object to remove from the side bar.
   *
   * #### Notes
   * If the title is not in the side bar, this is a no-op.
   */
  removeTitle(title: Title): void {
    let i = arrays.remove(this._titles, title);
    if (i === -1) {
      return;
    }
    title.changed.disconnect(this._onTitleChanged, this);
    if (this.currentTitle === title) this.currentTitle = null;
    this._dirty = true;
    this.update();
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
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this._dirty) {
      this._dirty = false;
      SideBarPrivate.updateButtons(this);
    } else {
      SideBarPrivate.updateCurrent(this);
    }
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
    let i = SideBarPrivate.hitTestButtons(this, event.clientX, event.clientY);
    if (i < 0) {
      return;
    }

    // Pressing on a button stops the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Update the current title.
    let title = this._titles[i];
    if (title !== this.currentTitle) {
      this.currentTitle = title;
    } else {
      this.currentTitle = null;
    }
  }

  /**
   * Handle the `changed` signal of a title object.
   */
  private _onTitleChanged(): void {
    this._dirty = true;
    this.update();
  }

  private _dirty = false;
  private _titles: Title[] = [];
}


/**
 * The namespace for the `SideBar` class private data.
 */
namespace SideBarPrivate {
  /**
   * A signal emitted when the current title is changed.
   */
  export
  const currentChangedSignal = new Signal<SideBar, IChangedArgs<Title>>();

  /**
   * The property descriptor for the current side bar title.
   */
  export
  const currentTitleProperty = new Property<SideBar, Title>({
    name: 'currentTitle',
    value: null,
    coerce: coerceCurrentTitle,
    changed: onCurrentTitleChanged,
    notify: currentChangedSignal,
  });

  /**
   * Update the side bar buttons to match the current titles.
   *
   * This is a full update which also updates the currrent state.
   */
  export
  function updateButtons(owner: SideBar): void {
    let count = owner.titleCount();
    let content = owner.contentNode;
    let children = content.children;
    while (children.length > count) {
      content.removeChild(content.lastChild);
    }
    while (children.length < count) {
      content.appendChild(createButtonNode());
    }
    for (let i = 0; i < count; ++i) {
      let node = children[i] as HTMLElement;
      updateButtonNode(node, owner.titleAt(i));
    }
    updateCurrent(owner);
  }

  /**
   * Update the current state of the buttons to match the side bar.
   *
   * This is a partial update which only updates the current button
   * class. It assumes the button count is the same as the title count.
   */
  export
  function updateCurrent(owner: SideBar): void {
    let count = owner.titleCount();
    let content = owner.contentNode;
    let children = content.children;
    let current = owner.currentTitle;
    for (let i = 0; i < count; ++i) {
      let node = children[i] as HTMLElement;
      if (owner.titleAt(i) === current) {
        node.classList.add(CURRENT_CLASS);
      } else {
        node.classList.remove(CURRENT_CLASS);
      }
    }
  }

  /**
   * Get the index of the button node at a client position, or `-1`.
   */
  export
  function hitTestButtons(owner: SideBar, x: number, y: number): number {
    let nodes = owner.contentNode.children;
    for (let i = 0, n = nodes.length; i < n; ++i) {
      if (hitTest(nodes[i] as HTMLElement, x, y)) return i;
    }
    return -1;
  }

  /**
   * The coerce handler for the `currentTitle` property.
   */
  function coerceCurrentTitle(owner: SideBar, value: Title): Title {
    return (value && owner.titleIndex(value) !== -1) ? value : null;
  }

  /**
   * The change handler for the `currentTitle` property.
   */
  function onCurrentTitleChanged(owner: SideBar): void {
    owner.update();
  }

  /**
   * Create an uninitialized DOM node for a side bar button.
   */
  function createButtonNode(): HTMLElement {
    let node = document.createElement('li');
    let icon = document.createElement('span');
    let text = document.createElement('span');
    text.className = TEXT_CLASS;
    node.appendChild(icon);
    node.appendChild(text);
    return node;
  }

  /**
   * Update a button node to reflect the state of a title.
   */
  function updateButtonNode(node: HTMLElement, title: Title): void {
    let icon = node.firstChild as HTMLElement;
    let text = node.lastChild as HTMLElement;
    if (title.className) {
      node.className = BUTTON_CLASS + ' ' + title.className;
    } else {
      node.className = BUTTON_CLASS;
    }
    if (title.icon) {
      icon.className = ICON_CLASS + ' ' + title.icon;
    } else {
      icon.className = ICON_CLASS;
    }
    text.textContent = title.text;
  }
}
