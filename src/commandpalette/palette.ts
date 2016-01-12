/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
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
  Token
} from 'phosphor-di';

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

const INPUT_CLASS = 'p-CommandPalette-inputwrapper';

const DISABLED_CLASS = 'p-mod-disabled';

const FOCUS_CLASS = 'p-mod-focus';

const COMMAND_CLASS = 'p-CommandPalette-command';

const DESCRIPTION_CLASS = 'p-CommandPalette-description';

const SHORTCUT_CLASS = 'p-CommandPalette-shortcut';

const SEARCH_CLASS = 'p-CommandPalette-search';

const UP_ARROW = 38;

const DOWN_ARROW = 40;

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


export
class CommandPalette extends Widget implements ICommandPalette {

  static requires: Token<any>[] = [ICommandRegistry];

  static create(commandRegistry: ICommandRegistry): ICommandPalette {
    return new CommandPalette(commandRegistry);
  }

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
   * @param disabled - A flag denoting whether a palette item is disabled.
   *
   * @returns A new DOM node to use as an item in a command palette.
   *
   * #### Notes
   * This method may be reimplemented to create custom items.
   */
  static createItemNode(item: ICommandPaletteItem, disabled: boolean): HTMLElement {
    let node = document.createElement('li');
    let description = document.createElement('div');
    let shortcut = document.createElement('div');
    node.classList.add(COMMAND_CLASS);
    if (disabled) {
      node.classList.add(DISABLED_CLASS);
    }
    description.classList.add(DESCRIPTION_CLASS);
    shortcut.classList.add(SHORTCUT_CLASS);
    node.textContent = item.title;
    if (item.caption) {
      description.textContent = item.caption;
    }
    if (item.shortcut) {
      shortcut.textContent = item.shortcut;
    }
    node.appendChild(shortcut);
    node.appendChild(description);
    return node;
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

  constructor(commandRegistry: ICommandRegistry) {
    super();
    this.addClass(PALETTE_CLASS);
    this._commandRegistry = commandRegistry;
    this._commandRegistry.commandsAdded.connect(this._commandsUpdated, this);
    this._commandRegistry.commandsRemoved.connect(this._commandsUpdated, this);
  }

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
  }

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
      if (itemIndex !== -1) {
        continue;
      }
      registrationID = `palette-${++commandID}`;
      this._registry[registrationID] = this._privatize(item);
      existingItems.push(registrationID);
      registrations.push(registrationID);
    }
    return registrations;
  }

  private _blur(): void {
    let selector = `.${COMMAND_CLASS}.${FOCUS_CLASS}`;
    let nodes = this.node.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].classList.remove(FOCUS_CLASS);
    }
  }

  private _bufferAllItems(): void {
    this._prune();
    this._sort();
    this._buffer = this._sections;
    this.update();
  }

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
    this._buffer = sections;
    this.update();
  }

  private _commandsUpdated(sender: ICommandRegistry, args: string[]): void {
    let added = args.reduce((acc, val) => {
      acc[val] = null;
      return acc;
    }, Object.create(null) as { [id: string]: void });
    let staleRegistry = Object.keys(this._registry).some(registrationID => {
      return this._registry[registrationID].item.id in added;
    });
    if (staleRegistry) {
      this.update();
    }
  }

  private _evtClick(event: MouseEvent): void {
    let { altKey, ctrlKey, metaKey, shiftKey } = event;
    if (event.button !== 0 || altKey || ctrlKey || metaKey || shiftKey) {
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) {
        return;
      }
      target = target.parentElement;
    }
    let priv = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (!priv.disabled) {
      this._commandRegistry.safeExecute(priv.item.id, priv.item.args);
    }
  }

  private _evtKeyDown(event: KeyboardEvent): void {
    let { altKey, ctrlKey, metaKey, keyCode } = event;
    let input = this.node.querySelector(`.${SEARCH_CLASS} input`);
    if (keyCode !== UP_ARROW && keyCode !== DOWN_ARROW) {
      let oldValue = (input as HTMLInputElement).value;
      requestAnimationFrame(() => {
        let newValue = (input as HTMLInputElement).value;
        if (newValue === '') {
          this._bufferAllItems();
          return;
        }
        if (newValue !== oldValue) {
          matcher.search(newValue, this._searchItems()).then(results => {
            this._bufferSearchResults(results);
          });
        }
      });
      return;
    }
    // Ignore keyboard shortcuts that include up and down arrow.
    if (altKey || ctrlKey || metaKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (keyCode === UP_ARROW) {
      console.log('go up');
      return;
    }
    if (keyCode === DOWN_ARROW) {
      console.log('go down');
      return;
    }
  }

  private _evtMouseOver(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) {
        return;
      }
      target = target.parentElement;
    }
    let priv = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (!priv.disabled) {
      this._focus(target);
    }
  }

  private _evtMouseOut(event: MouseEvent): void {
    let focused = this._findFocus();
    if (focused) {
      this._blur();
    }
  }

  private _findFocus(): HTMLElement {
    let selector = `.${COMMAND_CLASS}.${FOCUS_CLASS}`;
    return this.node.querySelector(selector) as HTMLElement;
  }

  private _focus(target: HTMLElement): void {
    let focused = this._findFocus();
    if (target === focused) {
      return;
    }
    if (focused) {
      this._blur();
    }
    target.classList.add(FOCUS_CLASS);
  }

  private _privatize(item: ICommandPaletteItem): ICommandPaletteItemPrivate {
    // By default, until the registry is checked, all added items work.
    let disabled = false;
    let visible = true;
    return { disabled, item, visible };
  }

  private _prune(): void {
    this._sections = this._sections.filter(section => !!section.items.length);
  }

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

  private _renderSection(section: ICommandPaletteSectionPrivate): void {
    if (!section.items.some(id => this._registry[id].visible)) {
      return;
    }
    let constructor = this.constructor as typeof CommandPalette;
    let content = this.contentNode;
    let header = constructor.createHeaderNode(section.text);
    content.appendChild(header);
    section.items.forEach(registrationID => {
      let priv = this._registry[registrationID];
      if (priv.visible) {
        let node = constructor.createItemNode(priv.item, priv.disabled);
        node.setAttribute(REGISTRATION_ID, registrationID);
        content.appendChild(node);
      }
    });
  }

  private _searchItems(): ICommandSearchItem[] {
    return this._sections.reduce((acc, val) => {
      val.items.forEach(id => {
        let priv = this._registry[id];
        acc.push({
          id: id,
          title: priv.item.title,
          caption: priv.item.caption
        });
      });
      return acc;
    }, [] as ICommandSearchItem[]);
  }

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
  private _registry: {
    [id: string]: ICommandPaletteItemPrivate;
  } = Object.create(null);
}
