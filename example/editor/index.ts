/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2016, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import CodeMirror = require('codemirror');

import {
  Application
} from 'phosphide/lib/core/application';

import {
  Message
} from 'phosphor-messaging';

import {
  ResizeMessage, Widget
} from 'phosphor-widget';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/javascript/javascript.js';


export
const editorExtension = {
  id: 'phosphide.example.editor',
  activate: activateEditor
};


function activateEditor(app: Application): Promise<void> {
  for (let i = 0; i < 5; ++i) {
    let editor = createEditor(i);
    app.shell.addToMainArea(editor);
  }
  return Promise.resolve<void>();
}


function createEditor(n: number): CodeMirrorWidget {
  let widget = new CodeMirrorWidget({
    mode: 'text/typescript',
    lineNumbers: true,
    tabSize: 2,
  });
  widget.id = `editor-${n}`;
  widget.title.text = `Untitled - ${n}.ts`;
  return widget;
}


class CodeMirrorWidget extends Widget {

  constructor(config?: CodeMirror.EditorConfiguration) {
    super();
    this.addClass('editor-CodeMirrorWidget');
    this._editor = CodeMirror(this.node, config);
  }

  get editor(): CodeMirror.Editor {
    return this._editor;
  }

  protected onAfterAttach(msg: Message): void {
    this._editor.refresh();
  }

  protected onResize(msg: ResizeMessage): void {
    if (msg.width < 0 || msg.height < 0) {
      this._editor.refresh();
    } else {
      this._editor.setSize(msg.width, msg.height);
    }
  }

  private _editor: CodeMirror.Editor;
}
