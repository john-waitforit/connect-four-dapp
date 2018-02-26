import React, { Component } from 'react';
import ConnectFour from '../output/contracts/ConnectFour.json';
import getWeb3 from './utils/getWeb3';

import swal from 'sweetalert';
import XDate from 'xdate';
import VideoGame from 'material-ui-icons/VideogameAsset';
import {Button} from "material-ui";
import Modal from 'react-responsive-modal';

import ListGames from './game/listGames';
import CreateGame from './game/createGame';
import PlayGame from './game/playGame';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

const loader = require('./img/ethereum.gif');

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
      account: null,
      connectFourInstance: null,
      isOwner: false,
      loading: false,
      inGame: true,
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

  openLoading = () => {
    this.setState({loading: true});
  };

  stopLoading = () => {
    this.setState({loading: false});
  };

  saveGameArray(id, gameArray) {
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
        state: gameArray[6].toNumber(),
        isCreatorsTurn: gameArray[7],
        isCreatorWinner: gameArray[8]
      };

      return {games}
    })

  }

  saveGameObject(game) {
    let existed = false;
    this.setState((prevState) => {
      let games = prevState.games.slice();
      let {gameId, gameName, timeCreated, timeStarted, amountBet, creator, opponent, state, isCreatorsTurn, isCreatorWinner,} = game;

      gameId = gameId.toNumber();

      existed = !!games[gameId];

      games[gameId] = {
        id: gameId,
        gameName: gameName,
        timeCreated: new XDate(timeCreated.toNumber() * 1000),
        timeStarted: new XDate(timeStarted.toNumber() * 1000),
        amountBet: amountBet.toNumber(),
        creator: creator,
        opponent: opponent,
        state: state.toNumber(),
        isCreatorsTurn: isCreatorsTurn,
        isCreatorWinner: isCreatorWinner
      };

      return {games}
    });

    return existed;
  }

  instantiateContract() {
    const contract = require('truffle-contract');
    const connectFour = contract(ConnectFour);
    connectFour.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on ConnectFour.
    let connectFourInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      connectFour.deployed().then(async (instance) => {
        connectFourInstance = instance;

        this.setState({account: accounts[0], connectFourInstance});
        await this.fetchGames();
        this.fetchFunnyName();
        this.fetchIsOwner();

        this.listenForNewGame();
        this.listenForGameStarted();

      })
    })
  }

  async fetchGames() {
    let {connectFourInstance} = this.state;
    let n = await connectFourInstance.getNumberOfGames();
    this.setState({numberOfGames: n});
    console.log("Number of games:", n.toNumber());
    for(let i = 0; i < n; i++){
      this.saveGameArray(i, await connectFourInstance.getGameData(i));
    }
  }

  async fetchFunnyName() {
    let {connectFourInstance} = this.state;
    let funnyName = await connectFourInstance.generateRandomName();
    this.setState({funnyName});
  }

  async fetchIsOwner() {
    let {connectFourInstance} = this.state;
    let isOwner = await connectFourInstance.isOwner();
    this.setState({isOwner});
  }

  batchCreateGames = () => {
    let {connectFourInstance, account, numberOfGames} = this.state;
    numberOfGames = numberOfGames || 0;
    connectFourInstance.createWaitingGame("Test game " + (numberOfGames*1 + 1), 6, {from: account});
    this.openLoading();
  };

  listenForNewGame = () => {
    let {connectFourInstance, account} = this.state;

    let createGameEvent = connectFourInstance.GameCreated();
    console.debug("Watching for new games...");
    createGameEvent.watch((error, result) => {
      this.stopLoading();

      if (error) {
        swal("Error", "", "error");
        console.log(error)
      }
      else {
        let existed = this.saveGameObject(result.args);

        if (!existed) {
          if (result.args.creator === account) {
            if (result.args.opponent === account) {
              swal("You just created an empty game!", "An opponent will probably join you soon ;)", "success");
            }
            else {
              swal("You just started a game with a friend!", "", "success");
            }
          }
        }

      }
    });

  };

  listenForGameStarted = () => {
    let {connectFourInstance} = this.state;

    let gameStartedEvent = connectFourInstance.GameStarted();
    console.debug("Watching for started games...");
    gameStartedEvent.watch((error, result) => {
      this.stopLoading();

      if (error) {
        swal("Error", "", "error");
        console.log(error)
      }
      else {
        let gameId = result.args.gameId.toNumber();

        console.log("A game just started (id: " + gameId + ")");
        if(this.state.games[gameId].state === 2) {
          this.setState((prevState) => {
            let games = prevState.games.slice();
            games[gameId].state = 1;
            games[gameId].timeStarted = new XDate();
            return {games}
          })
        }
      }
    });

  };

  render() {
    const {inGame, loading, account, isOwner, funnyName, games, connectFourInstance} = this.state;

    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Connect Four</a>
          <div className="navbar-right pure-menu-heading ">
            {"Your address: " + (isOwner && "(owner) " ) +  account}
          </div>
        </nav>

        <div className="container">

          <h1>Connect Four! (aka Four in a row)</h1>

          {inGame ?
            <div>
              <PlayGame/>
            </div>
            :
            <div>
              <CreateGame defaultName={funnyName} account={account} contract={connectFourInstance} openLoading={this.openLoading}/>

              <br/>

              <ListGames account={account} contract={connectFourInstance} openLoading={this.openLoading} games={games} state={2}/>
              <br/>
              <ListGames account={account} contract={connectFourInstance} openLoading={this.openLoading} games={games} state={1}/>
              <br/>
              <ListGames account={account} contract={connectFourInstance} openLoading={this.openLoading} games={games} state={0}/>

              <Button variant="raised" onClick={this.batchCreateGames} style={{background: "#c61d59", color: "#fff", margin: 30}}>
                {"Test Button"}
                <VideoGame/>
              </Button>
            </div>
          }

          <Modal open={loading} onClose={this.stopLoading} little>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <h1>Your transaction is being approved...</h1>
              <img src={loader} alt="Ethereum loading indicator" style={{width:400}}/>
            </div>
          </Modal>
        </div>
      </div>
    );
  }
}

export default App
