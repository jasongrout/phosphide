/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';

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
  Panel
} from 'phosphor-panel';

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

const PALETTE_CLASS = 'p-CommandPalette';

const HEADER_CLASS = 'p-header';

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
   * The internal registration ID for the command item.
   */
  registrationID: string;

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
   * The palette command items.
   */
  items: ICommandPaletteItemPrivate[];
};


export
class CommandPalette extends Panel implements ICommandPalette {

  static create(commandRegistry: ICommandRegistry): ICommandPalette {
    return new CommandPalette(commandRegistry);
  }

  static requires: Token<any>[] = [ICommandRegistry];

  constructor(commandRegistry: ICommandRegistry) {
    super();
    this._commandRegistry = commandRegistry;
    this.addClass(PALETTE_CLASS);
    this._renderSearch();
    this._renderList();
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
      let privItem = this._privatize(item, registrationID);
      this._registry[registrationID] = privItem;
      registrations.push(registrationID);
      privSection.items.push(privItem);
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
      itemIndex = arrays.findIndex(existingItems, priv => {
        return priv.item === item;
      });
      if (itemIndex !== -1) {
        continue;
      }
      registrationID = `palette-${++commandID}`;
      let privItem = this._privatize(item, registrationID);
      this._registry[registrationID] = privItem;
      existingItems.push(privItem);
      registrations.push(registrationID);
    }
    return registrations;
  }

  private _empty(): void {
    let list = this._list;
    while (list.firstChild) {
      list.removeChild(list.firstChild);
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
    console.log(`execute command ${priv.item.id} with args:`, priv.item.args);
  }

  private _evtKeyDown(event: KeyboardEvent): void {
    let { altKey, ctrlKey, metaKey, keyCode } = event;
    let input = (this._search.querySelector('input') as HTMLInputElement);
    if (keyCode !== UP_ARROW && keyCode !== DOWN_ARROW) {
      let oldValue = input.value;
      requestAnimationFrame(() => {
        let newValue = input.value;
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

  private _privatize(item: ICommandPaletteItem, registrationID: string): ICommandPaletteItemPrivate {
    return { item: item, registrationID: registrationID };
  }

  private _prune(): void {
    this._sections = this._sections.filter(section => !!section.items.length);
  }

  private _removeItem(registrationID: string): void {
    for (let section of this._sections) {
      for (let item of section.items) {
        if (item === this._registry[registrationID]) {
          delete this._registry[registrationID];
          arrays.remove(section.items, item);
          return;
        }
      }
    }
  }

  private _renderAllItems(): void {
    this._empty();
    this._prune();
    this._sort();
    this._sections.forEach(section => this._renderSection(section));
  }

  private _renderCommandItem(priv: ICommandPaletteItemPrivate): void {
    let command = document.createElement('a');
    let description = document.createElement('div');
    let shortcut = document.createElement('div');
    command.setAttribute('href', '#');
    command.classList.add(COMMAND_CLASS);
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
    command.setAttribute(REGISTRATION_ID, priv.registrationID);
    this._list.appendChild(command);
  }

  private _renderHeading(heading: string): void {
    let header = document.createElement('div');
    header.classList.add(HEADER_CLASS);
    header.appendChild(document.createTextNode(heading));
    header.appendChild(document.createElement('hr'));
    this._list.appendChild(header);
  }

  private _renderList(): void {
    this._list = document.createElement('div');
    this.node.appendChild(this._list);
  }

  private _renderSearch(): void {
    let input = document.createElement('input');
    this._search = document.createElement('div');
    this._search.classList.add(SEARCH_CLASS);
    this._search.appendChild(input);
    this.node.appendChild(this._search);
  }

  private _renderSearchResults(items: ICommandMatchResult[]): void {
    this._empty();
    let headings = this._sections.reduce((acc, section) => {
      section.items.forEach(item => acc[item.registrationID] = section.text);
      return acc;
    }, Object.create(null) as { [id: string]: string });
    let sections = items.reduce((acc, val, idx) => {
      let item = this._registry[val.id];
      let heading = headings[val.id];
      if (!idx) {
        acc.push({ text: heading, items: [item] });
        return acc;
      }
      if (acc[acc.length - 1].text === heading) {
        // Add to the last group.
        acc[acc.length - 1].items.push(item);
      } else {
        // Create a new group.
        acc.push({ text: heading, items: [item] });
      }
      return acc;
    }, [] as ICommandPaletteSectionPrivate[]);
    sections.forEach(section => this._renderSection(section));
  }

  private _renderSection(section: ICommandPaletteSectionPrivate): void {
    this._renderHeading(section.text);
    section.items.forEach(item => { this._renderCommandItem(item); });
  }

  private _searchItems(): ICommandSearchItem[] {
    return this._sections.reduce((acc, val) => {
      val.items.forEach(val => {
        acc.push({
          id: val.registrationID,
          title: val.item.title,
          caption: val.item.caption
        });
      });
      return acc;
    }, [] as ICommandSearchItem[]);
  }

  private _sort(): void {
    this._sections.sort((a, b) => { return a.text.localeCompare(b.text); });
    this._sections.forEach(section => section.items.sort((a, b) => {
      return a.item.title.localeCompare(b.item.title);
    }));
  }

  private _commandRegistry: ICommandRegistry = null;
  private _sections: ICommandPaletteSectionPrivate[] = [];
  private _list: HTMLDivElement = null;
  private _search: HTMLDivElement = null;
  private _registry: {
    [id: string]: ICommandPaletteItemPrivate;
  } = Object.create(null);
}
