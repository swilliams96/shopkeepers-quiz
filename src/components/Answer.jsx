import React, { Component } from "react";

import mana from "../img/mana.png";
import cooldown from "../img/cooldown.png";
import gold from "../img/gold.png";

export default class Answer extends Component {
	getIcon(type) {
		if (type === "mana") {
			return <img src={mana} className={"icon"} alt="Mana Cost"/>
		} else if (type === "cooldown") {
			return <img src={cooldown} className={"icon"} alt="Cooldown"/>
		} else if (type === "gold") {
			return <img src={gold} className={"icon"} alt="Gold Cost"/>
		}

		return;
	}

	getPrevAnswerBar (percentage) {
		if (percentage > 0) {
			return (
				<div className="PreviousAnswerContainer" style={{ flexDirection: "row" }}>
					<div className="PreviousAnswerLabel">{percentage}%</div>
					<div className="PreviousAnswerBar" style={{width: percentage + "%"}}></div>
				</div>
			);
		}
		return;
	}

	render() {
		const icon = (this.props.type !== "" ? this.getIcon(this.props.type) : "");
		return (
			<div className="Answer">
				<a onClick={() => this.props.handleClick(this.props.value)} className={this.props.className || (this.props.active ? "active" : "")}>
					<p>{icon}{this.props.value}</p>
				</a>
			{this.getPrevAnswerBar(this.props.prevAnswerPercentage)}
			</div>
		);
	}
}