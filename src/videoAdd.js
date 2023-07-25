import React, { Component } from "react";
import styles from "./styles.css";

export default class VideoAdd extends Component {
  // Start the popover closed
  state = {
    videoUrl: "",
    isVideoPopupOpen: false,

  };


  addVideo = () => {
    const { editorState, onChange } = this.props;
    onChange(this.props.modifier(editorState, { src: this.state.videoUrl }));
  };

  changeVideoUrl = (evt) => {
    this.setState({ videoUrl: evt.target.value });
  };

  render() {
    const { isOpen, onClose } = this.props;

    if (!isOpen) {
      return null;
    }
    return (
      <div className="image-popup">
        <div className="image-popup-content">
          <div className="image-popup-header">
            <span className="image-popup-title">Insert Video</span>
            <button className="image-popup-close" onClick={onClose}>
              &times;
            </button>
          </div>
          <div className="image-popup-body">
            <input
              type="text"
              onChange={this.changeVideoUrl}
              value={this.state.videoUrl}
              placeholder="Enter video videoUrl"
            />
          </div>
          <div className="image-popup-footer">
            <button className="image-popup-insert" onClick={this.addVideo}>
              Insert
            </button>
          </div>
        </div>
      </div>
    );
  }
}