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

    let { hover } = this.props;

    let cellColor = (hover ? light_blue : blue);

    return (
      <div onMouseOver={this.props.onHover} style={{width: SIZE, height: SIZE, background: cellColor, border: '0px solid #595959', padding: SIZE/8, cursor: 'pointer'}}>
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

  render() {
    let {columnHover } = this.state;

    let board = [
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0],
      [0,0,0,0,0,1,0],
      [0,0,0,0,1,2,0],
      [0,0,2,1,2,1,0],
      [0,0,1,2,2,1,2],
    ];

    let rows = [];
    for(let row = 0; row < 6; row++){
      let newRow = [];
      for(let cell = 0; cell < 7; cell++) {
        newRow.push(<Cell key={row*7+cell} hover={columnHover === cell} column={cell} value={board[row][cell]} onHover={() => this.hover(cell)}/>)
      }
      rows.push(<div key={row} style={{display: 'flex'}}>{newRow}</div>)
    }

    let turnColor = red;

    return (
      <Paper style={{padding: 20}}>

        <div style={{padding:20, backgroundColor: "#13a9c6"}}>
          {rows}
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', margin: 15}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: SIZE, height: SIZE, borderRadius: SIZE/2, background: red, marginRight: 15}}/>
            You
          </div>

          <div style={{background: turnColor, padding: "5px 30px 5px 30px", borderRadius: 20, display: 'flex', justifyContent: "center", alignItems: 'center'}}>Go!</div>

          <div style={{display: 'flex', alignItems:'center'}}>
            Him
            <div style={{width: SIZE, height: SIZE, borderRadius: SIZE/2, background: yellow, marginLeft: 15}}/>
          </div>

        </div>


      </Paper>
    );
  }

}

export default PlayGame;