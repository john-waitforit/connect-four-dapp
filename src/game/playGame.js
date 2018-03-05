import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

const SIZE = 50;
const red = "rgb(220,100,74)";
const yellow = "rgb(240,202,48)";
const blue = "#13a9c6";
const light_blue = "#80b6c6";

class Cell extends Component {

  render() {
    let color = "white";
    if(this.props.value === 1)
      color = red;
    else if(this.props.value === 2)
      color = yellow;

    let { hover, onClick, onHover, isMyTurn } = this.props;

    let cellColor = (hover ? light_blue : blue);

    return (
      <div onClick={onClick} onMouseOver={onHover} style={{width: SIZE, height: SIZE, background: cellColor, border: '0px solid #595959', padding: SIZE/8, cursor: isMyTurn ? 'pointer' : ''}}>
        <div style={{width: SIZE, height: SIZE, borderRadius: SIZE/2, background: color}}/>
      </div>
    )
  }
}

class PlayGame extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnHover: null,
    }
  }

  hover = (column) => {
    this.setState({columnHover: column});
  };

  dropChip = (column) => {
    let { contract, game, account } = this.props;
    contract.dropChip(game.id, column, {from: account});
    this.props.openLoading();
  };


  render() {
    let {columnHover } = this.state;
    let {game, account} = this.props;

    let board = game.board;
    let isCreator = game.creator == account;

    let isMyTurn = (isCreator && game.isCreatorsTurn) || (!isCreator && !game.isCreatorsTurn);

    let myColor = isCreator ? red : yellow;
    let hisColor = isCreator ? yellow : red;
    let turnColor = isMyTurn ? myColor : hisColor;

    let rows = [];
    for(let row = 0; row < 6; row++){
      let newRow = [];
      for(let cell = 0; cell < 7; cell++) {
        newRow.push(<Cell key={row*7+cell}
                          hover={columnHover === cell}
                          isMyTurn={isMyTurn}
                          column={cell}
                          value={board[row][cell]}
                          onHover={() => isMyTurn && this.hover(cell)}
                          onClick={() => isMyTurn && this.dropChip(cell)}
        />)
      }
      rows.push(<div key={row} style={{display: 'flex', justifyContent: 'center'}}>{newRow}</div>)
    }

    return (
      <Paper style={{padding: '5px 20px 20px 20px'}}>

        <div style={{marginBottom:10}}>
          <h1>{game.gameName}</h1>
          <h2 style={{textAlign: 'center', marginBottom: 10, fontWeight: 'bold'}}>
            {"Playing against:"}
          </h2>
          <div style={{textAlign: 'center'}}>
            {(isCreator ? game.opponent : game.creator)}
          </div>
        </div>

        <div style={{padding:20, backgroundColor: "#13a9c6"}}>
          {rows}
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', margin: 15}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: SIZE, height: SIZE, borderRadius: SIZE/2, background: myColor, marginRight: 15}}/>
            You
          </div>

          <div style={{background: turnColor, padding: "5px 30px 5px 30px", borderRadius: 20, display: 'flex', justifyContent: "center", alignItems: 'center'}}>
            Go!
          </div>

          <div style={{display: 'flex', alignItems:'center'}}>
            Him
            <div style={{width: SIZE, height: SIZE, borderRadius: SIZE/2, background: hisColor, marginLeft: 15}}/>
          </div>

        </div>


      </Paper>
    );
  }

}

export default PlayGame;