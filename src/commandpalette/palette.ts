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

const CONTENT_CLASS = 'p-content';

const PALETTE_CLASS = 'p-CommandPalette';

const HEADER_CLASS = 'p-header';

const INPUT_CLASS = 'p-input-wrapper';

const DISABLED_CLASS = 'p-mod-disabled';

const COMMAND_CLASS = 'p-command';

const DESCRIPTION_CLASS = 'p-description';

const SHORTCUT_CLASS = 'p-shortcut';

const SEARCH_CLASS = 'p-search';

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
    let content = document.createElement('div');
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
    this._renderAllItems();
    return new DisposableDelegate(() => {
      registrations.forEach(id => { this._removeItem(id); });
      this._renderAllItems();
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

  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('click', this);
    this.node.addEventListener('keydown', this);
    this.node.addEventListener('mouseover', this);
    this.node.addEventListener('mouseout', this);
  }

  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('mouseover', this);
    this.node.removeEventListener('mouseout', this);
  }

  private _addSection(section: ICommandPaletteSection): string[] {
    let registrations: string[] = [];
    let registrationID: string;
    let privSection: ICommandPaletteSectionPrivate = Object.create(null);
    privSection.text = section.text;
    privSection.items = [];
    for (let item of section.items) {
      registrationID = `palette-${++commandID}`;
      let privItem = this._privatize(item);
      this._registry[registrationID] = privItem;
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
      let privItem = this._privatize(item);
      this._registry[registrationID] = privItem;
      existingItems.push(registrationID);
      registrations.push(registrationID);
    }
    return registrations;
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
      this._renderBuffer();
    }
  }

  private _empty(): void {
    this.contentNode.textContent = '';
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
    this._commandRegistry.safeExecute(priv.item.id, priv.item.args);
  }

  private _evtKeyDown(event: KeyboardEvent): void {
    let { altKey, ctrlKey, metaKey, keyCode } = event;
    let input = this.node.querySelector(`.${SEARCH_CLASS} input`);
    if (keyCode !== UP_ARROW && keyCode !== DOWN_ARROW) {
      let oldValue = (input as HTMLInputElement).value;
      requestAnimationFrame(() => {
        let newValue = (input as HTMLInputElement).value;
        if (newValue === '') {
          this._renderAllItems();
          return;
        }
        if (newValue !== oldValue) {
          matcher.search(newValue, this._searchItems()).then(results => {
            this._renderSearchResults(results);
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
    this._focus(target);
  }

  private _evtMouseOut(event: MouseEvent): void {
    let focused = this._findFocus();
    if (focused) {
      focused.blur();
    }
  }

  private _findFocus(): HTMLElement {
    return this.node.querySelector(`.${COMMAND_CLASS}:focus`) as HTMLElement;
  }

  private _focus(target: HTMLElement): void {
    let focused = this._findFocus();
    if (target === focused) {
      return;
    }
    if (focused) {
      focused.blur();
    }
    target.focus();
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

  private _refreshCommands(): void {
    Object.keys(this._registry).forEach(registrationID => {
      let priv = this._registry[registrationID];
      let command = this._commandRegistry.get(priv.item.id);
      priv.visible = !!command;
      priv.disabled = priv.visible && !command.isEnabled;
    });
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

  private _renderAllItems(): void {
    this._prune();
    this._sort();
    this._buffer = this._sections;
    this._renderBuffer();
  }

  private _renderBuffer(): void {
    this._empty();
    this._refreshCommands();
    this._buffer.forEach(section => this._renderSection(section));
  }

  private _renderCommandItem(registrationID: string): void {
    let priv = this._registry[registrationID];
    if (!priv.visible) {
      return;
    }
    let content = this.contentNode;
    let command = document.createElement('a');
    let description = document.createElement('div');
    let shortcut = document.createElement('div');
    command.setAttribute('href', '#');
    command.classList.add(COMMAND_CLASS);
    if (priv.disabled) {
      command.classList.add(DISABLED_CLASS);
    }
    description.classList.add(DESCRIPTION_CLASS);
    shortcut.classList.add(SHORTCUT_CLASS);
    command.textContent = priv.item.title;
    if (priv.item.caption) {
      description.textContent = priv.item.caption;
    }
    if (priv.item.shortcut) {
      shortcut.textContent = priv.item.shortcut;
    }
    command.appendChild(shortcut);
    command.appendChild(description);
    command.setAttribute(REGISTRATION_ID, registrationID);
    content.appendChild(command);
  }

  private _renderHeading(heading: string): void {
    let content = this.contentNode;
    let header = document.createElement('div');
    header.classList.add(HEADER_CLASS);
    header.appendChild(document.createTextNode(heading));
    header.appendChild(document.createElement('hr'));
    content.appendChild(header);
  }

  // private _renderList(): void {
  //   let content = document.createElement('div');
  //   content.className = CONTENT_CLASS;
  //   this._list = document.createElement('div');
  //   content.appendChild(this._list);
  //   this.node.appendChild(content);
  // }

  // private _renderSearch(): void {
  //   let input = document.createElement('input');
  //   let wrapper = document.createElement('div');
  //   wrapper.className = INPUT_CLASS;
  //   wrapper.appendChild(input);
  //   this._search = document.createElement('div');
  //   this._search.classList.add(SEARCH_CLASS);
  //   this._search.appendChild(wrapper);
  //   this.node.appendChild(this._search);
  // }

  private _renderSearchResults(items: ICommandMatchResult[]): void {
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
    this._renderBuffer();
  }

  private _renderSection(section: ICommandPaletteSectionPrivate): void {
    if (!section.items.some(id => this._registry[id].visible)) {
      return;
    }
    this._renderHeading(section.text);
    section.items.forEach(id => { this._renderCommandItem(id); });
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
  private _list: HTMLDivElement = null;
  private _search: HTMLDivElement = null;
  private _registry: {
    [id: string]: ICommandPaletteItemPrivate;
  } = Object.create(null);
}
