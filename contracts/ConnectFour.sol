pragma solidity ^0.4.19;

import "./ownable.sol";


contract ConnectFour is Ownable {

    enum State { Ended, InProgress, WaitingForOpponent }

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
        uint[6][7] board;
    }

    Game[] games;
    string[] public funnyNames;

    event GameCreated(uint gameId, string gameName, uint timeCreated, uint timeStarted, uint amountBet, address creator,
        address opponent, State state, bool isCreatorsTurn, bool isCreatorWinner);
    event GameStarted(uint gameId);
    event Move(uint gameId, uint column, bool isCreator);
    event GameFinished(uint gameId, bool isCreator);

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
        uint[6][7] board)
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
        uint[6][7] memory board;
        uint id = games.push(Game(_name, now, now, _bet, msg.sender, msg.sender, State.WaitingForOpponent, true, true, board)) - 1;
        GameCreated(id, _name, now, now, _bet, msg.sender, msg.sender, State.WaitingForOpponent, true, true);
        return id;
    }

    function createGame(string _name, address _opponent, uint _bet) external returns (uint){
        require(msg.sender != _opponent);
        uint[6][7] memory board;
        uint id = games.push(Game(_name, now, now, _bet, msg.sender, _opponent, State.InProgress, true, true, board)) - 1;
        GameCreated(id, _name, now, now, _bet, msg.sender, _opponent, State.InProgress, true, true);
        GameStarted(id);
        return id;
    }

    function dropChip(uint gameId, uint column) external isHisTurn(gameId) isInProgress(gameId) {
        Game storage myGame = games[gameId];
        require(column < 7 && column >= 0);

        // Check if the player can play in this column
        uint row = 6;
        for(uint i = 0; i < 6; i++) {
            if(myGame.board[i][column] == 0) {
                row = i;
                myGame.board[row][column] = myGame.isCreatorsTurn ? 1 : 2;
                break;
            }
        }


        if(row != 6) {
            Move(gameId, column, myGame.isCreatorsTurn);

            if(isGameFinished(gameId, column, row)){
                myGame.state = State.Ended;
                myGame.isCreatorWinner = myGame.isCreatorsTurn;
                GameFinished(gameId, myGame.isCreatorsTurn);
            }
            else {
                myGame.isCreatorsTurn = !myGame.isCreatorsTurn;
            }

        }

    }

    // Look for four chips aligned
    function isGameFinished(uint gameId, uint column, uint row) internal returns(bool) {
        Game storage myGame = games[gameId];
        uint player = myGame.isCreatorsTurn ? 1 : 2;
        
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