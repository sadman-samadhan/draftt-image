import React, { Component } from "react";
import styles from "./styles.css";

export default class AddImagePopup extends Component {
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