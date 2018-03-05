pragma solidity ^0.4.19;

import "./ownable.sol";


contract ConnectFour is Ownable {

    enum State { Ended, InProgress, WaitingForOpponent }
    uint constant HEIGHT = 6;
    uint constant WIDTH = 7;
    uint contractShare = 10; // percentage kept for the contract when rewarding winner

    struct Game {
        string gameName;
        uint timeCreated;
        uint timeStarted;
        uint amountBet;
        address creator;
        address opponent;
        State state;
        bool isCreatorsTurn;
        bool isCreatorWinner;
        uint[WIDTH][HEIGHT] board;
    }

    Game[] games;
    string[] public funnyNames;

    event GameCreated(uint gameId, string gameName, uint timeCreated, uint timeStarted, uint amountBet, address creator,
        address opponent, State state, bool isCreatorsTurn, bool isCreatorWinner, uint[WIDTH][HEIGHT] board);
    event GameStarted(uint gameId);
    event Move(uint gameId, uint row, uint column, bool isCreatorMove);
    event GameFinished(uint gameId, bool isCreatorWinner);
    event TestValue(uint value1);

    modifier isInProgress(uint gameId) {
        Game storage myGame = games[gameId];
        require(myGame.state == State.InProgress);
        _;
    }

    modifier isHisTurn(uint gameId) {
        Game storage myGame = games[gameId];
        require(myGame.isCreatorsTurn ? msg.sender == myGame.creator : msg.sender == myGame.opponent);
        _;
    }

    function ConnectFour() public {
        funnyNames.push("This is not the game you are looking for");
        funnyNames.push("Connect two + two");
        funnyNames.push("Swiggity Swooty all the doti are connecty");
        funnyNames.push("Connect all the dots !");
    }

    function getNumberOfGames() external view returns (uint) {
        return games.length;
    }

    function getGameData(uint _gameId) external view returns (
        string gameName,
        uint timeCreated,
        uint timeStarted,
        uint amountBet,
        address creator,
        address opponent,
        State state,
        bool isCreatorsTurn,
        bool isCreatorWinner,
        uint[WIDTH][HEIGHT] board)
    {
        Game storage myGame = games[_gameId];
        gameName = myGame.gameName;
        timeCreated = myGame.timeCreated;
        timeStarted = myGame.timeStarted;
        amountBet = myGame.amountBet;
        creator = myGame.creator;
        opponent = myGame.opponent;
        state = myGame.state;
        isCreatorsTurn = myGame.isCreatorsTurn;
        isCreatorWinner = myGame.isCreatorWinner;
        board = myGame.board;
    }

    // Join a game that was waiting for an opponent
    function joinGame(uint _gameId) external {
        Game storage myGame = games[_gameId];
        require(myGame.state == State.WaitingForOpponent);
        require(msg.sender != myGame.creator);

        myGame.opponent = msg.sender;
        myGame.timeStarted = now;
        myGame.state = State.InProgress;
        GameStarted(_gameId);
    }

    function addFunnyName(string _name) external onlyOwner {
        funnyNames.push(_name);
    }

    function createWaitingGame(string _name, uint _bet) external returns (uint){
        uint[WIDTH][HEIGHT] memory board;

        uint id = games.push(Game(_name, now, now, _bet, msg.sender, msg.sender, State.WaitingForOpponent, true, true, board)) - 1;
        GameCreated(id, _name, now, now, _bet, msg.sender, msg.sender, State.WaitingForOpponent, true, true, board);
        return id;
    }

    function createGame(string _name, address _opponent, uint _bet) external returns (uint){
        require(msg.sender != _opponent);
        uint[WIDTH][HEIGHT] memory board;

        uint id = games.push(Game(_name, now, now, _bet, msg.sender, _opponent, State.InProgress, true, true, board)) - 1;
        GameCreated(id, _name, now, now, _bet, msg.sender, _opponent, State.InProgress, true, true, board);
        return id;
    }


    function dropChip(uint gameId, uint column) external isHisTurn(gameId) isInProgress(gameId) {
        TestValue(0);
        Game storage myGame = games[gameId];
        require(column < WIDTH && column >= 0);
        require(myGame.board[0][column] == 0);

        uint row = HEIGHT;
        for (uint i = HEIGHT - 1; i >= 0; i--) {
            if (myGame.board[i][column] == 0) {
                row = i;
                myGame.board[row][column] = myGame.isCreatorsTurn ? 1 : 2;
                break;
            }
        }

        // This should always work since we checked if myGame.board[5][column] == 0
        if (row != HEIGHT) {
            Move(gameId, row, column, myGame.isCreatorsTurn);

            if (isGameFinished(gameId, column, row)) {
                myGame.state = State.Ended;
                myGame.isCreatorWinner = myGame.isCreatorsTurn;
                if (myGame.isCreatorWinner) {
                    myGame.creator.transfer((100 - contractShare) * myGame.amountBet / 100);
                }
                else {
                    myGame.opponent.transfer((100 - contractShare) * myGame.amountBet / 100);
                }
                GameFinished(gameId, myGame.isCreatorsTurn);
            }
            else {
                myGame.isCreatorsTurn = !myGame.isCreatorsTurn;
            }
            TestValue(99999);


        }
    }

    function changeContractShare(uint _contractShare) external onlyOwner {
        require(_contractShare < 100);
        require(_contractShare >= 0);
        contractShare = _contractShare;
    }

    // Look for four chips aligned
    function isGameFinished(uint gameId, uint column, uint row) internal view returns(bool) {
        Game storage myGame = games[gameId];
        uint player = myGame.isCreatorsTurn ? 1 : 2;
        require(myGame.board[row][column] == player);

        // Used signed integers for the index checks otherwise they won't work
        int s_row = int(row);
        int s_column = int(column);
        int s_HEIGHT = int(HEIGHT);
        int s_WIDTH = int(WIDTH);

        // Vertical
        if(s_row + 3 < s_HEIGHT
        && myGame.board[row+1][column] == player
        && myGame.board[row+2][column] == player
        && myGame.board[row+3][column] == player)
            return true;

        // Vertical
        if(s_row + 2 < s_HEIGHT && s_row - 1 >= 0
        && myGame.board[row+1][column] == player
        && myGame.board[row+2][column] == player
        && myGame.board[row-1][column] == player)
            return true;

        // Vertical
        if(s_row + 1 < s_HEIGHT && s_row - 2 >= 0
        && myGame.board[row+1][column] == player
        && myGame.board[row-1][column] == player
        && myGame.board[row-2][column] == player)
            return true;

        // Vertical
        if(s_row < s_HEIGHT && s_row - 3 >= 0
        && myGame.board[row-1][column] == player
        && myGame.board[row-2][column] == player
        && myGame.board[row-3][column] == player)
            return true;

        // Horizontal
        if (s_column + 3 < s_WIDTH
        && myGame.board[row][column+1] == player
        && myGame.board[row][column+2] == player
        && myGame.board[row][column+3] == player)
            return true;

        // Horizontal
        if (s_column + 2 < s_WIDTH && s_column - 1 >= 0
        && myGame.board[row][column-1] == player
        && myGame.board[row][column+1] == player
        && myGame.board[row][column+2] == player)
            return true;

        // Horizontal
        if ((s_column + 1 < s_WIDTH) && ((s_column - 2) >= 0)
        && (myGame.board[row][column-2] == player)
        && (myGame.board[row][column-1] == player)
            && (myGame.board[row][column+1] == player)){
            return true;

        }

        // Horizontal
        if(s_column - 3 >= 0
        && myGame.board[row][column-3] == player
        && myGame.board[row][column-2] == player
        && myGame.board[row][column-1] == player)
            return true;

        // Diagonal down / right
        if(s_column + 3 < s_WIDTH && s_row + 3 < s_HEIGHT
        && myGame.board[row+1][column+1] == player
        && myGame.board[row+2][column+2] == player
        && myGame.board[row+3][column+3] == player)
            return true;

        // Diagonal down / right
        if(s_column + 2 < s_WIDTH && s_row + 2 < s_HEIGHT && column - 1 >= 0 && s_row - 1 >= 0
        && myGame.board[row-1][column-1] == player
        && myGame.board[row+1][column+1] == player
        && myGame.board[row+2][column+2] == player)
            return true;

        // Diagonal down / right
        if(s_column + 1 < s_WIDTH && s_row + 1 < s_HEIGHT && s_column - 2 >= 0 && s_row - 2 >= 0
        && myGame.board[row-2][column-2] == player
        && myGame.board[row-1][column-1] == player
        && myGame.board[row+1][column+1] == player)
            return true;

        // Diagonal down / right
        if(s_column < s_WIDTH && s_row < s_HEIGHT && s_column - 3 >= 0 && s_row - 3 >= 0
        && myGame.board[row-1][column-1] == player
        && myGame.board[row-2][column-2] == player
        && myGame.board[row-3][column-3] == player)
            return true;


        // Diagonal down / left
        if(s_column - 3 >= 0 && s_row + 3 < s_HEIGHT
        && myGame.board[row+1][column-1] == player
        && myGame.board[row+2][column-2] == player
        && myGame.board[row+3][column-3] == player)
            return true;

        // Diagonal down / left
        if(s_column + 1 < s_WIDTH && s_row + 2 < s_HEIGHT && s_column - 2 >= 0 && s_row - 1 >= 0
        && myGame.board[row-1][column+1] == player
        && myGame.board[row+1][column-1] == player
        && myGame.board[row+2][column-2] == player)
            return true;

        // Diagonal down / left
        if(s_column + 2 < s_WIDTH && s_row + 1 < s_HEIGHT && s_column - 1 >= 0 && s_row - 2 >= 0
        && myGame.board[row-2][column+2] == player
        && myGame.board[row-1][column+1] == player
        && myGame.board[row+1][column-1] == player)
            return true;

        // Diagonal down / left
        if(s_column + 3 < s_WIDTH && s_row < s_HEIGHT && s_column >= 0 && s_row - 3 >= 0
        && myGame.board[row-1][column+1] == player
        && myGame.board[row-2][column+2] == player
        && myGame.board[row-3][column+3] == player)
            return true;

        return false;
    }

    function generateRandomName() external view returns (string) {
        uint randIndex = now % funnyNames.length;
        string memory gameNumber = strConcat("#", uintToString(games.length));
        string memory gameFunny = strConcat(" - ", funnyNames[randIndex]);

        return strConcat(gameNumber, gameFunny);
    }

    function isOwner() external view returns (bool) {
        return msg.sender == owner;
    }

    function strConcat(string _a, string _b) internal pure returns (string) {
        bytes memory _bytesA = bytes(_a);
        bytes memory _bytesB = bytes(_b);
        string memory ab = new string(_bytesA.length + _bytesB.length);
        bytes memory bytesAB = bytes(ab);
        uint k = 0;
        for (uint i = 0; i < _bytesA.length; i++) bytesAB[k++] = _bytesA[i];
        for (uint j = 0; j < _bytesB.length; j++) bytesAB[k++] = _bytesB[j];
        return string(bytesAB);
    }

    function uintToString(uint v) internal pure returns (string str) {
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = byte(48 + remainder);
        }
        bytes memory s = new bytes(i);
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - 1 - j];
        }
        str = string(s);
    }

}