import React from 'react';
import ReactDOM from 'react-dom';

var finalJeopardy;

const getRandomInt = (range, min) => Math.floor(Math.random() * range) + min;

const setTwoDigits = timespan => timespan.length === 1 ? '0' + timespan : timespan;


function fetchFinalJeopardy() {
	let year = getRandomInt(37, 1984);
	let day = getRandomInt(30, 1);
	let month = getRandomInt(11, 1);
	month = setTwoDigits(month);
	day = setTwoDigits(day);
	fetch('https://jarchive-json.glitch.me/game/' + month + '/' + day + '/' + year).then(res => res.json()).then(data => handleData(data))
;}

function handleData(data) {
	if (data.hasOwnProperty('final jeopardy')) {
		finalJeopardy = data['final jeopardy'];
		console.log(data['final jeopardy'].answer);
	} else {
		fetchFinalJeopardy();
	}
}

class Main extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			scores: [],
			winner: false,
			clue: null,
			numberOfPlayers: 3
		}
	}

	use2Players = (num) => {
		playerNumberObj["'"] = 1;
		this.setState({numberOfPlayers: num - 1});
	}

	handleScoresModalSubmit = (event) => {
		event.preventDefault();
		let playerName = document.getElementById('playerNameInput').value;
		let array = this.state.scores;
		array.push({name: playerName, score: 0});
		this.setState({scores: array});
	}

	updateScore = (playerNumber, value) => {
		let array = this.state.scores;
		array[playerNumber].score += value;
		this.setState({scores: array});
	}

	updateAllScores = (newScores) => {
		this.setState({scores: newScores, winner: true})
	}

	handleManualScoreChanging = (position, newScore) => {
		let array = this.state.scores;
		array[position].score = newScore;
		this.setState({scores: array});
	}

	render() {
		if (!(this.state.winner)) {
			return(
					<div>
						<Board handleAnswer={this.updateScore} scores={this.state.scores} updateAllScores={this.updateAllScores} numberOfPlayers={this.state.numberOfPlayers} />
						<ScoresComponent scores={this.state.scores} use2Players={this.use2Players} numberOfPlayers={this.state.numberOfPlayers} handleScoresModalSubmit={this.handleScoresModalSubmit} handleSubmit={this.handleManualScoreChanging} />
					</div>
				);
		} else {
			var max = this.state.scores[0];
			for (let i = 1; i < this.state.scores.length; i++) {
				if (this.state.scores[i].score > max.score) {
					max = this.state.scores[i];
				}
			}
			return(
					<div style={{textAlign: 'center', fontSize: '40px'}}>
						{finalJeopardy.answer}
						<h1>{max.name} wins!</h1>
						<ScoresComponent scores={this.state.scores} use2Players={this.use2Players} numberOfPlayers={this.state.numberOfPlayers} handleScoresModalSubmit={this.handleScoresModalSubmit}/>
					</div>
				);
		}
	}
}

var categoryArray = [];

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			currentClue: null,
			questionsFinished: 0,
			round: 1,
			categoriesArray: [],
			lastCorrectPlayer: 0
		}
	}

	updateQuestion = (clue) => {
		this.setState({currentClue: clue});
	}

	updateLastCorrectplayer = (playerNumber) => {
		this.setState({lastCorrectPlayer: playerNumber});
	}

	finishCategory = () => {
		if (this.state.questionsFinished === 29) {
			if (this.state.round === 2) {
				this.setState({round: 'final'});
			} else {
				this.setState({round: this.state.round + 1, questionsFinished: 0, categoriesArray: []});
			}
		} else {
			this.setState({questionsFinished: this.state.questionsFinished + 1});
		}
	}

	setArrays = (categoryArray) => {
		this.setState({categoriesArray: categoryArray});
	}

	componentDidMount() {
		if (this.state.categoriesArray.length === 0) {
			this.setArrays(categoryArray);
		}
	}

	componentDidUpdate() {
		if (this.state.categoriesArray.length === 0) {
			this.setArrays(categoryArray);
		}
	}

	render() {
		if (this.state.currentClue) {
			if (this.state.currentClue.dailyDouble === true) {
				console.log('worked');
			}
		}
		if (this.state.categoriesArray.length === 0) {
			categoryArray = [];
			let dailyDoubleArray = [0, 0, 0, 0, 0, 0];
			let random;
			for (let c = 0; c < this.state.round; c++) {
				dailyDoubleArray[Math.floor(Math.random() * 6)] += 1;
			}
			console.log(dailyDoubleArray);
			
			for (let i = 0; i < 6; i++) {
				categoryArray.push(<Category id={'C' + i} column={i} dailyDoubles={dailyDoubleArray[i]} key={i} sendQuestion={this.updateQuestion} round={this.state.round} finishCategory={this.finishCategory} />);
			}
		}
		if (this.state.round === 'final') {
			return(
					<div>
						<FinalJeopardy clue={finalJeopardy} scores={this.props.scores} updateAllScores={this.props.updateAllScores} />
					</div>
				);
		} else {
			//let freeze = false;
			//if (this.props.numberOfPlayers === 1) {
				//freeze = 'a';
				//buzzersActive = true;
			//}
			return(
					<div className='grid-container'>
						{this.state.categoriesArray}
						{this.state.currentClue ? <BoardModal  updateQuestionsAnswered={this.finishCategory} scores={this.props.scores} updateLastCorrectPlayer={this.updateLastCorrectplayer} lastCorrectPlayer={this.state.lastCorrectPlayer} clue={this.state.currentClue} updateQuestion={this.updateQuestion} handleAnswer={this.props.handleAnswer} /> : null}
					</div>
				);
		}
	}
}

class FinalJeopardy extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			clue: null,
			'wagers': null,
			'answers': null
		}
	}

	handleData = (data) => {
		if (data.hasOwnProperty('final jeopardy')) {
			this.setState({clue: data['final jeopardy']})
		} else {
			this.fetchClue();
		}
	}

	static getDerivedStateFromProps(props, state) {
		return {clue: props.clue };
	}

	setWagers = (obj) => {
		this.setState(obj);
	}

	fetchClue = () => {
		let year = Math.floor(Math.random() * 37) + 1984;
		let day = Math.floor(Math.random() * 30) + 1;
		let month = Math.floor(Math.random() * 11) + 1;
		month = (month.length === 1 ? '0' + month : month);
		day = (day.length === 1 ? '0' + day : day);
		fetch('https://jarchive-json.glitch.me/game/' + month + '/' + day + '/' + year).then(res => res.json()).then(data => this.handleData(data));
	}

	render() {
		console.log(this.state.wagers);
		if (this.state.wagers) {
			if (this.state.answers) {
				let newScores = this.props.scores;
				for (let i = 0; i < this.props.scores.length; i++) {
					if (this.state.answers[i].toLowerCase() === this.state.clue.answer.toLowerCase().replace(/&/gm, 'and').replace(/<[^>]*>/mg, '').replace(/[^\w\s]|_\/g/mg, ' ').replace(/\s+/g, " ").replace(/^((a )|(the ))/gim, '')) {
						newScores[i].score += Number(this.state.wagers[i]);
					} else {
						newScores[i].score -= Number(this.state.wagers[i]);
					}
				}
				this.props.updateAllScores(newScores);
				return(
						<div>
							hello
						</div>
					);
			} else {
				let HTML = (
					<div style={{transform: 'translate(0%, -50%)'}} className='questionContent'>
				    	<span style={{fontSize: '3.1vw', color: 'white', fontFamily: 'Bebas Neue', fontSize: '7.8vw', position: 'relative'}}><span style={{fontFamily: 'Anonymous', position: 'absolute', top: '100%', fontSize: '7.8vw', left: '50%', transform: 'translate(-50%, -45%)'}}>Jeopardy</span>FINAL</span><br></br><br></br><br></br>
				    	<Wagers scores={this.props.scores} array={'answer'} category={this.state.clue.clue} setWagers={this.setWagers} />
				    </div>
				    );
				return(
						<div>
							<Modal HTML={HTML} fontSize={'1.56vw'} />
						</div>
					);
			}
		} else {
			let HTML = (
					<div className='questionContent' style={{transform: 'translate(0%, -50%)'}}>
						<span style={{fontSize: '3.1vw', color: 'white', fontFamily: 'Bebas Neue', fontSize: '7.8vw', position: 'relative'}}><span style={{fontFamily: 'Anonymous', position: 'absolute', top: '100%', fontSize: '7.8vw', left: '50%', transform: 'translate(-50%, -45%)'}}>Jeopardy</span>FINAL</span><br></br><br></br><br></br>
						<Wagers setWagers={this.setWagers} scores={this.props.scores} array={'wager'} category={this.state.clue.category} />
					</div>
				);
			return(
					<div>
						<Modal HTML={HTML} fontSize={'1.56vw'} />
					</div>
			);	
		}

	}
}

class Modal extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return(
				<div id="id02" style={{display: 'block', fontSize: this.props.fontSize}} tabIndex='0' className="w3-modal">
					  <div className="w3-modal-content" style={{width: '62.4vw', border: '2px solid black'}}>
					    <div className="w3-container questionModal" style={{textAlign: 'center'}}>
					    	{this.props.HTML}
					    </div>
					</div>
				</div>	
			);
	}
}

class Wagers extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			wages: []
		}
	}

	componentDidMount() {
		var input = document.getElementById('answerInput');
		input.style['-webkit-text-security'] = 'disc';
		input.addEventListener('mouseenter', function() { input.style['-webkit-text-security'] = 'none' });
		input.addEventListener('mouseleave', function() { input.style['-webkit-text-security'] = 'disc' });

	}

	componentDidUpdate() {
		document.getElementById('answerInput').value = '';
	}

	handleSubmit = (event) => {
		event.preventDefault();
		let wages = this.state.wages;
		let wager = document.getElementById('answerInput').value;
		wages.push(wager);
		if (wages.length === this.props.scores.length) {
			let obj = {};
			obj[this.props.array + 's'] = wages;
			this.props.setWagers(obj);
			this.setState({wages: []});
		} else {
			this.setState({wages: wages});
		}
		console.log(wages + ' ' + wager + ' ' + this.state.wages);
	}

	render() {
		return(
				<div>
					{this.props.category}
					<br></br>
					<div style={{color: 'red', fontSize: '1.56vw'}}>
						{this.props.scores[this.state.wages.length].name} must {this.props.array}:
					</div>
					<br></br>
					<Form handleSubmit={this.handleSubmit} scores={this.props.scores} />
				</div>
			);
	}
}

class BoardModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			buzzersActive: false,
			freeze: false,
			showAnswer: false,
			retry: false
		}
	}

	componentDidMount() {
		if (this.props.scores.length > 1) {
			document.getElementById('id02').focus();
		} else {
			this.setState({freeze: 'a'});
		}
	}

	componentWillUnmount() {
		this.props.updateQuestionsAnswered();
	}

	componentDidUpdate() {
		let modal = document.getElementById('id02');
		if ((this.state.buzzersActive) && (!(this.state.freeze))) {
			modal.addEventListener('keypress', (event) => this.buzz(event));
		} else {
			modal.removeEventListener('keypress', (event) => this.buzz(event));
		}
		let focusTarget = (this.state.freeze) ? 'answerInput' : 'id02';
		if (this.props.scores.length > 1) {
			document.getElementById(focusTarget).focus();
		}
	}

	

	/*
	runtimer = () => {
		setTimeout(() => { this.setState({initialTimer: this.state.initialTimer - 1}); }, 1000);
		return this.state.initialTimer;
	}

	runBuzzersTimer = () => {
		setTimeout(() => { this.setState({buzzersTimer: this.state.buzzersTimer - 1}); }, 1000);
		return this.state.buzzersTimer;
	}*/

	runtimers = () => {
		setTimeout(() => { this.setState({initialTimer: this.state.initialTimer - 1}); }, 1000);
	}

	activateBuzzers = () => {
		if (this.state.buzzersActive) {
			this.setState({showAnswer: true});
		} else {
			this.setState({buzzersActive: true});	
		}
		
	}

	buzz = (event) => {
		let key = event.key;
		if ((this.state.buzzersActive) && !(this.state.freeze)) {
			if (key === 'a' || key === 'h' || key === "'") {
				event.preventDefault();
				this.setState({freeze: key});
			}
		}
	}

	retry = () => {
		this.setState({retry: true});
	}

	handleAnswer = (event) => {
		event.preventDefault();
		if (this.state.showAnswer) {
			this.props.updateQuestion(null);
			return;
		}
		let answer = document.getElementById('answerInput').value.toLowerCase();
		let value = this.props.clue.value;
		let playerNumber = playerNumberObj[this.state.freeze];
		if (answer !== this.props.clue.answer.toLowerCase()) {
			let re = new RegExp(answer, 'gi');
			if (this.props.clue.answer.search(re, 'regex') > -1) {
				this.setState({retry: true});
				return;
			} else {
				value *= -1;
			}
		} else {
			this.props.updateQuestion(null);
			this.props.updateLastCorrectPlayer(playerNumber);
		}
		this.props.handleAnswer(playerNumber, value);
		if (this.props.scores.length === 1) {
			this.setState({showAnswer: true, freeze: false});
			document.getElementById('id02').focus();
		} else {
			this.setState({freeze: false});
		}
	}

	render() {
		if (!(this.props.clue.dailyDouble)) {
				return(
					<div id="id02" style={{display: 'block'}} tabIndex='0' className="w3-modal">
					  <div className="w3-modal-content questionModal w3-display-container" style={{border: '3px solid black'}}>
					    <div className="w3-container questionContent w3-display-container" style={{fontSize: '2.24vw', textAlign: 'center', transform: 'translate(0, -50%)'}}>		 
						    	{this.props.clue.question.toUpperCase()}
						    <div style={{position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%, 0)'}}>
						    	{this.state.showAnswer ? <Answer answer={this.props.clue.answer} cancelQuestion={this.props.updateQuestion}/> : <Timer timer={Math.ceil(this.props.clue.question.length / 15) + 1} freeze={this.state.freeze} activateBuzzers={this.activateBuzzers} scoreLength={this.props.scores.length} />}
						    	{this.state.freeze && (this.props.scores.length > 1 ) ? (<div>{this.props.scores[playerNumberObj[this.state.freeze]].name} must answer:</div>) : null}
						    	{this.state.freeze ? <Form scores={this.props.scores} handleSubmit={this.handleAnswer} /> : null}
						    	{this.props.scores.length === 1 ? (<button onClick={() => this.setState({showAnswer: true})}>Show answer</button>) : null}
						    	{this.state.retry ? (<div style={{color: 'red'}}><br></br>Your answer was found inside the correct answer, you can try again:</div>) : null}
						    </div>	
					    </div>
					    		
					  </div>
					</div>
				);	
		} else {
			return(
					<div id="id02" style={{display: 'block'}} className="w3-modal">
					  <div className="w3-modal-content questionModal w3-display-container" style={{border: '3px solid black'}}>
					    <div className="w3-container w3-display-container w3-display-middle" style={{position: 'relative', fontSize: '2.24vw', textAlign: 'center'}}>
					    	<span className='w3-display-middle' style={{width: '100%'}}>
								<DailyDouble retry={this.retry} updateLastCorrectPlayer={this.props.updateLastCorrectPlayer} updateQuestion={this.props.updateQuestion} clue={this.props.clue} scores={this.props.scores} lastCorrectPlayer={this.props.lastCorrectPlayer} handleAnswer={this.props.handleAnswer} />
					    		{this.state.retry ? (<div style={{color: 'red'}}><br></br>Your answer was found inside the correct answer, you can try again:</div>) : null}
					    	</span>
						</div>
					  </div>
					</div>
				);
		}
	}
}


class DailyDouble extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			wager: false,
			showAnswer: false
		}
	}

	setWager = (event) => {
		event.preventDefault();
		let wager = Number(document.getElementById('answerInput').value);
		this.setState({wager: wager});
	}

	handleAnswer = (event) => {
		event.preventDefault();
		let value = this.state.wager;
		let answer = document.getElementById('answerInput').value.toLowerCase();
		if (answer !== this.props.clue.answer.toLowerCase()) {
			let re = new RegExp(answer, 'gi');
			if (this.props.clue.answer.search(re, 'regex') > -1) {
				this.props.retry();
				return;
			} else {
				value *= -1;
				this.setState({showAnswer: true});
			}
		} else {
			this.props.updateQuestion(null);
		}
		this.props.handleAnswer(this.props.lastCorrectPlayer, value);
	}

	render() {
		if (!(this.state.wager)) {
			return(
					<div style={{width: '100%'}}>
						<h1 style={{fontSize: '7.8vw', fontFamily: 'Steile Futura'}}>DAILY DOUBLE</h1>
						{this.props.scores[this.props.lastCorrectPlayer].name} must wager:
						<br></br>
						<Form handleSubmit={this.setWager} scores={this.props.scores} />
					</div>
				);
		} else {
			return(
					<div style={{padding: '0 7.8vw'}}>
						{this.props.clue.question.toUpperCase()}
						<br></br>
						<br></br>
						<div style={{position: 'absolute', top: '100%', left: '50%', transform: 'translate(-50%, 0)'}}>
							{this.state.showAnswer ? <Answer answer={this.props.clue.answer} cancelQuestion={this.props.updateQuestion} /> : <Form handleSubmit={this.handleAnswer} scores={this.props.scores} />}
						</div>
					</div>	    
				);
		}
	}
}

class Answer extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return(
				<div style={{fontSize: '2.6vw', textAlign: 'center'}}>
					{this.props.answer}
					<br></br>
					<button onClick={() => this.props.cancelQuestion(null)}>OK</button>
				</div>
			);
	}
}

const playerNumberObj = {'a': 0, 'h': 1, "'": 2};

class Form extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		if (this.props.scores.length > 1) {
			document.getElementById('answerInput').focus();
		}
	}

	render() {
		console.log('form');
		return(
				<form onSubmit={(event) => this.props.handleSubmit(event)}>
					<input id='answerInput' type='text'></input>
				</form>
			);
	}
}

var timeout;
class Timer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			timer: this.props.timer
		}
	}

	componentDidUpdate() {
		if (this.state.timer === 0) {
			this.setState({timer: 5});
			this.props.activateBuzzers();
		}
	}

	runTimer = () => {
		if (!(this.state.timer === 0)) {
			timeout = setTimeout(() => { this.setState({timer: this.state.timer - 1}); }, 1000);
		}
		return this.state.timer;
	}

	pauseTimer = () => {
		clearTimeout(timeout);
		if (this.props.scoreLength > 1) {
			return this.state.timer;
		}
	}

	render() {
		return(
				<div>
					{this.props.freeze ? this.pauseTimer() : this.runTimer()}
				</div>
			);

	}
}

class Category extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			promiseFinished: false,
			questionsChosen: 0
		}
	}

	updateQuestionsAnswered = (clue) => {
		this.props.sendQuestion(clue);
		this.props.finishCategory();
		this.setState({questionsChosen: this.state.questionsChosen + 1});
		/*if (this.state.questionsChosen === 4) {
			this.props.finishCategory();
		} else {
			this.setState({questionsChosen: this.state.questionsChosen + 1});
		}*/
	}

	handleData = (data) => {
		let dailyDoubles = this.props.dailyDoubles;
		let dailyDoublePositions = [];
		for (let i = 0; i < dailyDoubles;) {
			let random = Math.floor(Math.random() * 5);
			if (dailyDoublePositions.indexOf(random) === -1) {
				dailyDoublePositions.push(random);
				i++;
			}
		}
		console.log(dailyDoublePositions);
		let array = [];
		let usedQuestions = [];
		array.push(<CategoryTitleCard id={this.props.id} name={data.title.toUpperCase()} key={this.state.questionsChosen} questionsChosen={this.state.questionsChosen} />);
		let counter = 0;
		let requiredValue = 200;
		let valueCoef = 1;
		let value;
		let answer;	
		let key = 0;
		for (let i = 0; i < 5; i++) {
			try {
				value = data.clues[i].value;
				//change to modulo
				if (value === 100 || value === 300 || value === 500) {
					valueCoef = 2;
					break;
				}
			}
			catch(err) {
				console.log(err);
			}
		}
		console.log(valueCoef);
		let randomClue;
		let length = data.clues.length;
		console.log(data.clues);
		let tried = 0;
		let clue;
		while (counter < 5) {
			if (tried > 50) {
				break;
			}
			randomClue = Math.floor(Math.random() * length);
			clue = data.clues[randomClue];
			value = clue.value;
			console.log(value);
			if (clue.question === '') {
				tried += 1;
				continue;
			}
			if (clue.question.search('seen') > -1) {
				continue;
			}
			answer = removeDiacritics(clue.answer);
			clue.answer = answer.replace(/&/gm, 'and').replace(/<[^>]*>/mg, '').replace(/[^\w\s]|_\/g/mg, ' ').replace(/\s+/g, " ").replace(/^((a )|(the ))/gim, '');
			if (usedQuestions.indexOf(clue.answer) > -1) {
						tried += 1;
						continue;
					}
			if (value !== null) {
				console.log('null');
				if (value * valueCoef !== requiredValue) {
					tried += 1;
					continue;		
				}
			} else {
				console.log('value');
				tried += 1;
				if (tried > 10) {
					value = requiredValue / valueCoef;
					
				} else {
					continue;
				}
			}
			usedQuestions.push(clue.answer);
			
			console.log(clue.answer);
			console.log(clue.value + ' BEFORE ALERT');
			clue.value = value * valueCoef * this.props.round;
			console.log(clue.value + ' ALERT ' + value * valueCoef);
			console.log(clue);
		//	key += clue.answer;
			if (dailyDoublePositions.indexOf(counter) > -1) {
				clue.dailyDouble = true;
			} else {
				clue.dailyDouble = false;
			}
			array.push(<QuestionCard key={clue.answer} value={value * valueCoef} clue={clue} updateQuestionsAnswered={this.updateQuestionsAnswered} />);
			requiredValue += 200;
			counter += 1;
			key += 1;
		}
		if (tried > 50) {
			this.setState({promiseFinished: false});
		} else{
			this.setState({promiseFinished: array});
		}
	}

	render() {
		if (this.state.promiseFinished === false) {
			fetch('https://jservice.io/api/category?id=' + Math.floor(Math.random() * 18418)).then(res => res.json()).then(data => this.handleData(data));
		}
		console.log(this.state.questionsChosen);
		if (this.state.questionsChosen < 5) {
			return(
					<div id='category'>
						{this.state.promiseFinished ? this.state.promiseFinished : null}
					</div>
				);
		} else {
			return(
				<div id='category'>
					<div style={{height: '5.7vw', backgroundColor: '#071277', marginBottom: '0.68vw'}}></div>
					<div style={{height: '5.7vw', backgroundColor: '#071277'}}></div>
					<div style={{height: '5.7vw', backgroundColor: '#071277'}}></div>
					<div style={{height: '5.7vw', backgroundColor: '#071277'}}></div>
					<div style={{height: '5.7vw', backgroundColor: '#071277'}}></div>
					<div style={{height: '5.7vw', backgroundColor: '#071277'}}></div>
				</div>
			);
		}
	}
}

class QuestionCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			chosen: false
		}
	}

	changeState = () => {
		this.setState({chosen: true});
		this.props.updateQuestionsAnswered(this.props.clue);
	}

	render() {
		console.log('hello');
		if (this.state.chosen) {
			return(
					<div style={{height: '5.7vw', backgroundColor: '#071277'}}></div>
				);
		} else {
			return(
					<div onClick={() => this.changeState()} id='question' className='w3-display-container'><span className='w3-display-middle'>{'$' + this.props.clue.value}</span></div>
			);
		}
	}
}

var categoryTitleHeight;

class CategoryTitleCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			fontSize: 1.7
		}
	}

	componentDidMount() {
		categoryTitleHeight = document.getElementsByClassName('categoryTitleContainer')[0].clientHeight;
		let element = document.getElementById(this.props.id);
		if (document.getElementById(this.props.id).clientHeight > categoryTitleHeight) {
			this.setState({fontSize: this.state.fontSize - 0.1});
			/*let currentSize = Number(getComputedStyle(element).getPropertyValue('font-size').slice(0, 2));
			element.style.fontSize = (currentSize - 1) + 'px';*/
		}
	}

	componentDidUpdate() {
		let element = document.getElementById(this.props.id);
		if (document.getElementById(this.props.id).clientHeight > categoryTitleHeight) {
			this.setState({fontSize: this.state.fontSize - 0.1});
		}
	}

	render() {
		console.log(this.props.questionsChosen);
		if (this.props.questionsChosen < 4) {
			return(
					<div className='w3-display-container categoryTitleContainer'><span id={this.props.id} style={{fontSize: this.state.fontSize + 'vw'}} className='categoryTitle w3-display-middle'>{this.props.name}</span></div>
				);
		} else {
			return(
					<div id='categoryTitle'></div>
				);
		}
	}
}

class ScoresComponent extends React.Component {
	constructor(props) {
		super(props);
	}


	render() {
		let scores = this.props.scores;
		let length = scores.length;
		if (length === this.props.numberOfPlayers) {
			let array = [];
			for (let i = 0; i < length; i++) {
				array.push(<ScoreCard name={scores[i].name} score={scores[i].score} key={i} position={i} handleSubmit={this.props.handleSubmit} />);
			}
			return(
					<div className='scoreCardContainer'>
						{array}
					</div>
				);
		} else {
			return(
					<ScoresModal length={length} handleSubmit={this.props.handleScoresModalSubmit} use2Players={this.props.use2Players} />
				);
		}
	}
}

class ScoreCard extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			changingScore: false,
			prevScore: 0
		}
	}

	handleSubmit = (event) => {
		event.preventDefault();
		let newScore = Number(document.getElementById('answerInput').value);
		this.props.handleSubmit(this.props.position, newScore);
		this.setState({changingScore: false});
	}

	getSnapshotBeforeUpdate(prevProps, prevState) {
		if (prevProps.score !== this.props.score) {
			this.setState({prevScore: prevProps.score});
		}
		return null;
	}

	componentDidUpdate() {
		return null;
	}

	undo = () => {
		this.props.handleSubmit(this.props.position, this.state.prevScore);
		//this.setState({prevScore: null});
	}


	render() {
		let int = 1;
		let sign = '$';
		if (this.props.score < 0) {
			int = -1;
			sign = '-' + sign;
		}
	    let score = (this.props.score * int).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

		let button = (
					<div>
						<Form handleSubmit={this.handleSubmit} />
						<button onClick={() => this.setState({changingScore: false})}>Cancel</button>
					</div>
				);
		return(
				<div className='w3-display-container' style={{textAlign: 'center', fontSize: '1.82vw', border: '2px solid black'}}>
					<button style={{fontSize: 'large'}} className='w3-display-topright' onClick={() => this.undo()}>&#8634;</button>
					<span onClick={() => this.setState({changingScore: true})}>
						<div style={{fontFamily: "'Univers 75'", color: 'white', backgroundColor: '#010580', borderBottom: '2px solid black'}}>{sign + score}</div>
						<div style={{fontFamily: 'Cursive', color: 'white', backgroundColor: '#1333ae'}}>{this.props.name}</div>
					</span>
						{this.state.changingScore ? button : null}
				</div>
			);
	}
}

class ScoresModal extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		//document.getElementById('id01').style.display='block';
		document.getElementById('playerNameInput').focus();
	}

	componentDidUpdate() {
		document.getElementById('playerNameInput').value = '';
	}

	render() {
		let nextNumber = this.props.length + 1;

		return(
				<div id="id01" style={{display: 'block'}} className="w3-modal">
				  <div className="w3-modal-content" style={{border: '3px solid black'}}>
				    <div id='scoreModal' style={{textAlign: 'center', color: 'white'}} className="w3-container">
				    	<form onSubmit={(event) => this.props.handleSubmit(event)}>
					      <h1 style={{fontSize: '70px', fontFamily: 'Bebas Neue'}}>Player {nextNumber}&apos;s name:</h1>
				    	  <input style={{fontSize: '40px'}} type='text' id='playerNameInput'></input>
				        </form>
				        {nextNumber > 1 ? (<button style={{fontSize: '25px'}} onClick={() => this.props.use2Players(nextNumber)}>Use only {nextNumber - 1} player{nextNumber > 2 ? 's' : ''}</button>) : null}
				        <br></br>
				    </div>
				  </div>
				</div>
			);
	}
}

function removeDiacritics (str) {

  var defaultDiacriticsRemovalMap = [
    {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
    {'base':'AA','letters':/[\uA732]/g},
    {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
    {'base':'AO','letters':/[\uA734]/g},
    {'base':'AU','letters':/[\uA736]/g},
    {'base':'AV','letters':/[\uA738\uA73A]/g},
    {'base':'AY','letters':/[\uA73C]/g},
    {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
    {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
    {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
    {'base':'DZ','letters':/[\u01F1\u01C4]/g},
    {'base':'Dz','letters':/[\u01F2\u01C5]/g},
    {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
    {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
    {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
    {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
    {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
    {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
    {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
    {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
    {'base':'LJ','letters':/[\u01C7]/g},
    {'base':'Lj','letters':/[\u01C8]/g},
    {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
    {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
    {'base':'NJ','letters':/[\u01CA]/g},
    {'base':'Nj','letters':/[\u01CB]/g},
    {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
    {'base':'OI','letters':/[\u01A2]/g},
    {'base':'OO','letters':/[\uA74E]/g},
    {'base':'OU','letters':/[\u0222]/g},
    {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
    {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
    {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
    {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
    {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
    {'base':'TZ','letters':/[\uA728]/g},
    {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
    {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
    {'base':'VY','letters':/[\uA760]/g},
    {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
    {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
    {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
    {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
    {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
    {'base':'aa','letters':/[\uA733]/g},
    {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
    {'base':'ao','letters':/[\uA735]/g},
    {'base':'au','letters':/[\uA737]/g},
    {'base':'av','letters':/[\uA739\uA73B]/g},
    {'base':'ay','letters':/[\uA73D]/g},
    {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
    {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
    {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
    {'base':'dz','letters':/[\u01F3\u01C6]/g},
    {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
    {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
    {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
    {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
    {'base':'hv','letters':/[\u0195]/g},
    {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
    {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
    {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
    {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
    {'base':'lj','letters':/[\u01C9]/g},
    {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
    {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
    {'base':'nj','letters':/[\u01CC]/g},
    {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
    {'base':'oi','letters':/[\u01A3]/g},
    {'base':'ou','letters':/[\u0223]/g},
    {'base':'oo','letters':/[\uA74F]/g},
    {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
    {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
    {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
    {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
    {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
    {'base':'tz','letters':/[\uA729]/g},
    {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
    {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
    {'base':'vy','letters':/[\uA761]/g},
    {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
    {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
    {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
    {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
  ];

  for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
    str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
  }

  return str;

}

fetchFinalJeopardy();
ReactDOM.render(<Main />, document.getElementById('root'));