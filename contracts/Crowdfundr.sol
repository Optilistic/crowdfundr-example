pragma solidity ^0.8.4;
/// @author dd0sxx

    //planned usage:
        // creators can call createProject

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Project
/// @notice Will serve as a class for each Project instance
contract Project is Ownable {

    using SafeMath for uint;

    mapping(address => uint) public balances;
    uint public expirationDate;
    uint public totalFunds;
    uint public goal;
    bool public locked;
    bool public success;

    constructor(uint _daysToExpiration) {
        expirationDate = block.timestamp + _daysToExpiration;
    }

    modifier isUnlocked {
        require(!locked, 'the project is currently locked');
        _;
    }
    modifier isLocked {
        require(locked, 'the project is currently unlocked');
        _;
    }

    event cancled (bool cancled, address owner);

    /// @notice for creators to lock their project in order to withdraw funds
    function lockOwner (string memory _name) public onlyOwner isUnlocked {
        require(totalFunds >= goal);
        locked = true;
        success = true;
    }

    /// @notice for creators to cancle the project
    function cancle (string memory _name) public onlyOwner isUnlocked {
        require(block.timestamp < expirationDate);
        success = false;
        locked = true;
        emit cancled(true, msg.sender);
    }

    /// @notice for users to lock if the goal has not been met after 30 days
    function lockContributor (string memory _name) public isUnlocked {
        require(block.timestamp > expirationDate);
        require(totalFunds < goal);
        locked = true;
        success = false;
    }



    /// @notice  for contributors to withdraw their funds if the goal has not been met
    function withdrawContributor (string memory _name) public isLocked {
        require(!success, 'crowdfundr was successful');
        uint amount = balances[msg.sender];
        require(amount >= 0.01 ether);
        totalFunds.sub(amount);
        balances[msg.sender] = 0;
        (bool success, bytes memory data) = msg.sender.call{value: amount}("");
        require(success, 'withdraw: Transfer Failed');
    }

    /// @notice  for creators to withdraw funds after the goal has been met
    function withdrawOwner (uint amount) public onlyOwner isLocked {
        require(success, 'crowdfundr was unsuccessful');
        require (amount <= totalFunds);
        totalFunds.sub(amount);
        (bool success, bytes memory data) = msg.sender.call{value: amount}("");
        require(success, 'withdraw: Transfer Failed');
    }

    /// @notice users can contribute to the Project
    fallback () external payable {
        require(msg.value >= 0.01 ether, 'value was less than 0.01 ether');
        require(!locked, 'project is locked');
        require(totalFunds < goal, 'the project has already met its goal');
        totalFunds = totalFunds.add(msg.value);
        balances[msg.sender] = balances[msg.sender].add(msg.value);

    }
}

/// @title Crowdfundr

contract Crowdfundr {




    /// @notice  creators can register a new project, takes in a name and an array of creators
    function createProject (string memory _name, address _creator) public {

    }

}