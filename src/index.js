import ReactDOM from "react-dom";
import React, { Component } from "react";
import { EditorState, convertToRaw, convertFromRaw, AtomicBlockUtils } from "draft-js";
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
import createToolbarPlugin, { Separator } from "draft-js-static-toolbar-plugin";
import { draftToMarkdown } from "markdown-draft-js";
import createImagePlugin from "draft-js-image-plugin";
import createAlignmentPlugin from "draft-js-alignment-plugin";
import createFocusPlugin from "draft-js-focus-plugin";
import createResizeablePlugin from "draft-js-resizeable-plugin";
import createBlockDndPlugin from "draft-js-drag-n-drop-plugin";
import createVideoPlugin from "draft-js-video-plugin";
import createDragNDropUploadPlugin, { readFile } from "@mikeljames/draft-js-drag-n-drop-upload-plugin";
import VideoAdd from "./videoAdd"

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
      text: "Hello...",
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
      text: "Write here",
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

class AddImagePopup extends Component {
  state = {
    imageUrl: "",
  };

  handleInputChange = (event) => {
    this.setState({
      imageUrl: event.target.value,
    });
  };

  handleInsertImage = () => {
    const { onInsertImage } = this.props;
    const { imageUrl } = this.state;
    onInsertImage(imageUrl);
    this.setState({
      imageUrl: "",
    });
  };

  render() {
    const { isOpen, onClose } = this.props;
    const { imageUrl } = this.state;

    if (!isOpen) {
      return null;
    }

    return (
      <div className="image-popup">
        <div className="image-popup-content">
          <div className="image-popup-header">
            <span className="image-popup-title">Insert Image</span>
            <button className="image-popup-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="image-popup-body">
            <input
              type="text"
              value={imageUrl}
              onChange={this.handleInputChange}
              placeholder="Enter image URL"
            />
          </div>
          <div className="image-popup-footer">
            <button className="image-popup-insert" onClick={this.handleInsertImage}>
              Insert
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default class SimpleMentionEditor extends Component {
  constructor(props) {
    super(props);

    this.toolbarPlugin = createToolbarPlugin();

    this.imagePlugin = createImagePlugin({ decorator });
    this.videoPlugin = createVideoPlugin({ decorator });

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
    isImagePopupOpen: false,
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

  handleInsertImage = (imageUrl) => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity("IMAGE", "IMMUTABLE", { src: imageUrl });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " "),
      isImagePopupOpen: false,
    });
  };

  toggleImagePopup = () => {
    this.setState((prevState) => ({
      isImagePopupOpen: !prevState.isImagePopupOpen,
    }));
  };

  handleInsertVideo = (videoUrl) => {
    const { editorState } = this.state;
    const contentState = editorState.getCurrentContent();
    console.log(videoUrl);
    const contentStateWithEntity = contentState.createEntity("video", "IMMUTABLE", { src: videoUrl });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    // Use EditorState.push to efficiently update the content state
    const newEditorState = EditorState.push(
      editorState,
      contentStateWithEntity,
      "create-entity"
    );

    this.setState({
      editorState: AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, " "),
      isVideoPopupOpen: false,
    });
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

  onVideoInsert = (editorState) => {
    // Give option for get video html tag
    // This option use for covert  to html tag

    let options = {
      entityStyleFn: (entity) => {
        const entityType = entity.get("type").toLowerCase();
        // For video
        if (entityType === "draft-js-video-plugin-video") {
          const data = entity.getData();
          return {
            element: "iframe",
            attributes: {
              src: data.src
            },
            style: {
              // Put styles here...
            }
          };
        }

        // for Image
        if (entityType === "image") {
          const data = entity.getData();
          return {
            element: "img",
            attributes: {
              src: data.src
            },
            style: {
              // width: '100px'
            }
          };
        }
        return null;
      }
    };

    // Use for console only
 
    // see this url for image example https://github.com/sstur/draft-js-utils/pull/85/files

    this.setState({
      editorState
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
      this.videoPlugin,
    ];

    return (
      <div className="editor-container">
        <div className="toolbar">
          <Toolbar>
            {(externalProps) => (
              <React.Fragment>
                <div className="toolbar-row">
                  <HeadlineOneButton {...externalProps} />
                  <HeadlineTwoButton {...externalProps} />
                  <HeadlineThreeButton {...externalProps} />
                </div>
                <div className="toolbar-row">
                  <BoldButton {...externalProps} />
                  <ItalicButton {...externalProps} />
                  <UnderlineButton {...externalProps} />
                  <CodeButton {...externalProps} />
                </div>
                <div className="toolbar-row">
                  <UnorderedListButton {...externalProps} />
                  <OrderedListButton {...externalProps} />
                  <BlockquoteButton {...externalProps} />
                </div>
              </React.Fragment>
            )}
          </Toolbar>
        </div>
        <div className="editor" onClick={this.focus}>
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
          <div className="add-image-icon" onClick={this.toggleImagePopup}>
            +
          </div>
          <AlignmentTool />
        </div>
        <hr />
        <AddImagePopup
          isOpen={this.state.isImagePopupOpen}
          onClose={this.toggleImagePopup}
          onInsertImage={this.handleInsertImage}
        />
        <VideoAdd
          editorState={this.state.editorState}
          onChange={this.onVideoInsert}
          modifier={this.videoPlugin.addVideo}
        />
      </div>
    );
  }
}

ReactDOM.render(<SimpleMentionEditor />, document.getElementById("root"));
