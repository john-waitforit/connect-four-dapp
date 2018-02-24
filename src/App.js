import React, { Component } from 'react';
import ConnectFour from '../output/contracts/ConnectFour.json';
import getWeb3 from './utils/getWeb3';

import XDate from 'xdate';
import JoinGame from './game/joinGame';
import CreateGame from './game/createGame';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

export const State = {
  0: "Ended",
  1: "In Progress",
  2: "Waiting For Player"
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      storageValue: 0,
      web3: null,
      games: [],
    };
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        // Instantiate contract once web3 provided.
        this.instantiateContract()
      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  saveGame(id, gameArray) {
    this.setState((prevState) => {
      let games = prevState.games.slice();
      games[id] = {
        id: id,
        gameName: gameArray[0],
        timeCreated: new XDate(gameArray[1].toNumber() * 1000),
        timeStarted: new XDate(gameArray[2].toNumber() * 1000),
        amountBet: gameArray[3].toNumber(),
        creator: gameArray[4],
        opponent: gameArray[5],
        state: State[gameArray[6].toNumber()],
        isCreatorsTurn: gameArray[7],
        isCreatorWinner: gameArray[8]
      };

      return {games}
    })

  }

  instantiateContract() {
    const contract = require('truffle-contract');
    const connectFour = contract(ConnectFour);
    connectFour.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on ConnectFour.
    let connectFourInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      connectFour.deployed().then((instance) => {
        connectFourInstance = instance;

        this.setState({account: accounts[0], connectFourInstance});
        //this.batchCreateGames();
        this.fetchGames();
        this.fetchFunnyName();
      })
    })
  }

  async fetchGames() {
    let {connectFourInstance} = this.state;
    let n = await connectFourInstance.getNumberOfGames();
    console.log("Number of games:", n.toNumber());
    for(let i = 0; i < n; i++){
      this.saveGame(i, await connectFourInstance.getGameData(i));
    }
  }

  async fetchFunnyName() {
    let {connectFourInstance} = this.state;
    let funnyName = await connectFourInstance.generateRandomName();
    this.setState({funnyName});
  }

  batchCreateGames() {
    let {connectFourInstance, account} = this.state;

    connectFourInstance.createWaitingGame("Test game 01", 6, {from: account});
    connectFourInstance.createWaitingGame("Test game 02", 3, {from: account});
    connectFourInstance.createWaitingGame("Test game 03", 2, {from: account});
    connectFourInstance.createWaitingGame("Test game 04", 1, {from: account});
    connectFourInstance.createWaitingGame("Test game 05", 5, {from: account});

  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Connect Four</a>
        </nav>

        <div className="container">

          <h1>Connect Four!</h1>

          <CreateGame defaultName={this.state.funnyName}/>

          <br/>

          <JoinGame games={this.state.games.filter(game => game.state === State[2])}/>

        </div>
      </div>
    );
  }
}

export default App
