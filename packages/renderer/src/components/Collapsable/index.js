import React, { Component } from "react";
import styles from "./styles.js";
import { FaChevronCircleRight, FaChevronCircleDown } from "react-icons/fa";
import { IconContext } from "react-icons";

class Collapsable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen
    };
  }

  toggleState = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };

  titleClick = () => {
    if (this.props.clickableTitle) this.toggleState();
  };

  render() {
    return (
      <div style={{ ...styles.container, ...this.props.style }}>
        <div
          onClick={this.titleClick}
          style={{
            ...styles.title,
            color: "#222222",
            flexDirection: "row",
            display: "flex",
            alignItems: "center"
          }}
        >
          <div>
            <IconContext.Provider
              value={{
                color: "#222222",
                size: "1.5rem",
                marginRight: "1rem",
                fontWeight: 900
              }}
            >
              {(this.state.isOpen && (
                <FaChevronCircleDown onClick={this.toggleState} />
              )) || <FaChevronCircleRight onClick={this.toggleState} />}
            </IconContext.Provider>
          </div>
          <div
            style={{
              margin: "0 0 0 .5rem",
              fontWeight: 900,
              position: "relative",
              top: "-.1rem"
            }}
          >
            {this.props.title}
          </div>
        </div>
        <div style={this.state.isOpen ? styles.uncollapsed : styles.collapsed}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
export default Collapsable;

Collapsable.defaultProps = {
  isOpen: false,
  clickableTitle: true
};
