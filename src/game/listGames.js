import React, { Component } from 'react';

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import {State} from "../App";
import {Button} from "material-ui";

class JoinGame extends Component {

  joinGame = (gameId) => {
    this.props.contract.joinGame(gameId, {from: this.props.account});
    this.props.openLoading();
  };

  render() {

    let {games, state} = this.props;

    games = games.filter((game) => game.state === state).sort((a, b) => a.timeStarted < b.timeStarted);

    let title = "";
    switch(state){
      case 2:
        title = "There " + (games.length > 1 ? "are " : "is ") + games.length + " opponent(s) waiting to play!";
        break;
      case 1:
        title = "There " + (games.length > 1 ? "are " : "is ") + games.length + " game(s) in progress!";
        break;
      case 0:
        title = "Finished games: " + games.length ;
        break;
      default:
        title = "Error: unknown state"
    }

    return (
      <Paper style={{maxWidth: 1600, flex: 1, padding: 10, width: '70%', minWidth: 1000}}>

        <div style={{paddingLeft: 10}}>
          <h2>{title}</h2>
        </div>

        <Table >
          <TableHead>
            <TableRow>
              <TableCell numeric>Id</TableCell>
              <TableCell>Game name</TableCell>
              <TableCell>{state === 2 ? "Date Created ↑" : "Date started ↑"}</TableCell>
              <TableCell>Amount bet</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {games.map(game => {
              return (
                <TableRow key={game.id}>
                  <TableCell numeric>{game.id}</TableCell>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>{(state === 2 ? game.timeCreated : game.timeStarted).toString("h(:mm)TT - MMM d, yyyy")}</TableCell>
                  <TableCell>{game.amountBet + " eth"}</TableCell>
                  <TableCell>{game.state === 2 ?
                    <Button variant="raised" onClick={() => this.joinGame(game.id)} style={{background: "#1e9b26", color: "#fff"}}>
                      {"Play"}
                    </Button>
                    : State[game.state]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

export default JoinGame;