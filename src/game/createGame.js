import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import VideoGame from 'material-ui-icons/VideogameAsset';
import swal from 'sweetalert';

import Button from 'material-ui/Button';

import Paper from 'material-ui/Paper';
import TextField from "material-ui/TextField";

const styles = theme => ({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    minHeight: 100,
    paddingLeft: 20,
    paddingRight: 20,
  },
  formControl: {
    margin: theme.spacing.unit,
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  button: {
    background: '#13a9c6',
    color: '#fff'
  }
});


class CreateGame extends Component {
  constructor(props){
    super(props);
    this.state = {
      gameName: '',
      amountBet: 0,
      opponent: "",
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.defaultName !== this.props.defaultName){
      this.setState({gameName: nextProps.defaultName});
    }
  }

  handleChange = (field) => (event) => {
    this.setState({[field]: event.target.value});
  };

  createGame = () => {
    let {gameName, amountBet, opponent} = this.state;

    if(opponent) {
      this.props.contract.createGame(gameName, opponent, amountBet, {from: this.props.account});
    }
    else {
      this.props.contract.createWaitingGame(gameName, amountBet, {from: this.props.account});
    }

    this.props.openLoading();
  };

  render() {

    const { classes } = this.props;
    const { gameName, amountBet, opponent } = this.state;

    const addressError = opponent.length !== 0 && opponent.length !== 42;

    return (
      <Paper style={{padding: 10, maxWidth: 1600, width: '70%', minWidth: 1000}}>
        <div style={{paddingLeft: 10}}>
          <h2>Create a game!</h2>
        </div>

        <form className={classes.container} noValidate autoComplete="off">
          <TextField
            label="Game Name"
            required
            value={gameName}
            onChange={this.handleChange("gameName")}
            className={classes.textField}
            style={{flex: 2, minWidth: 300}}
            margin="normal"
          />
          <TextField
            label="Amount bet (eth)"
            required
            type="Number"
            value={amountBet}
            onChange={this.handleChange("amountBet")}
            className={classes.textField}
            style={{width: 140}}
            margin="normal"
          />
          <TextField
            label="Opponent address (optionnal)"
            value={opponent}
            error={addressError}
            helperText={addressError ? "Invalid address" : ""}
            onChange={this.handleChange("opponent")}
            className={classes.textField}
            style={{flex: 2, minWidth: 300}}
            margin="normal"
          />
        </form>

        <div style={{display: "flex", justifyContent: 'center', height: 80, alignItems: 'center'}}>
          <div style={{flex: 1}}/>
          <Button
            className={classes.button}
            variant="raised"
            disabled={addressError}
            onClick={this.createGame}
          >
            {opponent.length === 0 ? "Find opponent" : "Play with friend"}
            <VideoGame className={classes.rightIcon}>u</VideoGame>
          </Button>
          <div style={{flex: 1, padding: 20, color: '#525252', fontSize: 12}}>{opponent.length === 0 && "Enter an opponent address if you want to play with a friend!"}</div>
        </div>

      </Paper>
    )
  }
}

CreateGame.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CreateGame);
