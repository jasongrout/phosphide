/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
// 'use-strict';
//
// import {
//   ICommand
// } from 'phosphor-command';
//
// import {
//   Message
// } from 'phosphor-messaging';
//
// import {
//   ISignal, Signal
// } from 'phosphor-signaling';
//
// import {
//   Panel
// } from 'phosphor-widget';
//
// import {
//   ICommandItem
// } from './commands/registry';
//
// import './commandpalette.css';
//
//
// const COMMAND_ID = 'data-command-id';
//
// const PALETTE_CLASS = 'p-Command-Palette';
//
// const HEADER_CLASS = 'p-header';
//
// const COMMAND_CLASS = 'p-command';
//
// const DESCRIPTION_CLASS = 'p-description';
//
// const SHORTCUT_CLASS = 'p-shortcut';
//
// const SEARCH_CLASS = 'p-search';
//
// const UP_ARROW = 38;
//
// const DOWN_ARROW = 40;
//
// export
// interface ICommandSearchQuery {
//   id: number;
//   query: string;
// }
//
// export
// interface ICommandSectionHeading {
//   prefix: string;
//   title: string;
// };
//
// export
// interface ICommandSection {
//   heading: ICommandSectionHeading;
//   commands: ICommandItem[];
// };
//
// var searchID = 0;
//
// const executeSignal = new Signal<CommandPalette, ICommand>();
//
// const searchSignal = new Signal<CommandPalette, ICommandSearchQuery>();
//
// export
// class CommandPalette extends Panel {
//
//   get execute(): ISignal<CommandPalette, ICommand> {
//     return executeSignal.bind(this);
//   }
//
//   get commandSections(): ICommandSection[] {
//     return this._commandSections;
//   }
//
//   set commandSections(commandSections: ICommandSection[]) {
//     this._commandSections = commandSections;
//     this._emptyList();
//     this._commandSections.forEach(section => { this._renderSection(section); });
//   }
//
//   get search(): ISignal<CommandPalette, ICommandSearchQuery> {
//     return searchSignal.bind(this);
//   }
//
//   constructor() {
//     super();
//     this.addClass(PALETTE_CLASS);
//     this._renderSearch();
//     this._renderList();
//   }
//
//   handleEvent(event: Event): void {
//     switch (event.type) {
//     case 'click':
//       this._evtClick(event as MouseEvent);
//       break;
//     case 'keydown':
//       this._evtKeyDown(event as KeyboardEvent);
//       break;
//     }
//   }
//
//   protected onAfterAttach(msg: Message): void {
//     this.node.addEventListener('click', this);
//     this.node.addEventListener('keydown', this);
//   }
//
//   protected onBeforeDetach(msg: Message): void {
//     this.node.removeEventListener('click', this);
//     this.node.removeEventListener('keydown', this);
//   }
//
//   private _getCommandById(id: string): ICommand {
//     for (let i = 0; i < this._commandSections.length; ++i) {
//       let section = this._commandSections[i];
//       for (let j = 0; j < section.commands.length; ++j) {
//         if (section.commands[j].id === id) {
//           return section.commands[j].command;
//         }
//       }
//     }
//     return null;
//   }
//
//   private _evtClick(event: MouseEvent): void {
//     let { altKey, ctrlKey, metaKey, shiftKey } = event;
//     if (event.button !== 0 || altKey || ctrlKey || metaKey || shiftKey) {
//       return;
//     }
//     event.stopPropagation();
//     event.preventDefault();
//     let target: HTMLElement = event.target as HTMLElement;
//     while (!target.hasAttribute(COMMAND_ID)) {
//       if (target === this.node as HTMLElement) {
//         return;
//       }
//       target = target.parentElement;
//     }
//     this.execute.emit(this._getCommandById(target.getAttribute(COMMAND_ID)));
//   }
//
//   private _evtKeyDown(event: KeyboardEvent): void {
//     let { altKey, ctrlKey, metaKey, keyCode } = event;
//     let input = (this._search.querySelector('input') as HTMLInputElement);
//     if (keyCode !== UP_ARROW && keyCode !== DOWN_ARROW) {
//       let oldValue = input.value;
//       requestAnimationFrame(() => {
//         let newValue = input.value;
//         if (newValue !== oldValue) {
//           this.search.emit({ query: newValue, id: ++searchID });
//         }
//       });
//       return;
//     }
//     // Ignore keyboard shortcuts that include up and down arrow.
//     if (altKey || ctrlKey || metaKey) {
//       return;
//     }
//     event.preventDefault();
//     event.stopPropagation();
//     if (keyCode === UP_ARROW) {
//       console.log('go up');
//       return;
//     }
//     if (keyCode === DOWN_ARROW) {
//       console.log('go down');
//       return;
//     }
//   }
//
//   private _emptyList(): void {
//     let list = this._list;
//     while (list.firstChild) {
//       list.removeChild(list.firstChild);
//     }
//   }
//
//   private _renderCommandItem(item: ICommandItem): void {
//     let command = document.createElement('div');
//     let description = document.createElement('div');
//     let shortcut = document.createElement('div');
//     command.classList.add(COMMAND_CLASS);
//     description.classList.add(DESCRIPTION_CLASS);
//     shortcut.classList.add(SHORTCUT_CLASS);
//     command.textContent = item.title;
//     description.textContent = item.caption;
//     if (item.shortcut) {
//       shortcut.textContent = item.shortcut;
//     }
//     command.appendChild(shortcut);
//     command.appendChild(description);
//     command.setAttribute(COMMAND_ID, item.id);
//     this._list.appendChild(command);
//   }
//
//   private _renderHeading(heading: ICommandSectionHeading): void {
//     let header = document.createElement('div');
//     header.classList.add(HEADER_CLASS);
//     header.appendChild(document.createTextNode(heading.title));
//     header.appendChild(document.createElement('hr'));
//     this._list.appendChild(header);
//   }
//
//   private _renderList(): void {
//     this._list = document.createElement('div');
//     this.node.appendChild(this._list);
//   }
//
//   private _renderSearch(): void {
//     let input = document.createElement('input');
//     this._search = document.createElement('div');
//     this._search.classList.add(SEARCH_CLASS);
//     this._search.appendChild(input);
//     this.node.appendChild(this._search);
//   }
//
//   private _renderSection(section: ICommandSection): void {
//     this._renderHeading(section.heading);
//     section.commands.forEach(item => { this._renderCommandItem(item); });
//   }
//
//   private _commandSections: ICommandSection[] = null;
//   private _list: HTMLDivElement = null;
//   private _search: HTMLDivElement = null;
// }
