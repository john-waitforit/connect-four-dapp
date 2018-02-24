import React, { Component } from 'react';
import ConnectFour from '../build/contracts/ConnectFour.json';
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
      web3: null
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

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract');
    const connectFour = contract(ConnectFour);
      connectFour.setProvider(this.state.web3.currentProvider);

    // Declaring this for later so we can chain functions on SimpleStorage.
    let connectFourInstance;

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
        connectFour.deployed().then((instance) => {
            connectFourInstance = instance;

        // Stores a given value, 5 by default.
        //return connectFourInstance.createWaitingGame("Test game 02", 3, {from: accounts[0]});
      }).then((result) => {
        // Get the value from the contract to prove it worked.
        return connectFourInstance.getGameData(1);
      }).then((result) => {
        // Update state with the result.
        return this.setState({ game: JSON.stringify(result)});
      })
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your stupid github page is not working.</p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a game json.</p>
              <p>The stored value is: {this.state.game}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
