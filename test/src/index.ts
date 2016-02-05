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



describe('phosphide', () => {
  let reg: CommandRegistry = null;

  describe('CommandRegistry', () => {
    let cmd: (args: any) => void = null;
    let item: ICommandItem = null;
    let count = 0;

    beforeEach(() => {
      count = 0;
      reg = new CommandRegistry();
      cmd = (args: any) => { count += 1; };
      item = {
        id: "cmd:test",
        handler: cmd
      };
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

    beforeEach(() => {
      reg = new CommandRegistry();
      shortcuts = new ShortcutManager(reg);
    });

    describe('#create()', () => {

      it('should create a new instance', () => {
        expect(new ShortcutManager(reg)).to.not.be(shortcuts);
      });

    });

    describe('#constructor()', () => {

      it('should take a single argument', () => {
        expect(shortcuts instanceof ShortcutManager).to.be(true);
      });

    });

  });

});
