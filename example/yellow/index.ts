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


export
function createContent(): IContribution {
  let contrib = Object.create(contribProto);
  let widget = new Widget();
  widget.addClass('yellow-content');
  widget.title.text = 'Yellow';
  contrib.item = widget;
  return contrib;
}
