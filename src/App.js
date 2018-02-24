import React, { Component } from 'react';
import ConnectFour from '../output/contracts/ConnectFour.json';
import getWeb3 from './utils/getWeb3';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

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
    console.log("Game id: " + id, gameArray);

    this.setState((prevState) => {
      let games = prevState.games.slice();
      games[id] = {
        gameName: gameArray[0],
        timeCreated: gameArray[1],
        timeStarted: gameArray[2],
        amountBet: gameArray[3],
        creator: gameArray[4],
        opponent: gameArray[5],
        state: gameArray[6],
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

        //connectFourInstance.createWaitingGame("Test game 01", 6, {from: accounts[0]});
        //connectFourInstance.createWaitingGame("Test game 02", 3, {from: accounts[0]});
        //connectFourInstance.createWaitingGame("Test game 03", 2, {from: accounts[0]});
        //connectFourInstance.createWaitingGame("Test game 04", 4, {from: accounts[0]});

        return connectFourInstance.getNumberOfGames();
      }).then(async (n) => {

        for(let i = 0; i < n; i++){
          this.saveGame(i, await connectFourInstance.getGameData(i));
        }

        //return connectFourInstance.getNumberOfGames();
      })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Connect Four</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Connect the dots!</h1>
              <p>My stupid github page is working.</p>
              <br/>
              {this.state.games.map((game, index) =>
                <div key={index}>
                  <div>{"Game id: " + index}</div>
                  <div>{"Game name: " + game.gameName}</div>
                  <div>{"Amount bet: " + game.amountBet}</div>
                  <br/>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
