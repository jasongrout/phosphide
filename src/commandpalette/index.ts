/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use-strict';
// 
// import {
//   DelegateCommand, ICommand
// } from 'phosphor-command';
//
// import {
//   Token
// } from 'phosphor-di';
//
// import {
// Message
// } from 'phosphor-messaging';
//
// import {
// BoxPanel
// } from 'phosphor-boxpanel';
//
// import {
//   Widget
// } from 'phosphor-widget';
//
// import {
//   Panel
// } from 'phosphor-panel';
//
// import {
//   DockPanel
// } from 'phosphor-dockpanel';
//
// import {
//   CommandPalette, ICommandSection, ICommandSectionHeading, ICommandSearchQuery
// } from './palette';
//
// import {
//   ICommandRegistry, ICommandItem
// } from '../commandregistry/index';
//
// import {
//   FuzzyMatcher, ICommandMatchResult
// } from './matcher';

// import './index.css';

//
// const INSTRUCTIONS = 'Check out the command palette';
//
// const registry = CommandRegistry.instance();
//
// const matcher = new FuzzyMatcher('title', 'caption');
//
// const headings: ICommandSectionHeading[] = [
//   { prefix: 'demo:nes', title: 'The Ancient Near East' },
//   { prefix: 'demo:foobar', title: 'Foo, bar, and friends' }
// ];
//
// const commandItems: ICommandItem[] = [
//   {
//     id: 'demo:nes:sumer',
//     title: 'Show Sumer',
//     caption: 'The city-state of Sumer',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Sumer'); })
//   },
//   {
//     id: 'demo:nes:babylon',
//     title: 'Show Babylon',
//     caption: 'The Babylonian empire',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Babylon'); })
//   },
//   {
//     id: 'demo:nes:oldking',
//     title: 'Show Old Kingdom',
//     caption: 'The Old Kingdom of Egypt',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Old Kingdom'); })
//   },
//   {
//     id: 'demo:nes:tyre',
//     title: 'Show Tyre',
//     caption: 'The city-state of Tyre',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Tyre'); })
//   },
//   {
//     id: 'demo:nes:hittite',
//     title: 'Show Hittite empire',
//     caption: 'The Hittite empire',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Hittites'); })
//   },
//   {
//     id: 'demo:nes:parthia',
//     title: 'Show Parthia',
//     caption: 'The Hellenistic kingdom of Parthia',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Parthia'); })
//   },
//   {
//     id: 'demo:nes:neobab',
//     title: 'Show Neo-Babylonia',
//     caption: 'The Neo-Babylonian empire',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Neo Babylonia'); })
//   },
//   {
//     id: 'demo:foobar:foo',
//     title: 'Foo',
//     caption: 'Foo caption',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Foo'); })
//   },
//   {
//     id: 'demo:foobar:bar',
//     title: 'Bar',
//     caption: 'Bar caption',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Bar'); })
//   },
//   {
//     id: 'demo:foobar:baz',
//     title: 'Baz',
//     caption: 'Baz caption',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Baz'); })
//   },
//   {
//     id: 'demo:foobar:qux',
//     title: 'Qux',
//     caption: 'Qux caption',
//     shortcut: '⌘⎋',
//     command: new DelegateCommand(() => { window.alert('Qux'); })
//   }
// ];
//
// function createDock(): DockPanel {
//   let dock = new DockPanel();
//   dock.addClass('D-Dock');
//   return dock;
// }
//
// function createHeader(): Widget {
//   let header = new Widget();
//   let lightbulb = document.createElement('i');
//   lightbulb.classList.add('fa');
//   lightbulb.classList.add('fa-lightbulb-o');
//   header.addClass('D-Header');
//   header.node.appendChild(lightbulb);
//   header.node.appendChild(document.createTextNode(` ${INSTRUCTIONS}`));
//   BoxPanel.setSizeBasis(header, 20);
//   BoxPanel.setStretch(header, 0);
//   return header;
// }
//
// function createPalette(): Panel {
//   let palette = new CommandPalette();
//   palette.commandSections = commandSections(commandItems);
//   palette.execute.connect((sender, args) => {
//     let command = args as ICommand;
//     updateStatus('execute signal');
//     command.execute(void 0);
//   });
//   palette.search.connect((sender, args) => {
//     let search = args as ICommandSearchQuery;
//     updateStatus(`searching, id: ${search.id}, query: ${search.query}`);
//     if (search.query === '') {
//       palette.commandSections = commandSections(commandItems);
//       return;
//     }
//     function resolve(results: ICommandMatchResult[]):void {
//       let items = results.map(value => value.command);
//       palette.commandSections = commandSections(items);
//     }
//     function reject(error: any): void {
//       palette.commandSections = [];
//     }
//     matcher.search(search.query, commandItems).then(resolve, reject);
//   });
//   return palette;
// }
//
// function createPanel(header: Widget, list: Panel, dock: DockPanel, status: Widget): BoxPanel {
//   let panel = new BoxPanel();
//   let subpanel = new BoxPanel();
//
//   subpanel.direction = BoxPanel.LeftToRight;
//   subpanel.children.assign([list, dock]);
//   subpanel.spacing = 0;
//   BoxPanel.setSizeBasis(list, 150);
//   BoxPanel.setStretch(list, 0);
//
//   panel.children.assign([header, subpanel, status]);
//   panel.spacing = 0;
//   panel.direction = BoxPanel.TopToBottom;
//
//   panel.id = 'main';
//   return panel;
// }
//
// function commandSections(items: ICommandItem[]): ICommandSection[] {
//   let sections: ICommandSection[] = [];
//   for (let i = 0; i < headings.length; ++i) {
//     let heading = headings[i];
//     let section: ICommandSection = { heading: heading, commands: [] };
//     for (let j = 0; j < items.length; ++j) {
//       let item = items[j];
//       let prefix = item.id.split(':').slice(0, 2).join(':');
//       if (prefix === heading.prefix) {
//         section.commands.push(item);
//       }
//     }
//     if (section.commands.length) {
//       sections.push(section);
//     }
//   }
//   return sections;
// }
//
// function main(): void {
//   registry.add(commandItems);
//   let header = createHeader();
//   let palette = createPalette();
//   let dock = createDock();
//   let status = createStatus();
//   let panel = createPanel(header, palette, dock, status);
//   Widget.attach(panel, document.body);
//   window.onresize = () => panel.update();
// }
//
// window.addEventListener('load', main);


// export
// const ICommandPalette = new Token<ICommandPalette>('phosphide.ICommandPalette');
