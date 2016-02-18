/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  AbstractPaletteModel, StandardPaletteItem, StandardPaletteModel
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
    this._shortcuts.shortcutsAdded.connect(this._onShortcutsChanged, this);
    this._shortcuts.shortcutsRemoved.connect(this._onShortcutsChanged, this);
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

    let boxes = this._model.addItems(optionsArray).map(item => ({ item }));
    Array.prototype.push.apply(this._boxes, boxes);

    return new DisposableDelegate(() => {
      this._model.removeItems(boxes.map(box => box.item));
      this._boxes = this._boxes.filter(box => boxes.indexOf(box) === -1);
    });
  }

  /**
   *
   */
  protected getModel(): AbstractPaletteModel {
    return this._model;
  }

  /**
   * Update the shortcut for the given item pair.
   */
  private _updateShortcut(box: Private.IItemBox): void {
    let seq = this._shortcuts.sequenceFor(box.item.args);
    let shortcut = seq ? Private.formatSequence(seq) : '';

    let options = {
      handler: this._executeCommand,
      args: box.item.args,
      text: box.item.text,
      shortcut: shortcut,
      icon: box.item.icon,
      caption: box.item.caption,
      category: box.item.category
    };

    this._model.removeItem(box.item);

    box.item = this._model.addItem(options);
  }

  /**
   * A handler for shortcut registry signals.
   */
  private _onShortcutsChanged(sender: ABCShortcutRegistry, commands: string[]): void {
    let changed: { [id: string]: boolean } = Object.create(null);
    commands.forEach(id => { changed[id] = true; });

    for (let box of this._boxes) {
      let relevant = box.item.args in changed;
      if (relevant) this._updateShortcut(box);
    }
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
  private _boxes: Private.IItemBox[] = [];
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
  interface IItemBox {
    /**
     *
     */
    item: StandardPaletteItem;
  }

  /**
   *
   */
  export
  function formatSequence(seq: string[]): string {
    return seq.map(s => s.trim().replace(/\s+/g, '-')).join(' ');
  }
}
