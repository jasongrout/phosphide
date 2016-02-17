/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  AbstractPaletteModel, StandardPaletteModel
} from 'phosphor-commandpalette';

import {
  DisposableDelegate, IDisposable
} from 'phosphor-disposable';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ABCCommandRegistry
} from './commandregistry';

import {
  ABCShortcutRegistry
} from './shortcutregistry';


/**
 *
 */
export
interface IPaletteItem {
  /**
   *
   */
  command: string;

  /**
   *
   */
  text: string;

  /**
   *
   */
  icon?: string;

  /**
   *
   */
  caption?: string;

  /**
   *
   */
  category?: string;

  /**
   *
   */
  className?: string;
}


/**
 *
 */
export
abstract class ABCPaletteRegistry {
  /**
   * A signal emitted when a command is triggered by the palette.
   */
  get commandTriggered(): ISignal<ABCPaletteRegistry, string> {
    return Private.commandTriggeredSignal.bind(this);
  }

  /**
   *
   */
  get model(): AbstractPaletteModel {
    return this.getModel();
  }

  /**
   * Add command palette items to the palette registry.
   *
   * @param items - The array of items to add to the registry.
   *
   * @returns A disposable which will remove the added items.
   */
  abstract add(items: IPaletteItem[]): IDisposable;

  protected abstract getModel(): AbstractPaletteModel;
}


/**
 *
 */
export
class PaletteRegistry extends ABCPaletteRegistry {
  /**
   *
   */
  constructor(commands: ABCCommandRegistry, shortcuts: ABCShortcutRegistry) {
    super();
    this._commands = commands;
    this._shortcuts = shortcuts;
  }

  /**
   * Add command palette items to the palette registry.
   *
   * @param items - The array of items to add to the registry.
   *
   * @returns A disposable which will remove the added items.
   */
  add(items: IPaletteItem[]): IDisposable {

    let optionsArray = items.map(item => {

      // let commandExists = this._commandRegistry.has(item.id);
      // if (!commandExists) return null;

      let seq = this._shortcuts.sequenceFor(item.command);
      let shortcut = seq ? Private.formatSequence(seq) : '';

      let options = {
        handler: this._executeCommand,
        args: item.command,
        text: item.text,
        shortcut: shortcut,
        icon: item.icon || '',
        caption: item.caption || '',
        category: item.category || ''
      };

      return options;
    });

    if (optionsArray.length === 0) {
      return new DisposableDelegate(null);
    }

    let paletteItems = this._model.addItems(optionsArray);

    return new DisposableDelegate(() => {
      this._model.removeItems(paletteItems);
    });
  }

  /**
   *
   */
  protected getModel(): AbstractPaletteModel {
    return this._model;
  }

  /**
   * The private command handler function.
   */
  private _executeCommand = (id: string) => {
    this.commandTriggered.emit(id);
    this._commands.execute(id);
  };

  private _commands: ABCCommandRegistry;
  private _shortcuts: ABCShortcutRegistry;
  private _model = new StandardPaletteModel();
}


/**
 * The default palette registry service provider.
 */
export
const paletteRegistryProvider = {
  id: 'phosphide.services.paletteRegistry',
  provides: ABCPaletteRegistry,
  requires: [ABCCommandRegistry, ABCShortcutRegistry],
  resolve: (commands: ABCCommandRegistry, shortcuts: ABCShortcutRegistry) => {
    return new PaletteRegistry(commands, shortcuts);
  },
};


/**
 *
 */
namespace Private {
  /**
   * A signal emitted when a command is triggered by the palette.
   */
  export
  const commandTriggeredSignal = new Signal<ABCPaletteRegistry, string>();

  /**
   *
   */
  export
  function formatSequence(seq: string[]): string {
    return seq.map(s => s.trim().replace(/\s+/g, '-')).join(' ');
  }
}
