import React, { Component } from 'react';
import ConnectFour from '../build/contracts/ConnectFour.json';
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
      showInProgressGames: false,
      myGames: [],
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
    let game = {
      id: id,
      gameName: gameArray[0],
      timeCreated: new XDate(gameArray[1].toNumber() * 1000),
      timeStarted: new XDate(gameArray[2].toNumber() * 1000),
      amountBet: gameArray[3].toNumber(),
      creator: gameArray[4],
      opponent: gameArray[5],
      state: gameArray[6].toNumber(),
      isCreatorsTurn: gameArray[7],
      isCreatorWinner: gameArray[8],
      board: this.saveBoard(gameArray[9]),
    };

    this.setState((prevState) => {
      let games = prevState.games.slice();
      games[id] = game;
      return {games}
    });

    return game;

  }

  saveGameObject(game) {
    let existed = false;
    this.setState((prevState) => {
      let games = prevState.games.slice();
      let {gameId, gameName, timeCreated, timeStarted, amountBet, creator, opponent, state, isCreatorsTurn, isCreatorWinner, board} = game;

      gameId = gameId.toNumber();

      existed = !!games[gameId];

      games[gameId] = {
        id: gameId,
        gameName,
        timeCreated: new XDate(timeCreated.toNumber() * 1000),
        timeStarted: new XDate(timeStarted.toNumber() * 1000),
        amountBet: amountBet.toNumber(),
        creator,
        opponent,
        state: state.toNumber(),
        isCreatorsTurn,
        isCreatorWinner,
        board: this.saveBoard(board),
      };

      return {games}
    });

    return existed;
  }

  saveBoard(boardBigNumber) {
    let board = [];
    for(let row = 0; row < 6; row++) {
      let chips = [];
      for(let column = 0; column < 6; column++) {
        chips.push(boardBigNumber[row][column].toNumber())
      }
      board.push(chips);
    }
    return board;
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
        this.listenForMove();
        this.listenForEndGame();

      })
    })
  }

  async fetchGames() {
    let {connectFourInstance, account, web3} = this.state;
    let n = await connectFourInstance.getNumberOfGames();
    this.setState({numberOfGames: n.toNumber()});
    console.log("Number of games:", n.toNumber());
    for(let i = 0; i < n; i++){
      let gameArray = await connectFourInstance.getGameData(i);
      let game = this.saveGameArray(i, gameArray);

      if((game.creator == account || game.opponent == account) && game.state === 1){
        this.setState((prevState) => {
          let myGames = prevState.myGames.slice();
          myGames.push(game.id);
          return {myGames}
        })
      }
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
    let {connectFourInstance, account, web3} = this.state;

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
          if (result.args.creator == account) {
            if(result.args.creator == result.args.opponent){
              swal("You just created an empty game!", "An opponent will probably join you soon ;)", "success");
            }
            else {
              swal("You just started a game with a friend!", "As soon as he has paid the game will start!", "success");
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

        if(this.state.games[gameId].state === 1 || this.state.games[gameId].state === 2) {
          console.log("A game just started (id: " + gameId + ")");
          this.setState((prevState) => {
            let games = prevState.games.slice();
            games[gameId].state = 1;
            games[gameId].timeStarted = new XDate();
            let myGames = prevState.myGames.slice();
            let index = myGames.indexOf(gameId);
            if(index === -1) {
              myGames.push(gameId);
            }
            return {games, myGames}
          })
        }
      }
    });

  };

  listenForMove = () => {
    let {connectFourInstance} = this.state;
    let moveEvent = connectFourInstance.Move();
    console.debug("Watching for moves...");
    moveEvent.watch((error, result) => {
      this.stopLoading();
      let {column, row, gameId, isCreatorMove} = result.args;
      gameId = gameId.toNumber();
      column = column.toNumber();
      row = row.toNumber();

      if(isCreatorMove === this.state.games[gameId].isCreatorsTurn) {
        console.log("Detected a move, gameId: " + gameId + ", (" + row + ', ' + column + ')');
        this.setState((prevState) => {
          let games = prevState.games.slice();
          games[gameId].board[row][column] = isCreatorMove ? 1 : 2;
          games[gameId].isCreatorsTurn = !isCreatorMove;
          return {games}
        })
      }

    });

  };

  listenForEndGame = () => {
    let {connectFourInstance, games, account} = this.state;
    let endEvent = connectFourInstance.GameFinished();
    console.debug("Watching for finished games...");
    endEvent.watch((error, result) => {
      this.stopLoading();
      let {isCreatorWinner, gameId} = result.args;
      let game = games[gameId];
      if(game.state === 1) {
        let isWinner = isCreatorWinner === (game.creator == account);
        swal("Game finished", isWinner ? "You won!" : "You lost!");
        this.setState((prevState) => {
          let games = prevState.games.slice();
          games[gameId].state = 0;
          games[gameId].isCreatorWinner = isCreatorWinner;

          let myGames = prevState.myGames.slice();
          let indexToRemove = myGames.indexOf(gameId);
          if(indexToRemove > -1) {
            myGames.splice(indexToRemove, 1);
          }

          return {games};
        });
      }
    });
  };

  render() {
    const {showInProgressGames, loading, account, isOwner, funnyName, games, connectFourInstance, myGames, web3} = this.state;

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

          {myGames.length !== 0 &&

          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Button variant="raised" onClick={() => this.setState((prevState) => {return {showInProgressGames: !prevState.showInProgressGames}})} style={{background: "#c61d59", color: "#fff", margin: 30}}>
              {showInProgressGames ? "Back to list" : "See my in progress games"}
              <VideoGame style={{marginLeft: 5}}/>
            </Button>
          </div>
          }

          {showInProgressGames ?
            <div>
              {myGames.length === 0 ?
                <h2>No games for the moment</h2>
                :
                <div>
                  {myGames.map((gameId) =>
                    <PlayGame key={gameId} contract={connectFourInstance} account={account} openLoading={this.openLoading} game={games[gameId]}/>)}
                </div>
              }
            </div>
            :
            <div>
              <CreateGame defaultName={funnyName} account={account} contract={connectFourInstance} openLoading={this.openLoading} web3={web3}/>

              <br/>

              <ListGames account={account} contract={connectFourInstance} openLoading={this.openLoading} games={games} state={2} web3={web3}/>
              <br/>
              <ListGames account={account} contract={connectFourInstance} openLoading={this.openLoading} games={games} state={1} web3={web3}/>
              <br/>
              <ListGames account={account} contract={connectFourInstance} openLoading={this.openLoading} games={games} state={0} web3={web3}/>

              {/*<Button variant="raised" onClick={this.batchCreateGames} style={{background: "#c61d59", color: "#fff", margin: 30}}>
                {"Test Button"}
                <VideoGame style={{marginLeft: 5}}/>
              </Button>*/}
            </div>
          }



          <Modal open={loading} onClose={this.stopLoading} little>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
              <h1>Your transaction is being approved...</h1>
              <img src={loader} alt="Ethereum loading indicator" style={{width:400}}/>
            </div>
          </Modal>
        </div>

        <div style={{textAlign: 'center', backgroundColor: 'black', height: 100, width: '100%', display: 'flex', justifyContent: 'center', flexDirection: 'column'}}>
          <p style={{color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            Designed by Jonathan Wagner. All Rights reserved © 2018.
          </p>
          <div>
            <a href="https://github.com/johnjohnwagner/connect-four-dapp" style={{color: '#9ae7e4', textAlign: 'center'}}>Github project</a>
          </div>
        </div>

      </div>
    );
  }
}

export default App
