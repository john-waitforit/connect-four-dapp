import React, { Component } from 'react';

import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';

class JoinGame extends Component {
  render() {

    return (
      <Paper style={{maxWidth: 1200, flex: 1, padding: 20}}>

        <h2>{"There are " + this.props.games.length + " opponents waiting to play!"}</h2>

        <Table >
          <TableHead>
            <TableRow>
              <TableCell numeric>Id</TableCell>
              <TableCell>Game name</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Amount bet</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.props.games.map(game => {
              return (
                <TableRow key={game.id}>
                  <TableCell numeric>{game.id}</TableCell>
                  <TableCell>{game.gameName}</TableCell>
                  <TableCell>{game.timeCreated.toString("h(:mm)TT - MMM d, yyyy")}</TableCell>
                  <TableCell>{game.amountBet + " eth"}</TableCell>
                  <TableCell>{game.state}</TableCell>
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