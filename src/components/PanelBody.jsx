import React, { Component } from "react";
import Loader from "../components/Loader";
import Question from "../components/Question";
import AnswerContainer from "../components/AnswerContainer";
import Result from "../components/Result";

export default class PanelBody extends Component {
	render() {
		if (this.props.question) {
			return (
				<div className="PanelBody">
					<Question data={this.props.question}/>
					<AnswerContainer data={this.props.question}
													 active={this.props.active}
													 handleClick={this.props.handleClick}
													 selected={this.props.selected}
													 correctAnswer={this.props.correct !== null ? this.props.question["correct"] : ""}
													 prevAnswers={this.props.prevAnswers}/>
					<Result correct={this.props.correct} countdown={this.props.countdown}/>
				</div>
			);
		} else {
			return <Loader/>;
		}
	}
}