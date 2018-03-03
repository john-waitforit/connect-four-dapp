const ConnectFour = artifacts.require('../contracts/ConnectFour.sol');

contract('ConnectFour', function ([owner, opponent]) {
  let connectFour;

  beforeEach('setup contract for each test', async () => {
    connectFour = await ConnectFour.new();
  });

  it('has an owner', async () => {
    assert.equal(await connectFour.owner(), owner);
  });

  it('create a game', async () => {
    await connectFour.createGame('Test game 1', 0x627306090abab3a6e1400e9345bc60c78a8bef57, 1);
    let numberOfGames = await connectFour.getNumberOfGames();

    assert.equal(numberOfGames, 1);
  });

  it('drop a chip', async () => {
    await connectFour.createGame('Test game 1', 0x627306090abab3a6e1400e9345bc60c78a8bef57, 1);
    let column = 0;
    await connectFour.dropChip(0, column);
    let game = saveGame(await connectFour.getGameData(0));

    assert.equal(game.board[5][column], 1);
  })

  it('drop two chips', async () => {
    await connectFour.createGame('Test game 1', opponent, 1);
    let column = 0;
    await connectFour.dropChip(0, column, {from: owner});
    await connectFour.dropChip(0, column, {from: opponent});
    let game = saveGame(await connectFour.getGameData(0));

    assert.equal(game.board[5][column], 1);
    assert.equal(game.board[4][column], 2);
  })

});


function saveGame(gameArray) {
  let game = {
    id: 0,
    gameName: gameArray[0],
    timeCreated: new Date(gameArray[1].toNumber() * 1000),
    timeStarted: new Date(gameArray[2].toNumber() * 1000),
    amountBet: gameArray[3].toNumber(),
    creator: gameArray[4],
    opponent: gameArray[5],
    state: gameArray[6].toNumber(),
    isCreatorsTurn: gameArray[7],
    isCreatorWinner: gameArray[8],
    board: saveBoard(gameArray[9]),
  };
  return game;
}

function saveBoard(boardBigNumber) {
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