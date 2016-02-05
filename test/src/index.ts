/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  ICommandItem
} from '../../lib/commandregistry/index';

import {
  CommandRegistry
} from '../../lib/commandregistry/plugin';

import {
  IShortcutItem
} from '../../lib/shortcutmanager/index';

import {
  ShortcutManager
} from '../../lib/shortcutmanager/plugin';


class ExtendedShortcutManager extends ShortcutManager {
  signalCount = 0;

  onSignal(s: any, v: any) {
    this.signalCount++;
  }
}


describe('phosphide', () => {
  let reg: CommandRegistry = null;
  let cmd: (args: any) => void = null;
  let item: ICommandItem = null;
  let count = 0;

  beforeEach(() => {
    reg = new CommandRegistry();
    cmd = (args: any) => { count += 1; };
    item = {
      id: "cmd:test",
      handler: cmd
    };
  });

  describe('CommandRegistry', () => {

    beforeEach(() => {
      count = 0;
    });

    describe('#create()', () => {

      it('should return a new instance', () => {
        expect(CommandRegistry.create()).to.not.be(reg);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        expect(reg instanceof CommandRegistry).to.be(true);
      });

    });

    describe('#list()', () => {

      it('should return an empty array by default', () => {
        expect(reg.list().length).to.be(0);
      });

      it('should return an array of keys if commands are registered', () => {
        reg.add([item]);
        expect(reg.list().length).to.be(1);
      });

      it('should return a new array each time', () => {
        expect(reg.list()).to.not.be(reg.list());
      });

    });

    describe('#get()', () => {

      it('should return `undefined` if command is not registered', () => {
        expect(reg.get("cmd:test")).to.be(undefined);
      });

      it('should correctly return a registered command', () => {
        reg.add([item]);
        expect(reg.get("cmd:test")).to.be(cmd);
      });

    });

    describe('#add()', () => {

      it('should return a disposable', () => {
        let disp = reg.add([item]);
        expect(reg.list().length).to.be(1);
        disp.dispose();
        expect(reg.list().length).to.be(0);
      });

      it('should not add a given id more than once', () => {
        let disp = reg.add([item]);
        let item2 = {
          id: "cmd:test",
          handler: cmd
        };
        let disp2 = reg.add([item2]);
        expect(reg.list().length).to.be(1);
        disp2.dispose();
        expect(reg.list().length).to.be(1);
        disp.dispose();
        expect(reg.list().length).to.be(0);
      });

    });

  });

  describe('ShortcutManager', () => {
    let shortcuts: ShortcutManager = null;
    let shortItem: IShortcutItem = null;

    beforeEach(() => {
      shortcuts = new ShortcutManager(reg);
    });

    describe('#create()', () => {

      it('should create a new instance', () => {
        expect(ShortcutManager.create(reg)).to.not.be(shortcuts);
      });

    });

    describe('#constructor()', () => {

      it('should take a single argument', () => {
        expect(shortcuts instanceof ShortcutManager).to.be(true);
      });

    });

    describe('#add()', () => {

      it('should ')
    });

    describe('#shortcutsAdded', () => {
      let ext: ExtendedShortcutManager = null;
      let shortItem: IShortcutItem = null;

      beforeEach(() => {
        reg.add([item]);
        ext = new ExtendedShortcutManager(reg);
        shortItem = {
          sequence: ['Ctrl E'],
          selector: '*',
          command: "cmd:test",
        };
      })

      it('should signal when items are added', () => {
        ext.shortcutsAdded.connect(ext.onSignal, ext);
        expect(ext.signalCount).to.be(0);
        ext.add([shortItem]);
        expect(ext.signalCount).to.be(1);
      });

    });

    describe('#shortcutsRemoved', () => {
      let ext: ExtendedShortcutManager = null;
      let shortItem: IShortcutItem = null;

      beforeEach(() => {
        reg.add([item]);
        ext = new ExtendedShortcutManager(reg);
        shortItem = {
          sequence: ['Ctrl H'],
          selector: '*',
          command: "cmd:test"
        };
      });

      it('should signal when items are removed', () => {
        ext.shortcutsRemoved.connect(ext.onSignal, ext);
        expect(ext.signalCount).to.be(0);
        let disp = ext.add([shortItem]);
        expect(ext.signalCount).to.be(0);
        disp.dispose();
        expect(ext.signalCount).to.be(1);
      });

    });

    describe('#getSequences()', () => {
      let short1: IShortcutItem = null;
      let short2: IShortcutItem = null;

      beforeEach(() => {
        short1 = {
          sequence: ['Ctrl H'],
          selector: '*',
          command: 'cmd:test',
          args: 0
        };
        short2 = {
          sequence: ['Ctrl J'],
          selector: '*',
          command: 'cmd:test',
          args: 1
        };

      });

      it('should return all valid sequences', () => {
        shortcuts.add([short1, short2]);
        let results = shortcuts.getSequences('cmd:test', 0);
        expect(results.length).to.be(1);
        expect(results[0].length).to.be(1);
        expect(results[0][0]).to.be('Ctrl H');

        let results1 = shortcuts.getSequences('cmd:test', 1);
        expect(results1.length).to.be(1);
        expect(results1[0].length).to.be(1);
        expect(results1[0][0]).to.be('Ctrl J');
      });

      it('should perform deep equality test before adding', () => {
        short1.args = { first: { second: 'third' } };
        short2.args = { first: { second: 'third' } };
        shortcuts.add([short1, short2]);

        let args = { first: { second: 'third' } };
        let results = shortcuts.getSequences('cmd:test', args);
        expect(results.length).to.be(1);
        expect(results[0].length).to.be(1);
      })

    });



  });

});
