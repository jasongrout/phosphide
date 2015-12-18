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
 * A widget which displays titles a row of exclusive buttons.
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
    let buttons = SideBarPrivate.buttonsProperty.get(this);
    buttons.forEach(button => { button.dispose(); });
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
   * Get the number of title objects in the side bar.
   *
   * @returns The number of title objects in the side bar.
   */
  titleCount(): number {
    return SideBarPrivate.titlesProperty.get(this).length;
  }

  /**
   * Get the title object at the specified index.
   *
   * @param index - The index of the title object of interest.
   *
   * @returns The title at the specified index, or `undefined`.
   */
  titleAt(index: number): Title {
    return SideBarPrivate.titlesProperty.get(this)[index];
  }

  /**
   * Get the index of the specified title object.
   *
   * @param title - The title object of interest.
   *
   * @returns The index of the specified title, or `-1`.
   */
  titleIndex(title: Title): number {
    return SideBarPrivate.titlesProperty.get(this).indexOf(title);
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
   * @param title - The title object to insert into to the panel.
   *
   * #### Notes
   * If the title is already added to the side bar, it will be moved.
   */
  insertTitle(index: number, title: Title): void {
    let titles = SideBarPrivate.titlesProperty.get(this);
    let buttons = SideBarPrivate.buttonsProperty.get(this);
    let i = titles.indexOf(title);
    let j = Math.max(0, Math.min(index | 0, titles.length));
    if (i !== -1) {
      if (i < j) j--;
      if (i === j) return;
      arrays.move(titles, i, j);
      arrays.move(buttons, i, j);
      let btn = buttons[j];
      let ref = buttons[j + 1];
      this.contentNode.insertBefore(btn.node, ref && ref.node);
    } else {
      let btn = new SideBarButton(title);
      arrays.insert(titles, j, title);
      arrays.insert(buttons, j, btn);
      let ref = buttons[j + 1];
      this.contentNode.insertBefore(btn.node, ref && ref.node);
    }
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
    let titles = SideBarPrivate.titlesProperty.get(this);
    let i = arrays.remove(titles, title);
    if (i === -1) {
      return;
    }
    if (this.currentTitle === title) {
      this.currentTitle = null;
    }
    let buttons = SideBarPrivate.buttonsProperty.get(this);
    let btn = arrays.removeAt(buttons, i);
    this.contentNode.removeChild(btn.node);
    btn.dispose();
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
    let buttons = SideBarPrivate.buttonsProperty.get(this);
    let i = SideBarPrivate.findButton(buttons, event.clientX, event.clientY);
    if (i < 0) {
      return;
    }

    // Pressing on a button stops the event propagation.
    event.preventDefault();
    event.stopPropagation();

    // Update or toggle the current item.
    let btn = buttons[i];
    if (btn.title !== this.currentTitle) {
      this.currentTitle = btn.title;
    } else {
      this.currentTitle = null;
    }
  }
}


/**
 * An object which manages a button node for a side bar.
 */
class SideBarButton extends NodeWrapper implements IDisposable {
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
   * @param title - The title to associate with the button.
   */
  constructor(title: Title) {
    super();
    this.addClass(BUTTON_CLASS);
    this._title = title;

    this.textNode.textContent = title.text;
    if (title.icon) SideBarPrivate.exAddClass(this.iconNode, title.icon);
    if (title.className) SideBarPrivate.exAddClass(this.node, title.className);

    title.changed.connect(this._onTitleChanged, this);
  }

  /**
   * Dispose of the resources held by the button.
   */
  dispose(): void {
    this._title = null;
    clearSignalData(this);
  }

  /**
   * Test whether the button is disposed.
   */
  get isDisposed(): boolean {
    return this._title === null;
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
   * Get the title associated with the button.
   *
   * #### Notes
   * This is a read-only property.
   */
  get title(): Title {
    return this._title;
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
    if (args.oldValue) SideBarPrivate.exRemClass(node, args.oldValue);
    if (args.newValue) SideBarPrivate.exAddClass(node, args.newValue);
  }

  /**
   * A method invoked when the title class name changes.
   */
  private _onTitleClassNameChanged(args: IChangedArgs<string>): void {
    let node = this.node;
    if (args.oldValue) SideBarPrivate.exRemClass(node, args.oldValue);
    if (args.newValue) SideBarPrivate.exAddClass(node, args.newValue);
  }

  private _title: Title;
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
   * The property descriptor for the currently selected side bar title.
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
   * The property descriptor for the side bar titles.
   */
  export
  const titlesProperty = new Property<SideBar, Title[]>({
    name: 'titles',
    create: () => [],
  });

  /**
   * The property descriptor for the side bar buttons.
   */
  export
  const buttonsProperty = new Property<SideBar, SideBarButton[]>({
    name: 'buttons',
    create: () => [],
  });

  /**
   * Add a whitespace separated class name to the given node.
   */
  export
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
  export
  function exRemClass(node: HTMLElement, name: string): void {
    let list = node.classList;
    let parts = name.split(/\s+/);
    for (let i = 0, n = parts.length; i < n; ++i) {
      if (parts[i]) list.remove(parts[i]);
    }
  }

  /**
   * Perform a client position hit test on an array of buttons.
   *
   * Returns the index of the first matching button, or `-1`.
   */
  export
  function findButton(buttons: SideBarButton[], clientX: number, clientY: number): number {
    for (let i = 0, n = buttons.length; i < n; ++i) {
      if (hitTest(buttons[i].node, clientX, clientY)) return i;
    }
    return -1;
  }

  /**
   * The coerce handler for the `currentTitle` property.
   */
  function coerceCurrentTitle(owner: SideBar, value: Title): Title {
    return owner.titleIndex(value) !== -1 ? value : null;
  }

  /**
   * The change handler for the `currentTitle` property.
   */
  function onCurrentTitleChanged(owner: SideBar, old: Title, val: Title): void {
    let buttons = buttonsProperty.get(owner);
    let oldBtn = arrays.find(buttons, btn => btn.title === old);
    let newBtn = arrays.find(buttons, btn => btn.title === val);
    if (oldBtn) oldBtn.removeClass(CURRENT_CLASS);
    if (newBtn) newBtn.addClass(CURRENT_CLASS);
  }
}
