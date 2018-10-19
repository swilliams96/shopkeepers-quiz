import React, { Component } from "react";
import Answer from "../components/Answer";

export default class AnswerContainer extends Component {
	renderAnswer(answer, key, prevAnswerPercentage) {
		let className = (answer === this.props.selected ? "selected " : "");
		if (this.props.correctAnswer)
			className += (answer === this.props.correctAnswer ? "correct" : "incorrect");

		return (
			<Answer value={answer}
							key={key}
							handleClick={this.props.handleClick}
							active={this.props.active}
							type={this.props.data["type"]}
							className={className}
							prevAnswerPercentage={prevAnswerPercentage} />
		);
	}

	renderAnswers() {
		let options = this.props.data["answers"], answers = [];
		if (options) {
			for (let i = 0; i < options.length; i++) {
				let prevAnswerPercentage = 0;
				if (this.props.prevAnswers) {
					let totalAnswerCount = 0, myAnswerCount;
					this.props.prevAnswers.forEach(prevAnswer => {
						if (prevAnswer.answer === options[i]) {
							myAnswerCount = prevAnswer.count;
						}
						totalAnswerCount += prevAnswer.count;
					});
					prevAnswerPercentage = Math.round((myAnswerCount/totalAnswerCount) * 100);
				}

				answers.push(this.renderAnswer(options[i], i, prevAnswerPercentage));
			}
		}
		return answers;
	}

	render() {
		return (
			<div className="AnswerContainer">
				{this.renderAnswers()}
			</div>
		);
	}
}
