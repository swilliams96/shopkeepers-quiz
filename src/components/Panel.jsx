import React, { Component } from "react";

import PanelHeader from "./PanelHeader";
import PanelBody from "./PanelBody";

import axios from "axios";
import shuffle from "shuffle-array";

const API_BASE_URL = "https://skq-api.codebysam.co.uk"
var questions = {};
const uuid = require("uuid/v4");
const USER_ID = uuid().toUpperCase();

console.log(USER_ID);

export default class Panel extends Component {
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
            <div className="wrapper">
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
			</div>
		);
	}
}