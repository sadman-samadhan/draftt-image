import ReactDOM from "react-dom";
import React, { Component } from "react";
import { EditorState, EditorBlock, convertToRaw, convertFromRaw, AtomicBlockUtils, ContentBlock, Modifier, genKey } from "draft-js";
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
import VideoAdd from "./videoAdd";
import AddImagePopup from "./imageAdd";

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

function MediaSidebar({ isOpen, onClose, onImageSelect, onVideoSelect, onAddBlock }) {
  return (
    <div className={`media-sidebar ${isOpen ? "open" : ""}`}>
      <div className="media-sidebar-content">
        <div className="add-media-option" onClick={onImageSelect}>
          Add Image
        </div>
        <div className="add-media-option" onClick={onVideoSelect}>
          Add Video
        </div>
        <div className="add-media-option" onClick={onAddBlock}>
          Add Block
        </div>
        <div className="add-media-option" onClick={onClose}>
          Cancel
        </div>
      </div>
    </div>
  );
}

const handleAddBlock = (editorState) => {
  console.log("Hi");
  const contentState = editorState.getCurrentContent();
  const contentStateWithEntity = contentState.createEntity("TEST", "MUTABLE", {
    a: "b"
  });
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const newEditorState = EditorState.set(editorState, {
    currentContent: contentStateWithEntity
  });
  
  var temp=  AtomicBlockUtils.insertAtomicBlock(
    newEditorState,
    entityKey,
    "<h1>The quick brown fox jumps over the lazy dog. The sun sets in the west, painting the sky with hues of orange and pink. Birds chirp as day turns to night </h1>"
  );

  console.log(temp);
  return temp;
};


const blockRenderer = (contentBlock) => {
  const type = contentBlock.getType();
  // console.log("contentBlock");
  // console.log(contentBlock);
  // console.log(type);
  if (type === "atomic") {
    return {
      component: blockComponent,
      editable: true,
      props: {
        octData: "custom template"
      }
    };
  }
};


const blockComponent = (props) => {
  // const { block, contentState, blockProps } = props;
  // const entity = block.getEntityAt(0);
  //const data =
  //contentState && contentState.getEntity(block.getEntityAt(0)).getData();
  // console.log(block);
  // console.log(props, entity, blockProps);


  return (
    <div
      //contentEditable={false}
      style={{
        border: "1px solid #003366",
        backgroundColor: "#f1f1f1",
        width: "50%",
        height: "120px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row"
      }}
    >

      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "auto",
          justifyContent: "center"
        }}
      >
        <div
          style={{
            border: "1px solid #000",
            padding: "15px",
            width: "80%",
            display: "flex",
            alignSelf: "center"
          }}
        >
        
        <EditorBlock {...props} />

        </div>
      </div>
    </div>
  );
};

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
    editorState: EditorState.createEmpty(),
    suggestions: mentions,
    isImagePopupOpen: false,
    isVideoPopupOpen: false,
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

  toggleVideoPopup = () => {
    this.setState((prevState) => ({
      isVideoPopupOpen: !prevState.isVideoPopupOpen,
    }));
  };

  toggleMediaSidebar = () => {
    this.setState((prevState) => ({
      isMediaSidebarOpen: !prevState.isMediaSidebarOpen,
    }));
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
    this.setState({
      editorState,
      isVideoPopupOpen: false,
    });
  };

  handleAddBlock = () => {
    const { editorState } = this.state;

    this.setState({
      editorState: handleAddBlock(editorState)
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
        <div className="editor">
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            plugins={plugins}
            ref={(element) => {
              this.editor = element;
            }}
            blockRendererFn={blockRenderer}
          />
          <MentionSuggestions
            onSearchChange={this.onSearchChange}
            suggestions={this.state.suggestions}
            onAddMention={this.onAddMention}
          />
          <div className="add-media-icon" onClick={this.toggleMediaSidebar}>
          +
        </div>
          <AlignmentTool />
          <MediaSidebar
          isOpen={this.state.isMediaSidebarOpen}
          onClose={this.toggleMediaSidebar}
          onImageSelect={() => {
            this.toggleMediaSidebar();
            this.setState({ isImagePopupOpen: true });
          }}
          onVideoSelect={() => {
            this.toggleMediaSidebar();
            this.setState({ isVideoPopupOpen: true });
          }}
          onAddBlock={() => {
            this.toggleMediaSidebar();
            this.handleAddBlock();
          }}
        />
        </div>
        <hr />
        <AddImagePopup
          isOpen={this.state.isImagePopupOpen}
          onClose={this.toggleImagePopup}
          onInsertImage={this.handleInsertImage}
        />
        <VideoAdd
          isOpen={this.state.isVideoPopupOpen}
          onClose={this.toggleVideoPopup}
          editorState={this.state.editorState}
          onChange={this.onVideoInsert}
          modifier={this.videoPlugin.addVideo}
        />
      </div>
    );
  }
}

ReactDOM.render(<SimpleMentionEditor />, document.getElementById("root"));
