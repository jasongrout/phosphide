/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  DelegateCommand, ICommand
} from 'phosphor-command';

import {
Message
} from 'phosphor-messaging';

import {
BoxPanel
} from 'phosphor-boxpanel';

import {
Panel, Widget
} from 'phosphor-widget';

import {
  DockPanel
} from 'phosphor-dockpanel';

import {
  ICommandSection, ICommandSectionHeading, ICommandSearchQuery
} from './palette';

import {
  ICommandRegistry, ICommandItem
} from '../commandregistry/index';

import {
  FuzzyMatcher, ICommandMatchResult
} from './matcher';

import {
  Container, Token
} from 'phosphor-di';

import {
  CommandPalette
} from './palette';

import {
  IAppShell
} from '../appshell/index';


const INSTRUCTIONS = 'Check out the command palette';

//const registry = CommandRegistry.instance();

const matcher = new FuzzyMatcher('title', 'caption');


/**
 * Resolve the plugin contributions.
 *
 * @param container - The di container for type registration.
 *
 * #### Notes.
 * This is automatically called when the plugin is loaded.
 */
 export
 function resolve(container: Container): Promise<void> {
   return container.resolve(CommandPaletteHandler).then(handler => {
     handler.run();
   });
 }

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
//   //palette.commandSections = commandSections(commandItems);
//   palette.execute.connect((sender: any, args: any) => {
//     let command = args as ICommand;
//     command.execute(void 0);
//   });
//   palette.search.connect((sender: any, args: any) => {
//     let search = args as ICommandSearchQuery;
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

// function createPanel(header: Widget, list: Panel, dock: DockPanel, status: Widget): BoxPanel {
//   let panel = new BoxPanel();
//   let subpanel = new BoxPanel();
//
//   subpanel.direction = BoxPanel.LeftToRight;
//   subpanel.addChild(list);
//   subpanel.addChild(dock);
//   subpanel.spacing = 0;
//   BoxPanel.setSizeBasis(list, 150);
//   BoxPanel.setStretch(list, 0);
//
//   panel.addChild(header);
//   panel.addChild(subpanel);
//   panel.addChild(status);
//   panel.spacing = 0;
//   panel.direction = BoxPanel.TopToBottom;
//
//   panel.id = 'main';
//   return panel;
// }

// function commandSections(items: ICommandItem[]): ICommandSection[] {
//   let sections: ICommandSection[] = [];
//   let headings = ["First", "Second"];
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


class CommandPaletteHandler {

  static requires = [IAppShell, ICommandRegistry];

  static create(shell: IAppShell): CommandPaletteHandler {
    return new CommandPaletteHandler(shell);
  }

  constructor(shell: IAppShell) {
    this._shell = shell;
  }

  run(): void {
    // let widget = new Widget();
    // widget.addClass('green-content');
    // widget.title.text = 'Green';
    // this._shell.addToRightArea(widget, { rank: 40 });
    console.log('HANDLER RUN');
    let palette = new CommandPalette();
    console.log('PALETTE CREATED');
    palette.add([
      {
        text: 'Demo',
        items: [{id: 'demo:id', title: 'D', caption: 'A Demo Command'}]
      }
    ]);
    console.log('ADDING TO LEFT AREA');
    this._shell.addToLeftArea(palette, { rank: 40 });
  }

  private _shell: IAppShell;
}
