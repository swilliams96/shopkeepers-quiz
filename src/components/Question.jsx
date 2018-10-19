import React, { Component } from "react";

export default class Question extends Component {
	render() {
		const imgStyle = (this.props.data["type"] === "gold" ? { marginTop: 30, marginBottom: 42 } : { marginTop: 5, marginBottom: 10 });
		const image = (this.props.data["image"] ? <img src={this.props.data["image"]} className={"image"} style={imgStyle} alt="" draggable="false"/> : "");

		return (
			<div className="Question" style={{ minHeight: 175 }}>
				<h1>{this.props.data["question"]}</h1>
				{image}
			</div>
		);
	}
}