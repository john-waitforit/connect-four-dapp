pragma solidity ^0.4.19;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/connectFour.sol";

contract TestConnectFour {
    ConnectFour connectFour = ConnectFour(DeployedAddresses.ConnectFour());

    function testCreateFirstGame() public {
        uint gameId = connectFour.createGame("test", 0xf17f52151EbEF6C7334FAD080c5704D77216b732, 2);
        uint size = connectFour.getNumberOfGames();

        uint expectedId = 0;
        uint expectedSize = 1;

        Assert.equal(gameId, expectedId, "Creation of first game should be effective");
        Assert.equal(size, expectedSize, "There should be exactly one game created");
    }


    function testCreatorOfGame() public {
        address expected = this;

        address creator;
        (,,,, creator,,,,,) = connectFour.getGameData(0);

        Assert.equal(creator, expected, "Creator of first game should be recorded");
    }

}