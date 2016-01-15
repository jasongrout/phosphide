/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import * as arrays from 'phosphor-arrays';

import {
  ICommand
} from 'phosphor-command';

import {
  IDisposable, DisposableDelegate
} from 'phosphor-disposable';

import {
  Message
} from 'phosphor-messaging';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Widget
} from 'phosphor-widget';

import {
  ICommandItem, ICommandRegistry
} from '../commandregistry/index';

import {
  ICommandPalette, ICommandPaletteItem, ICommandPaletteSection
} from './index';

import {
  FuzzyMatcher, ICommandSearchItem, ICommandMatchResult
} from './matcher';

import './palette.css';


const REGISTRATION_ID = 'data-registration-id';

const CONTENT_CLASS = 'p-CommandPalette-content';

const PALETTE_CLASS = 'p-CommandPalette';

const HEADER_CLASS = 'p-CommandPalette-header';

const INPUT_CLASS = 'p-CommandPalette-inputWrapper';

const DISABLED_CLASS = 'p-mod-disabled';

const FOCUS_CLASS = 'p-mod-focus';

const COMMAND_CLASS = 'p-CommandPalette-command';

const DESCRIPTION_CLASS = 'p-CommandPalette-description';

const SHORTCUT_CLASS = 'p-CommandPalette-shortcut';

const SEARCH_CLASS = 'p-CommandPalette-search';

const ENTER = 13;

const ESCAPE = 27;

const UP_ARROW = 38;

const DOWN_ARROW = 40;

const FN_KEYS: { [key: string]: void } = {
  [ENTER]: null,
  [ESCAPE]: null,
  [UP_ARROW]: null,
  [DOWN_ARROW]: null
};

/**
 * The scroll directions for changing command focus.
 */
const enum FocusDirection {
  /**
   * Move the focus up.
   */
  Up,
  /**
   * Move the focus down.
   */
  Down
}

const matcher = new FuzzyMatcher('title', 'caption');

var commandID = 0;


/**
 * Private version of command palette item that holds registration ID.
 */
interface ICommandPaletteItemPrivate {
  /**
   * Flag denoting whether the item is visible.
   */
  visible: boolean;
  /**
   * Flag denoting whether the item is disabled.
   */
  disabled: boolean;
  /**
   * The command palette item.
   */
  item: ICommandPaletteItem;
}


/**
 * A group of items that the command palette actually renders.
 */
interface ICommandPaletteSectionPrivate {
  /**
   * The heading for the command section.
   */
  text: string;
  /**
   * The internal registration IDs of the comman palette items.
   */
  items: string[];
};

/**
 * Test to see if a child node needs to be scrolled to within its parent node.
 */
function scrollTest(parentNode: HTMLElement, childNode: HTMLElement): boolean {
  let parent = parentNode.getBoundingClientRect();
  let child = childNode.getBoundingClientRect();
  return child.top < parent.top || child.top + child.height > parent.bottom;
}

/**
 * A widget which displays registered commands and allows them to be executed.
 */
export
class CommandPalette extends Widget implements ICommandPalette {
  /**
   * Create the DOM node for a command palette.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('ul');
    let search = document.createElement('div');
    let input = document.createElement('input');
    let wrapper = document.createElement('div');
    content.className = CONTENT_CLASS;
    search.className = SEARCH_CLASS;
    wrapper.className = INPUT_CLASS;
    wrapper.appendChild(input);
    search.appendChild(wrapper);
    node.appendChild(search);
    node.appendChild(content);
    return node;
  }

  /**
   * Create a new header node for a command palette section.
   *
   * @param title - The palette section title
   *
   * @returns A new DOM node to use as a header in a command palette section.
   *
   * #### Notes
   * This method may be reimplemented to create custom header.
   */
  static createHeaderNode(title: string): HTMLElement {
    let node = document.createElement('li');
    node.className = HEADER_CLASS;
    node.appendChild(document.createTextNode(title));
    node.appendChild(document.createElement('hr'));
    return node;
  }

  /**
   * Create a new item node for a command palette.
   *
   * @param item - The content for the palette item.
   *
   * @returns A new DOM node to use as an item in a command palette.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(item: ICommandPaletteItem): HTMLElement {
    let node = document.createElement('li');
    let description = document.createElement('div');
    let shortcut = document.createElement('div');
    node.className = COMMAND_CLASS;
    description.className = DESCRIPTION_CLASS;
    shortcut.className = SHORTCUT_CLASS;
    node.textContent = item.title;
    if (item.caption) description.textContent = item.caption;
    if (item.shortcut) shortcut.textContent = item.shortcut;
    node.appendChild(shortcut);
    node.appendChild(description);
    return node;
  }

  /**
   * Create a new section document fragment for a command palette.
   *
   * @param section - The section content.
   *
   * @returns A `DocumentFragment` with the whole rendered section.
   *
   * #### Notes
   * This method may be reimplemented to create custom sections.
   */
  static createSectionFragment(section: ICommandPaletteSection): DocumentFragment {
    let fragment = document.createDocumentFragment();
    fragment.appendChild(this.createHeaderNode(section.text));
    section.items.forEach((item, index) => {
      fragment.appendChild(this.createItemNode(item));
    });
    return fragment;
  }

  /**
   * Get the command palette content node.
   *
   * #### Notes
   * This is the node which holds the command palette item nodes.
   *
   * Modifying this node directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get contentNode(): HTMLElement {
    return this.node.getElementsByClassName(CONTENT_CLASS)[0] as HTMLElement;
  }

  /**
   * Get the command palette input node.
   *
   * #### Notes
   * Modifying this node directly can lead to undefined behavior.
   *
   * This is a read-only property.
   */
  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  /**
   * Construct a new command palette.
   *
   * @param commandRegistry - A command registry instance
   */
  constructor(commandRegistry: ICommandRegistry) {
    super();
    this.addClass(PALETTE_CLASS);
    this._commandRegistry = commandRegistry;
    commandRegistry.commandsAdded.connect(this._commandsUpdated, this);
    commandRegistry.commandsRemoved.connect(this._commandsUpdated, this);
  }

  /**
   * Dispose of the resources held by the command palette.
   */
  dispose(): void {
    let commandRegistry = this._commandRegistry;
    commandRegistry.commandsAdded.disconnect(this._commandsUpdated, this);
    commandRegistry.commandsRemoved.disconnect(this._commandsUpdated, this);
    this._sections.length = 0;
    this._buffer.length = 0;
    this._registry = null;
    super.dispose();
  }

  /**
   * Add new sections with heading titles and command items to the palette.
   *
   * @param sections - An array of sections to be added to the palette
   *
   * @returns An `IDisposable` to remove the added items from the palette
   */
  add(sections: ICommandPaletteSection[]): IDisposable {
    let text: string;
    let sectionIndex: number;
    let itemIndex: number;
    let registrationID: string;
    let registrations: string[] = [];
    let item: ICommandPaletteItem;
    for (let section of sections) {
      text = section.text;
      sectionIndex = arrays.findIndex(this._sections, s => {
        return s.text === text;
      });
      if (sectionIndex === -1) {
        let ids = this._addSection(section);
        Array.prototype.push.apply(registrations, ids);
      } else {
        let ids = this._amendSection(section.items, sectionIndex);
        Array.prototype.push.apply(registrations, ids);
      }
    }
    this._bufferAllItems();
    return new DisposableDelegate(() => {
      registrations.forEach(id => { this._removeItem(id); });
      this._bufferAllItems();
    });

  }

  /**
   * Handle the DOM events for the command palette.
   *
   * @param event - The DOM event sent to the command palette.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the side bar's DOM node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'click':
      this._evtClick(event as MouseEvent);
      break;
    case 'keydown':
      this._evtKeyDown(event as KeyboardEvent);
      break;
    case 'mouseover':
      this._evtMouseOver(event as MouseEvent);
      break;
    case 'mouseout':
      this._evtMouseOut(event as MouseEvent);
      break;
    }
  }

  /**
   * Search for a specific query string among command titles and captions.
   *
   * @param query - The query string
   */
  search(query: string): void {
    let searchableItems = this._sections.reduce((acc, val) => {
      val.items.forEach(id => {
        let title = this._registry[id].item.title;
        let caption = this._registry[id].item.caption;
        acc.push({ id, title, caption });
      });
      return acc;
    }, [] as ICommandSearchItem[]);
    matcher.search(query, searchableItems).then(results => {
      this._bufferSearchResults(results);
    });
  }

  /**
   * A message handler invoked on a `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('click', this);
    this.node.addEventListener('keydown', this);
    this.node.addEventListener('mouseover', this);
    this.node.addEventListener('mouseout', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('mouseover', this);
    this.node.removeEventListener('mouseout', this);
  }

  /**
   * A handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    this.inputNode.focus();
  }

  /**
   * A handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    // Clear the node.
    this.contentNode.textContent = '';
    // Ask the command registry about each palette commmand.
    Object.keys(this._registry).forEach(registrationID => {
      let priv = this._registry[registrationID];
      let command = this._commandRegistry.get(priv.item.id);
      priv.visible = !!command;
      priv.disabled = priv.visible && !command.isEnabled();
    });
    // Render the buffer.
    this._buffer.forEach(section => this._renderSection(section));
    // Focus on the first result if search result.
    if (this._searchResult) {
      // Reset the flag.
      this._searchResult = false;
      this._focusFirst();
    }
  }

  /**
   * Add a new section to the palette's registry and return registration IDs.
   */
  private _addSection(section: ICommandPaletteSection): string[] {
    let registrations: string[] = [];
    let registrationID: string;
    let privSection = {
      text: section.text,
      items: []
    } as ICommandPaletteSectionPrivate;
    for (let item of section.items) {
      registrationID = `palette-${++commandID}`;
      this._registry[registrationID] = this._privatize(item);
      registrations.push(registrationID);
      privSection.items.push(registrationID);
    }
    this._sections.push(privSection);
    return registrations;
  }

  /**
   * Amend a section in the palette's registry and return registration IDs.
   */
  private _amendSection(items: ICommandPaletteItem[], sectionIndex: number): string[] {
    let registrations: string[] = [];
    let registrationID: string;
    let item: ICommandPaletteItem;
    let itemIndex: number;
    for (item of items) {
      let existingItems = this._sections[sectionIndex].items;
      itemIndex = arrays.findIndex(existingItems, registrationID => {
        return this._registry[registrationID].item === item;
      });
      if (itemIndex !== -1) continue;
      registrationID = `palette-${++commandID}`;
      this._registry[registrationID] = this._privatize(item);
      existingItems.push(registrationID);
      registrations.push(registrationID);
    }
    return registrations;
  }

  /**
   * Deselect all palette items.
   */
  private _blur(): void {
    let selector = `.${COMMAND_CLASS}.${FOCUS_CLASS}`;
    let nodes = this.node.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].classList.remove(FOCUS_CLASS);
    }
  }

  /**
   * Set the buffer to all registered items.
   */
  private _bufferAllItems(): void {
    this._prune();
    this._sort();
    this._buffer = this._sections;
    this.update();
  }

  /**
   * Set the buffer to search results.
   */
  private _bufferSearchResults(items: ICommandMatchResult[]): void {
    let headings = this._sections.reduce((acc, section) => {
      section.items.forEach(id => acc[id] = section.text);
      return acc;
    }, Object.create(null) as { [id: string]: string });
    let sections = items.reduce((acc, val, idx) => {
      let heading = headings[val.id];
      if (!idx) {
        acc.push({ text: heading, items: [val.id] });
        return acc;
      }
      if (acc[acc.length - 1].text === heading) {
        // Add to the last group.
        acc[acc.length - 1].items.push(val.id);
      } else {
        // Create a new group.
        acc.push({ text: heading, items: [val.id] });
      }
      return acc;
    }, [] as ICommandPaletteSectionPrivate[]);
    // If there are search results, set the search flag used for focusing
    if (sections.length) this._searchResult = true;
    this._buffer = sections;
    this.update();
  }

  /**
   * A handler for command registry additions and removals.
   */
  private _commandsUpdated(sender: ICommandRegistry, args: string[]): void {
    let added = args.reduce((acc, val) => {
      acc[val] = null;
      return acc;
    }, Object.create(null) as { [id: string]: void });
    let staleRegistry = Object.keys(this._registry).some(registrationID => {
      return this._registry[registrationID].item.id in added;
    });
    if (staleRegistry) this.update();
  }

  /**
   * Handle the `'click'` event for the command palette.
   */
  private _evtClick(event: MouseEvent): void {
    let { altKey, ctrlKey, metaKey, shiftKey } = event;
    if (event.button !== 0 || altKey || ctrlKey || metaKey || shiftKey) return;
    event.stopPropagation();
    event.preventDefault();
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) return;
      target = target.parentElement;
    }
    let priv = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (!priv.disabled) {
      this._commandRegistry.safeExecute(priv.item.id, priv.item.args);
    }
  }

  /**
   * Handle the `'keydown'` event for the command palette.
   */
  private _evtKeyDown(event: KeyboardEvent): void {
    let { altKey, ctrlKey, metaKey, keyCode } = event;
    if (!FN_KEYS.hasOwnProperty(`${keyCode}`)) {
      let input = this.inputNode;
      let oldValue = input.value;
      requestAnimationFrame(() => {
        let newValue = input.value;
        if (newValue === '') return this._bufferAllItems();
        if (newValue !== oldValue) return this.search(newValue);
      });
      return;
    }
    // Ignore system keyboard shortcuts.
    if (altKey || ctrlKey || metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    if (keyCode === ESCAPE) return this._blur();
    if (keyCode === UP_ARROW) return this._focus(FocusDirection.Up);
    if (keyCode === DOWN_ARROW) return this._focus(FocusDirection.Down);
    if (keyCode === ENTER) {
      let focused = this._findFocus();
      if (!focused) return;
      let priv = this._registry[focused.getAttribute(REGISTRATION_ID)];
      this._commandRegistry.safeExecute(priv.item.id, priv.item.args);
      this._blur();
      return;
    }
  }

  /**
   * Handle the `'mouseover'` event for the command palette.
   */
  private _evtMouseOver(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) return;
      target = target.parentElement;
    }
    let priv = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (!priv.disabled) this._focusNode(target);
  }

  /**
   * Handle the `'mouseout'` event for the command palette.
   */
  private _evtMouseOut(event: MouseEvent): void {
    let focused = this._findFocus();
    if (focused) this._blur();
  }

  /**
   * Find the currently selected command.
   */
  private _findFocus(): HTMLElement {
    let selector = `.${COMMAND_CLASS}.${FOCUS_CLASS}`;
    return this.node.querySelector(selector) as HTMLElement;
  }

  /**
   * Select the next command in the given direction.
   */
  private _focus(direction: FocusDirection): void {
    let focused = this._findFocus();
    if (!focused) {
      if (direction === FocusDirection.Down) return this._focusFirst();
      if (direction === FocusDirection.Up) return this._focusLast(true);
    }
    let registrationIDs = this._buffer.map(section => section.items)
      .reduce((acc, val) => { return acc.concat(val); }, [] as string[]);
    let current = registrationIDs.indexOf(focused.getAttribute(REGISTRATION_ID));
    let newFocus: number;
    if (direction === FocusDirection.Up) {
      newFocus = current > 0 ? current - 1 : registrationIDs.length - 1;
    } else {
      newFocus = current < registrationIDs.length - 1 ? current + 1 : 0;
    }
    while (newFocus !== current) {
      if (!this._registry[registrationIDs[newFocus]].disabled) break;
      if (direction === FocusDirection.Up) {
        newFocus = newFocus > 0 ? newFocus - 1 : registrationIDs.length - 1;
      } else {
        newFocus = newFocus < registrationIDs.length - 1 ? newFocus + 1 : 0;
      }
    }
    if (newFocus === 0) return this._focusFirst();
    let selector = `[${REGISTRATION_ID}="${registrationIDs[newFocus]}"]`;
    let target = this.node.querySelector(selector) as HTMLElement;
    this._focusNode(target, scrollTest(this.contentNode, target));
  }

  /**
   * Select the first command.
   */
  private _focusFirst(): void {
    let selector = `.${COMMAND_CLASS}:not(.${DISABLED_CLASS})`;
    this.contentNode.scrollTop = 0;
    this._focusNode(this.node.querySelectorAll(selector)[0] as HTMLElement);
  }

  /**
   * Select the last command.
   */
  private _focusLast(scroll?: boolean): void {
    let selector = `.${COMMAND_CLASS}:not(.${DISABLED_CLASS})`;
    let nodes = this.node.querySelectorAll(selector);
    let last = nodes.length - 1;
    this._focusNode(nodes[last] as HTMLElement, scroll);
  }

  /**
   * Select a specific command and optionally scroll it into view.
   */
  private _focusNode(target: HTMLElement, scroll?: boolean): void {
    let focused = this._findFocus();
    if (target === focused) return;
    if (focused) this._blur();
    target.classList.add(FOCUS_CLASS);
    if (scroll) target.scrollIntoView();
  }

  /**
   * Convert an `ICommandPaletteItem` to an `ICommandPaletteItemPrivate`.
   */
  private _privatize(item: ICommandPaletteItem): ICommandPaletteItemPrivate {
    // By default, until the registry is checked, all added items work.
    let disabled = false;
    let visible = true;
    return { disabled, item, visible };
  }

  /**
   * Filter out any sections that are empty.
   */
  private _prune(): void {
    this._sections = this._sections.filter(section => !!section.items.length);
  }

  /**
   * Remove a registered item from the registry and from the sections.
   */
  private _removeItem(registrationID: string): void {
    for (let section of this._sections) {
      for (let id of section.items) {
        if (id === registrationID) {
          delete this._registry[id];
          arrays.remove(section.items, id);
          return;
        }
      }
    }
  }

  /**
   * Render a section and its commands.
   */
  private _renderSection(privSection: ICommandPaletteSectionPrivate): void {
    if (!privSection.items.some(id => this._registry[id].visible)) return;
    let constructor = this.constructor as typeof CommandPalette;
    let content = this.contentNode;
    let section: ICommandPaletteSection = { text: privSection.text, items: [] };
    let registrationsIDs: string[] = [];
    let disableds: boolean[] = [];
    privSection.items.forEach(registrationID => {
      let priv = this._registry[registrationID];
      if (!priv.visible) return;
      section.items.push(priv.item);
      disableds.push(priv.disabled);
      registrationsIDs.push(registrationID);
    });
    let fragment = constructor.createSectionFragment(section);
    let nodes = fragment.querySelectorAll(`.${COMMAND_CLASS}`);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].setAttribute(REGISTRATION_ID, registrationsIDs[i]);
      if (disableds[i]) nodes[i].classList.add(DISABLED_CLASS);
    }
    content.appendChild(fragment);
  }

  /**
   * Sort the sections by title and their commands by title.
   */
  private _sort(): void {
    this._sections.sort((a, b) => { return a.text.localeCompare(b.text); });
    this._sections.forEach(section => section.items.sort((a, b) => {
      let titleA = this._registry[a].item.title;
      let titleB = this._registry[b].item.title;
      return titleA.localeCompare(titleB);
    }));
  }

  private _buffer: ICommandPaletteSectionPrivate[] = [];
  private _commandRegistry: ICommandRegistry = null;
  private _sections: ICommandPaletteSectionPrivate[] = [];
  private _searchResult: boolean = false;
  private _registry: {
    [id: string]: ICommandPaletteItemPrivate;
  } = Object.create(null);
}
