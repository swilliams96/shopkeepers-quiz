import React, { Component } from "react";

export default class Result extends Component {
	getTime(secs = 0) {
		let mins = 0;
		secs = Math.max(0, Math.round(secs));
		while (true) {
			if (secs < 60) break;
			secs = secs - 60;
			mins++;
		}
		if (secs < 10) secs = "0" + secs;
		return mins + ":" + secs;
	}

	render() {
		if (this.props.correct === null) {
			return (
				<div className="Result">
					<p style={{paddingTop: 20}}>Time Remaining</p>
					<span className="large-text">{this.getTime(this.props.countdown)}</span>
				</div>
			);
		} else {
			return (
				<div className="Result">
					<span className="large-text">{this.props.correct ? "+100" : "+0"} pts</span>
					<p>Next question in {this.getTime(this.props.countdown)}...</p>
				</div>
			);
		}
	}
}