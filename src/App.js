import React, { Component } from "react";
import axios from "axios";
import shuffle from "shuffle-array";

import "./reset.css";
import "./loader.css";
import "./App.css";

import mana from "./img/mana.png";
import cooldown from "./img/cooldown.png";
import gold from "./img/gold.png";

const API_BASE_URL = "https://skq-api.codebysam.co.uk"
var questions = {};
const uuid = require("uuid/v4");
const USER_ID = uuid().toUpperCase();

console.log(USER_ID);

/* * * * * * * * * * * * * * * * */
/* * * * REACT COMPONENTS  * * * */
/* * * * * * * * * * * * * * * * */

class Answer extends Component {
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


class AnswerContainer extends Component {
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


class Result extends Component {
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


class Question extends Component {
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


function Loader() {
	return (
		<div className="Loader">
			<div className="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
			<p>Loading...</p>
		</div>
	);
}


class PanelBody extends Component {
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


class PanelHeader extends Component {
	render() {
		return (
			<div className="PanelHeader">
				<b className="left-align">DotA 2 Trivia</b>
				<span className="right-align score">{this.props.score} pts</span>
			</div>
		);
	}
}


class Panel extends Component {
	constructor(props) {
		super(props);
		this.handleClick = this.handleClick.bind(this);
		this.state = {
			score: 0,
			question: null,
			countdown: null,
			active: true,
			correct: null,
			selected: null,
			prevAnswers: null
		}
	}

	componentDidMount() {
		this.getNewQuestions();
		this.timerID = setInterval(
			() => this.tick(),
			1000
		);
	}

	componentWillUnmount() {
		clearInterval(this.timerID);
	}

	getNewQuestions() {
		axios.get(API_BASE_URL + "/questions/live")
			.then(res => {
				questions = res["data"]["questions"];
				this.updateCurrentQuestion();
			});
	}

	updateCurrentQuestion() {
		if (questions.length === 0) {
			console.log("Requesting questions...");
			this.getNewQuestions();
			return;
		}

		let now = Math.round((new Date()).getTime() / 1000);
		let futureQuestions = 0;

		this.setState({ question: null });
		questions.forEach(question => {
			if (question["finish"] > now) {
				if (question["start"] <= now + 1) {
					this.setNewQuestion(question);
					return;
				}
				futureQuestions++;
			}
		});

		// When we are going to run out of questions soon retrieve the next ones
		if (futureQuestions === 1) {
			console.log("Current question list is out of date, requesting new questions from the API...");
			this.getNewQuestions();
		}
	}

	setNewQuestion(question) {
		if (question == null || question["question"] == null) return null;

		let now = Math.round((new Date()).getTime() / 1000);
		let options = [], fillers = question["question"]["incorrect"].slice();

		console.log("Setting new question... (" + now + ")");

		options.push(question["question"]["correct"]);						// Add correct answer to the options
		if (question["question"]["incorrect"].length > 3) {
			for (let i = 0; i < 3; i++) {									// Loop through wrong answers and pick 3 at random
				let x = Math.floor(Math.random() * fillers.length);
				options.push(fillers[x]);
				fillers.splice(x, 1);
			}
		} else {
			question["question"]["incorrect"].forEach(function(option) {	// Add the three incorrect answers to the options
				options.push(option);
			});
		}

		question["question"]["answers"] = shuffle(options);					// Shuffle the final options and add them to a new "answers" property

		this.setState({		
			question: question["question"],
			answers: question["question"]["answers"],
			selected: null,
			correct: null,
			countdown: (question["finish"] - now),
			active: true,
			prevAnswers: null
		});

		window.ga('send', 'event', 'Question', 'Loaded', question["question"]["id"]);
	}

	handleClick(answer) {
		if (this.state.active) {
			this.setState({
				active: false,
				selected: answer
			});

			axios.post(API_BASE_URL + "/answer", {
				id: this.state.question.id,
				answer: answer,
				userid: USER_ID
			});

			window.ga('send', 'event', 'Answer', 'Submitted', this.state.question.id);
		}
	}

	checkAnswer() {
		this.getPreviousAnswers();
		if (this.state.selected === this.state.question["correct"]) {
			this.setState((prevState) => ({
				correct: true,
				score: prevState.score + 100,
			}));
		} else {
			this.setState({correct: false});
		}
	}

	getPreviousAnswers() {
		if (this.state.question == null) return;

		axios.get(API_BASE_URL + "/answer/" + this.state.question.id)
			.then(res => {
				let prevAnswers = res.data;
				if (prevAnswers.length >= 0) {
					let totalAnswerCount = 0, myAnswerCount = 0;
					prevAnswers.forEach(ans => {
						if (ans.answer === this.state.selected)
							myAnswerCount = ans.count;
						if (this.state.question["answers"].includes(ans.answer))
							totalAnswerCount += ans.count;
					});

					let prevAnswerRatio = (myAnswerCount/totalAnswerCount);
					if (prevAnswerRatio > 0 && prevAnswerRatio < 1) {
						this.setState({ prevAnswers: prevAnswers });
					}
				}
			});
	}

	tick() {
		if (this.state.countdown <= 0) {
			if (this.state.correct === null && this.state.question) {
				this.checkAnswer();
				this.setState({
					active: false,
					countdown: 4
				});
			} else {
				this.updateCurrentQuestion();
			}
		}

		this.setState((prevState) => ({countdown: prevState.countdown - 1}));
	}

	render() {
		return (
			<div className="Panel">
				<PanelHeader score={this.state.score}/>
				<PanelBody question={this.state.question}
									 selected={this.state.selected}
									 active={this.state.active}
									 correct={this.state.correct}
									 handleClick={this.handleClick}
									 countdown={this.state.countdown}
									 prevAnswers={this.state.prevAnswers}/>
			</div>
		);
	}
}


export default class App extends Component {
  render() {
    return (
    	<div className="App">
				<Panel/>
			</div>
		);
  }
}

