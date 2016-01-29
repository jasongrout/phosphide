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
  Command
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
  ICommandRegistry
} from '../commandregistry/index';

import {
  IShortcutManager
} from '../shortcutmanager/index';

import {
  ICommandPalette
} from './index';

import {
  FuzzyMatcher, ICommandSearchItem, ICommandMatchResult
} from './matcher';

import './palette.css';


/**
 * The class name added to `CommandPalette` instances.
 */
const PALETTE_CLASS = 'p-CommandPalette';

/**
 * The data attribute name for command palette item registrations.
 */
const REGISTRATION_ID = 'data-registration-id';

/**
 * The class name added to the content section of the palette.
 */
const CONTENT_CLASS = 'p-CommandPalette-content';

/**
 * The class name added to the search section of the palette.
 */
const SEARCH_CLASS = 'p-CommandPalette-search';

/**
 * The class name added to palette section headers.
 */
const HEADER_CLASS = 'p-CommandPalette-header';

/**
 * The class name added to the input wrapper in the search section.
 */
const INPUT_CLASS = 'p-CommandPalette-inputWrapper';

/**
 * The class name added to disabled palette items.
 */
const DISABLED_CLASS = 'p-mod-disabled';

/**
 * The class name added to the currently active palette item.
 */
const ACTIVE_CLASS = 'p-mod-active';

/**
 * The class name added to each palette item.
 */
const COMMAND_CLASS = 'p-CommandPalette-command';

/**
 * The class name added to the first line of a palette item.
 */
const COMMAND_TOP_CLASS = 'p-CommandPalette-commandTop';

/**
 * The class name added to the second line of a palette item.
 */
const COMMAND_BOTTOM_CLASS = 'p-CommandPalette-commandBottom';

/**
 * The class name added to an item caption.
 */
const CAPTION_CLASS = 'p-CommandPalette-caption';

/**
 * The class name added to an item shortcut.
 */
const SHORTCUT_CLASS = 'p-CommandPalette-shortcut';

/**
 * The class name added to an item title.
 */
const TITLE_CLASS = 'p-CommandPalette-title';

/**
 * The `keyCode` value for the enter key.
 */
const ENTER = 13;

/**
 * The `keyCode` value for the escape key.
 */
const ESCAPE = 27;

/**
 * The `keyCode` value for the up arrow key.
 */
const UP_ARROW = 38;

/**
 * The `keyCode` value for the down arrow key.
 */
const DOWN_ARROW = 40;

/**
 * A map of the special `keyCode` values a command palette uses for navigation.
 */
const FN_KEYS: { [key: string]: void } = {
  [ENTER]: null,
  [ESCAPE]: null,
  [UP_ARROW]: null,
  [DOWN_ARROW]: null
};

/**
 * A singleton instance of the fuzzy matcher used for search results.
 */
const matcher = new FuzzyMatcher('title', 'caption');

/**
 * The seed value for registration IDs that are generated for palette items.
 */
var registrationSeed = 0;


/**
 * The scroll directions for changing the active command.
 */
const enum ScrollDirection {
  /**
   * Move the active selection up.
   */
  Up,
  /**
   * Move the active selection down.
   */
  Down
}


/**
 * Test to see if a child node needs to be scrolled to within its parent node.
 *
 * @param parentNode - The element containing the child being checked.
 *
 * @param childNode - The child element whose visibility is being checked.
 *
 * @returns true if the parent node needs to be scrolled to reveal the child.
 */
function scrollTest(parentNode: HTMLElement, childNode: HTMLElement): boolean {
  let parent = parentNode.getBoundingClientRect();
  let child = childNode.getBoundingClientRect();
  return child.top < parent.top || child.top + child.height > parent.bottom;
}


/**
 * A command object which can be rendered inside a command palette section.
 */
export
interface ICommandPaletteItem {
  /**
   * The arguments the command will be called with.
   */
  args?: any;

  /**
   * A descriptive caption for the command.
   */
  caption?: string;

  /**
   * The section heading a command item appears under.
   */
  category: string;

  /**
   * The unique id for the command.
   */
  command: string;

  /**
   * A flag indicating whether the command is disabled.
   */
  disabled: boolean;

  /**
   * The palette instance ID for an item.
   */
  id: string;

  /**
   * The shortcut for the command.
   */
  shortcut?: string;

  /**
   * The title of the command.
   */
  title: string;
}


/**
 * A group of items that the command palette can render.
 */
interface ICommandPaletteSection {
  /**
   * The heading for the command section.
   */
  title: string;
  /**
   * The internal registration IDs of the command palette items.
   */
  registrations: string[];
};


/**
 * A widget which displays registered commands and allows them to be executed.
 */
export
class CommandPalette extends Widget implements ICommandPalette {
  /**
   * Create the DOM node for a command palette.
   *
   * #### Notes
   * This method may be reimplemented to create a custom root node.
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
   * This method may be reimplemented to create custom headers.
   */
  static createHeaderNode(title: string): HTMLElement {
    let node = document.createElement('li');
    let span = document.createElement('span');
    let hr = document.createElement('hr');
    node.className = HEADER_CLASS;
    span.textContent = title;
    node.appendChild(span);
    node.appendChild(hr);
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
    let top = document.createElement('div');
    let bottom = document.createElement('div');
    let title = document.createElement('span');
    let shortcut = document.createElement('span');
    let caption = document.createElement('span');
    // Set the styles for each element.
    node.className = COMMAND_CLASS;
    if (item.disabled) node.classList.add(DISABLED_CLASS);
    top.className = COMMAND_TOP_CLASS;
    bottom.className = COMMAND_BOTTOM_CLASS;
    title.className = TITLE_CLASS;
    shortcut.className = SHORTCUT_CLASS;
    caption.className = CAPTION_CLASS;
    // Populate the content and attributes for each element.
    node.setAttribute(REGISTRATION_ID, item.id);
    title.textContent = item.title;
    title.setAttribute('title', item.title);
    if (item.shortcut) shortcut.textContent = item.shortcut;
    if (item.caption) {
      caption.textContent = item.caption;
      caption.setAttribute('title', item.caption);
    }
    // Compose the node.
    top.appendChild(title);
    top.appendChild(shortcut);
    bottom.appendChild(caption);
    node.appendChild(top);
    node.appendChild(bottom);
    return node;
  }

  /**
   * Create a new section document fragment for a command palette.
   *
   * @param title - The section heading.
   *
   * @param items - The command items in a section.
   *
   * @returns A `DocumentFragment` with the whole rendered section.
   *
   * #### Notes
   * This method may be reimplemented to create custom sections.
   */
  static createSectionFragment(title: string, items: ICommandPaletteItem[]): DocumentFragment {
    let fragment = document.createDocumentFragment();
    fragment.appendChild(this.createHeaderNode(title));
    items.forEach(item => {
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
  constructor(commandRegistry: ICommandRegistry, shortcutManager: IShortcutManager) {
    super();
    this.addClass(PALETTE_CLASS);
    this._commandRegistry = commandRegistry;
    commandRegistry.commandsRemoved.connect(this._onCommandsRemoved, this);
    this._shortcutManager = shortcutManager;
  }

  /**
   * Dispose of the resources held by the command palette.
   */
  dispose(): void {
    let commandRegistry = this._commandRegistry;
    commandRegistry.commandsRemoved.disconnect(this._onCommandsRemoved, this);
    this._sections.length = 0;
    this._buffer.length = 0;
    this._registry = null;
    super.dispose();
  }

  /**
   * Add new command items to the palette.
   *
   * @param commands - An array of command IDs and arguments
   *
   * @returns An `IDisposable` to remove the added commands from the palette
   */
  add(commands: { id: string, args: any }[]): IDisposable {
    let registrations: string[] = [];
    commands.forEach(spec => {
      let command = this._commandRegistry.get(spec.id);
      if (!command) {
        console.warn(`Command ${spec.id} does not exist in command registry.`);
        return;
      }
      let item: ICommandPaletteItem = {
        args: spec.args,
        caption: command.caption(spec.args),
        category: command.category(spec.args),
        command: spec.id,
        disabled: !command.isEnabled(spec.args),
        id: `palette-${++registrationSeed}`,
        shortcut: this._shortcutForItem(spec.id, spec.args),
        title: command.text(spec.args) || spec.id
      };
      // Add the item to the private registry.
      this._registry[item.id] = item;
      // Add the item to the list of registrations to dispose later.
      registrations.push(item.id);
      // Discover whether a section with this category already exists.
      let sectionIndex = arrays.findIndex(this._sections, section => {
        return section.title === item.category;
      });
      if (sectionIndex === -1) {
        // If a section with this header does not exist, add a new section.
        this._sections.push({ title: item.category, registrations: [item.id] });
      } else {
        // If a section exists with this header, add to it.
        this._sections[sectionIndex].registrations.push(item.id);
      }
    });
    this._bufferAllItems();
    return new DisposableDelegate(() => {
      registrations.forEach(id => { this._removeItem(id, true); });
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
   * called in response to events on the command palette's DOM node. It should
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
    case 'mousemove':
      this._evtMouseMove(event as MouseEvent);
      break;
    case 'mouseleave':
      this._evtMouseLeave(event as MouseEvent);
      break;
    }
  }

  /**
   * Search for a specific query string among command titles and captions.
   *
   * @param query - The query string
   */
  search(query: string): void {
    let searchableItems = this._sections.reduce((acc, section) => {
      section.registrations.forEach(id => {
        let item = this._registry[id];
        let title = item.title;
        let caption = item.caption;
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
    this.node.addEventListener('mousemove', this);
    this.contentNode.addEventListener('mouseleave', this);
  }

  /**
   * A message handler invoked on a `'before-detach'` message.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('click', this);
    this.node.removeEventListener('keydown', this);
    this.node.removeEventListener('mousemove', this);
    this.contentNode.removeEventListener('mouseleave', this);
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
    Object.keys(this._registry).forEach(id => {
      let item = this._registry[id];
      let command = this._commandRegistry.get(item.command);
      // If a command doesn't exist any more, it needs to be removed.
      if (!command) {
        this._removeItem(id, true);
      } else {
        this._updateCommandItem(id, command)
      }
    });
    // Render the buffer.
    this._buffer.forEach(section => this._renderSection(section));
    // Activate the first result if search result.
    if (this._searchResult) {
      // Reset the flag.
      this._searchResult = false;
      this._activateFirst();
    }
  }

  /**
   * Activate the next command in the given direction.
   *
   * @param direction - The scroll direction.
   */
  private _activate(direction: ScrollDirection): void {
    let active = this._findActive();
    if (!active) {
      if (direction === ScrollDirection.Down) return this._activateFirst();
      if (direction === ScrollDirection.Up) return this._activateLast();
    }
    let registrations = this._buffer.map(section => section.registrations)
      .reduce((acc, ids) => { return acc.concat(ids); }, [] as string[]);
    let current = registrations.indexOf(active.getAttribute(REGISTRATION_ID));
    let newActive: number;
    if (direction === ScrollDirection.Up) {
      newActive = current > 0 ? current - 1 : registrations.length - 1;
    } else {
      newActive = current < registrations.length - 1 ? current + 1 : 0;
    }
    while (newActive !== current) {
      if (!this._registry[registrations[newActive]].disabled) break;
      if (direction === ScrollDirection.Up) {
        newActive = newActive > 0 ? newActive - 1 : registrations.length - 1;
      } else {
        newActive = newActive < registrations.length - 1 ? newActive + 1 : 0;
      }
    }
    if (newActive === 0) return this._activateFirst();
    let selector = `[${REGISTRATION_ID}="${registrations[newActive]}"]`;
    let target = this.node.querySelector(selector) as HTMLElement;
    let scrollIntoView = scrollTest(this.contentNode, target);
    let alignToTop = direction === ScrollDirection.Up;
    this._activateNode(target, scrollIntoView, alignToTop);
  }

  /**
   * Activate the first command.
   */
  private _activateFirst(): void {
    // Query the DOM for items that are not disabled.
    let selector = `.${COMMAND_CLASS}:not(.${DISABLED_CLASS})`;
    let nodes = this.node.querySelectorAll(selector);
    // If the palette contains any enabled items, activate the first one.
    if (nodes.length) {
      // Scroll all the way to the top of the content node.
      this.contentNode.scrollTop = 0;
      let target = nodes[0] as HTMLElement;
      // Test if the first enabled item is visible.
      let scrollIntoView = scrollTest(this.contentNode, target);
      let alignToTop = true;
      this._activateNode(target, scrollIntoView, alignToTop);
    }
  }

  /**
   * Activate the last command.
   */
  private _activateLast(): void {
    // Query the DOM for items that are not disabled.
    let selector = `.${COMMAND_CLASS}:not(.${DISABLED_CLASS})`;
    let nodes = this.node.querySelectorAll(selector);
    // If the palette contains any enabled items, activate the last one.
    if (nodes.length) {
      // Scroll all the way to the bottom of the content node.
      this.contentNode.scrollTop = this.contentNode.scrollHeight;
      let target = nodes[nodes.length - 1] as HTMLElement;
      // Test if the last enabled item is visible.
      let scrollIntoView = scrollTest(this.contentNode, target);
      let alignToTop = false;
      this._activateNode(target, scrollIntoView, alignToTop);
    }
  }

  /**
   * Activate a specific command and optionally scroll it into view.
   *
   * @param target - The node that is being activated.
   *
   * @param scrollIntoView - A flag indicating whether to scroll to the node.
   *
   * @param alignToTop - A flag indicating whether to align scroll to top.
   */
  private _activateNode(target: HTMLElement, scrollIntoView?: boolean, alignToTop?: boolean): void {
    let active = this._findActive();
    if (target === active) return;
    if (active) this._deactivate();
    target.classList.add(ACTIVE_CLASS);
    if (scrollIntoView) target.scrollIntoView(alignToTop);
  }

  /**
   * Set the buffer to all registered items.
   */
  private _bufferAllItems(): void {
    // Filter out any sections that are empty.
    this._sections = this._sections.filter(s => !!s.registrations.length);
    this._sort();
    this._buffer = this._sections;
    this.update();
  }

  /**
   * Set the buffer to search results.
   *
   * @param items - The search results to be buffered.
   */
  private _bufferSearchResults(items: ICommandMatchResult[]): void {
    let headings = this._sections.reduce((acc, section) => {
      section.registrations.forEach(id => acc[id] = section.title);
      return acc;
    }, Object.create(null) as { [id: string]: string });
    let sections = items.reduce((acc, val, idx) => {
      let heading = headings[val.id];
      if (!idx) {
        acc.push({ title: heading, registrations: [val.id] });
        return acc;
      }
      if (acc[acc.length - 1].title === heading) {
        // Add to the last group.
        acc[acc.length - 1].registrations.push(val.id);
      } else {
        // Create a new group.
        acc.push({ title: heading, registrations: [val.id] });
      }
      return acc;
    }, [] as ICommandPaletteSection[]);
    // If there are search results, set the search flag used for activation.
    if (sections.length) this._searchResult = true;
    this._buffer = sections;
    this.update();
  }

  /**
   * Deactivate (i.e. deselect) all palette item.
   */
  private _deactivate(): void {
    let selector = `.${COMMAND_CLASS}.${ACTIVE_CLASS}`;
    let nodes = this.node.querySelectorAll(selector);
    for (let i = 0; i < nodes.length; ++i) {
      nodes[i].classList.remove(ACTIVE_CLASS);
    }
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
    let item = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (item.disabled) return;
    this._commandRegistry.get(item.command).execute(item.args);
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
    // If escape key is pressed and nothing is active, allow propagation.
    if (keyCode === ESCAPE) {
      if (!this._findActive()) return;
      event.preventDefault();
      event.stopPropagation();
      return this._deactivate();
    }
    event.preventDefault();
    event.stopPropagation();
    if (keyCode === UP_ARROW) return this._activate(ScrollDirection.Up);
    if (keyCode === DOWN_ARROW) return this._activate(ScrollDirection.Down);
    if (keyCode === ENTER) {
      let active = this._findActive();
      if (!active) return;
      let item = this._registry[active.getAttribute(REGISTRATION_ID)];
      this._commandRegistry.get(item.command).execute(item.args);
      this._deactivate();
      return;
    }
  }

  /**
   * Handle the `'mouseleave'` event for the command palette.
   */
  private _evtMouseLeave(event: MouseEvent): void {
    this._deactivate();
  }

  /**
   * Handle the `'mousemove'` event for the command palette.
   */
  private _evtMouseMove(event: MouseEvent): void {
    let target = event.target as HTMLElement;
    while (!target.hasAttribute(REGISTRATION_ID)) {
      if (target === this.node as HTMLElement) return this._deactivate();
      target = target.parentElement;
    }
    let priv = this._registry[target.getAttribute(REGISTRATION_ID)];
    if (priv.disabled) {
      this._deactivate();
    } else {
      this._activateNode(target);
    }
  }

  /**
   * Find the currently selected command.
   */
  private _findActive(): HTMLElement {
    let selector = `.${COMMAND_CLASS}.${ACTIVE_CLASS}`;
    return this.node.querySelector(selector) as HTMLElement;
  }

  /**
   * A handler for command registry removals.
   *
   * @param sender - The command registry instance that signaled a change.
   *
   * @param ids - The command IDs that were removed.
   */
  private _onCommandsRemoved(sender: ICommandRegistry, ids: string[]): void {
    let commands = ids.reduce((acc, val) => {
      acc[val] = null;
      return acc;
    }, Object.create(null) as { [id: string]: void });
    let staleRegistry = Object.keys(this._registry).some(id => {
      return this._registry[id].command in commands;
    });
    if (staleRegistry) this.update();
  }

  /**
   * Remove a registered item from the registry and from the sections.
   *
   * @param id - The palette ID of the item being removed.
   *
   * @param deregister - A flag to delete the internal registration of the item.
   */
  private _removeItem(id: string, deregister?: boolean): void {
    for (let section of this._sections) {
      for (let registered of section.registrations) {
        if (id === registered) {
          arrays.remove(section.registrations, id);
          if (deregister) delete this._registry[id];
          return;
        }
      }
    }
  }

  /**
   * Render a section and its commands.
   *
   * @param section - The palette section being rendered.
   */
  private _renderSection(section: ICommandPaletteSection): void {
    let constructor = this.constructor as typeof CommandPalette;
    let items = section.registrations.map(id => this._registry[id]);
    let fragment = constructor.createSectionFragment(section.title, items);
    this.contentNode.appendChild(fragment);
  }

  /**
   * Get the shortcut for an item.
   *
   * @param command - The command id.
   *
   * @param args - The command arguments.
   */
  private _shortcutForItem(command: string, args: any): string {
    let shortcut = '';
    let sequences = this._shortcutManager.getSequences(command, args);
    if (sequences && sequences.length > 0) {
      shortcut = sequences[0].map(s => s.replace(/\s/g, '-')).join(' ');
    }
    return shortcut;
  }

  /**
   * Sort the sections by title and their commands by title.
   */
  private _sort(): void {
    this._sections.sort((a, b) => { return a.title.localeCompare(b.title); });
    this._sections.forEach(section => section.registrations.sort((a, b) => {
      let titleA = this._registry[a].title;
      let titleB = this._registry[b].title;
      return titleA.localeCompare(titleB);
    }));
  }

  /**
   * Update the local command item by referencing its underlying `Command`.
   *
   * @param id - The palette registration ID for the command item.
   *
   * @param command - The `Command` instance that the palette item references.
   */
  private _updateCommandItem(id: string, command: Command): void {
    let item = this._registry[id];
    let newCategory = command.category(item.args);
    item.caption = command.caption(item.args)
    item.disabled = !command.isEnabled(item.args);
    item.shortcut = this._shortcutForItem(item.command, item.args);
    item.title = command.text(item.args) || item.command;
    // If the item does not need to be shifted into a different section, return.
    if (item.category === newCategory) return;
    // Delete the item from whichever section it currently resides in.
    this._removeItem(item.id, false);
    item.category = newCategory;
    // Discover whether a section with this category already exists.
    let sectionIndex = arrays.findIndex(this._sections, section => {
      return section.title === newCategory;
    });
    if (sectionIndex === -1) {
      // If a section with this header does not exist, add a new section.
      this._sections.push({ title: item.category, registrations: [item.id] });
    } else {
      // If a section exists with this header, add to it.
      this._sections[sectionIndex].registrations.push(item.id);
    }
  }

  private _buffer: ICommandPaletteSection[] = [];
  private _commandRegistry: ICommandRegistry = null;
  private _registry: {
    [id: string]: ICommandPaletteItem;
  } = Object.create(null);
  private _searchResult: boolean = false;
  private _sections: ICommandPaletteSection[] = [];
  private _shortcutManager: IShortcutManager = null;
}
