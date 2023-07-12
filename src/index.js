import ReactDOM from "react-dom";

import React, { Component } from "react";
import { EditorState, convertToRaw, convertFromRaw } from "draft-js";
import Editor, { composeDecorators } from "draft-js-plugins-editor";
import createMentionPlugin, {
  defaultSuggestionsFilter,
} from "draft-js-mention-plugin";
import "./editor-styles.css";
import "draft-js-mention-plugin/lib/plugin.css";
import "draft-js-static-toolbar-plugin/lib/plugin.css";
import "draft-js-image-plugin/lib/plugin.css";
import "draft-js-alignment-plugin/lib/plugin.css";
import "draft-js-focus-plugin/lib/plugin.css";

import createToolbarPlugin from "draft-js-static-toolbar-plugin";
import { draftToMarkdown } from "markdown-draft-js";
import createImagePlugin from "draft-js-image-plugin";

import createAlignmentPlugin from "draft-js-alignment-plugin";

import createFocusPlugin from "draft-js-focus-plugin";

import createResizeablePlugin from "draft-js-resizeable-plugin";

import createBlockDndPlugin from "draft-js-drag-n-drop-plugin";

import createDragNDropUploadPlugin, {
  readFile,
} from "@mikeljames/draft-js-drag-n-drop-upload-plugin";

import {
  ItalicButton,
  BoldButton,
  UnderlineButton,
  CodeButton,
  HeadlineOneButton,
  HeadlineTwoButton,
  HeadlineThreeButton,
  UnorderedListButton,
  OrderedListButton,
  BlockquoteButton,
} from "draft-js-buttons";

const mentions = [
  {
    name: "TEST GLOS",
  },
];

const initialState = {
  entityMap: {
    0: {
      type: "IMAGE",
      mutability: "IMMUTABLE",
      data: {
        src: "https://dummyimage.com/600x400/000/fff",
      },
    },
  },
  blocks: [
    {
      key: "9gm3s",
      text: "You can have images in your text field. This is a very rudimentary example, but you can enhance the image plugin with resizing, focus or alignment plugins.",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
    {
      key: "ov7r",
      text: " ",
      type: "atomic",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [
        {
          offset: 0,
          length: 1,
          key: 0,
        },
      ],
      data: {},
    },
    {
      key: "e23a8",
      text: "See advanced examples further down …",
      type: "unstyled",
      depth: 0,
      inlineStyleRanges: [],
      entityRanges: [],
      data: {},
    },
  ],
};

const focusPlugin = createFocusPlugin();
const resizeablePlugin = createResizeablePlugin();
const blockDndPlugin = createBlockDndPlugin();
const alignmentPlugin = createAlignmentPlugin();
const { AlignmentTool } = alignmentPlugin;

const decorator = composeDecorators(
  resizeablePlugin.decorator,
  alignmentPlugin.decorator,
  focusPlugin.decorator,
  blockDndPlugin.decorator
);

function mockUpload(data, success, failed, progress) {
  function doProgress(percent) {
    progress(percent || 1);
    if (percent === 100) {
      // Start reading the file
      Promise.all(data.files.map(readFile)).then((files) =>
        success(files, { retainSrc: true })
      );
    } else {
      setTimeout(doProgress, 250, (percent || 0) + 10);
    }
  }

  doProgress();
}

export default class SimpleMentionEditor extends Component {
  constructor(props) {
    super(props);

    this.toolbarPlugin = createToolbarPlugin();

    this.imagePlugin = createImagePlugin({ decorator });

    this.dragNDropFileUploadPlugin = createDragNDropUploadPlugin({
      handleUpload: mockUpload,
      addImage: this.imagePlugin.addImage,
    });

    this.mentionPlugin = createMentionPlugin({
      mentionTrigger: "\\",
      entityMutability: "MUTABLE",
    });
  }

  state = {
    editorState: EditorState.createWithContent(convertFromRaw(initialState)),
    suggestions: mentions,
  };

  onChange = (editorState) => {
    this.setState({
      editorState,
    });
  };

  onSearchChange = ({ value }) => {
    this.setState({
      suggestions: defaultSuggestionsFilter(value, mentions),
    });
  };

  onAddMention = () => {
    // get the mention object selected
  };

  focus = () => {
    this.editor.focus();
  };

  renderMarkdown = () => {
    const contentState = this.state.editorState.getCurrentContent();
    const foo = convertToRaw(contentState);
    return draftToMarkdown(foo, {
      entityItems: {
        "\\mention": {
          open: function (entity) {
            return `<Glossary name="${entity.data.mention.name}" >`;
          },

          close: function (entity) {
            return "</Glossary>";
          },
        },
      },
    });
  };

  render() {
    const { MentionSuggestions } = this.mentionPlugin;
    const { Toolbar } = this.toolbarPlugin;

    const plugins = [
      this.mentionPlugin,
      this.toolbarPlugin,
      this.dragNDropFileUploadPlugin,
      blockDndPlugin,
      focusPlugin,
      alignmentPlugin,
      resizeablePlugin,
      this.imagePlugin,
    ];

    return (
      <div>
        <div className={"editor"} onClick={this.focus}>
          <Toolbar>
            {(externalProps) => (
              <div>
                <HeadlineOneButton {...externalProps} />
                <HeadlineTwoButton {...externalProps} />
                <HeadlineThreeButton {...externalProps} />

                <BoldButton {...externalProps} />
                <ItalicButton {...externalProps} />
                <UnderlineButton {...externalProps} />
                <CodeButton {...externalProps} />
                <UnorderedListButton {...externalProps} />
                <OrderedListButton {...externalProps} />
                <BlockquoteButton {...externalProps} />
              </div>
            )}
          </Toolbar>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => {
              this.editor = element;
            }}
          />
          <MentionSuggestions
            onSearchChange={this.onSearchChange}
            suggestions={this.state.suggestions}
            onAddMention={this.onAddMention}
          />

          <AlignmentTool />
        </div>
        <hr />
      </div>
    );
  }
}

ReactDOM.render(<SimpleMentionEditor />, document.getElementById("root"));
