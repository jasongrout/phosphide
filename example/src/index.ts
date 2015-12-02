/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IContribution
} from 'phosphor-plugins';

import {
  Widget
} from 'phosphor-widget';


let contribProto: IContribution = {
  item: null,
  isDisposed: false,
  dispose: function() {
    this.isDisposed = true;
    this.item = null;
  },
};


function createContent(title: string): Widget {
  let widget = new Widget();
  widget.addClass(title.toLowerCase());
  widget.title.text = title;
  return widget;
}


export
function createRed(): IContribution {
  let contrib = Object.create(contribProto);
  contrib.item = createContent('Red');
  return contrib;
}


export
function createGreen(): IContribution {
  let contrib = Object.create(contribProto);
  contrib.item = createContent('Green');
  return contrib;
}


export
function createBlue(): IContribution {
  let contrib = Object.create(contribProto);
  contrib.item = createContent('Blue');
  return contrib;
}


export
function createYellow(): IContribution {
  let contrib = Object.create(contribProto);
  contrib.item = createContent('Yellow');
  return contrib;
}
