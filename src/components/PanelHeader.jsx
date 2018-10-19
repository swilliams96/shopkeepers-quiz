import React, { Component } from "react";

export default class PanelHeader extends Component {
	render() {
		return (
			<div className="PanelHeader">
				<b className="left-align">DotA 2 Trivia</b>
				<span className="right-align score">{this.props.score} pts</span>
			</div>
		);
	}
}