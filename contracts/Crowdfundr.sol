pragma solidity ^0.8.4;
/// @author dd0sxx

    //planned usage:
        // creators can call createProject

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/// @title Crowdfundr Project
/// @notice Will serve as a class for each Project instance
contract Project {

    using SafeMath for uint;

    mapping(address => uint) public balances;
    address public owner;
    uint public expirationDate;
    uint public totalFunds;
    uint public goal;
    bool public locked;
    bool public cancled;


    /// @notice  for creators to lock their project in order to withdraw funds, or for users to lock if the goal has not been met after 30 days
    function lock (string memory _name) public {

    }

       /// @notice  for creators to withdraw funds after the goal has been met, or for contributors to withdraw their funds if the goal has not been met
    function withdraw (string memory _name) public {

    }

    /// @notice users can contribute to the Project
    fallback () external payable  {
        require(msg.value > 0.01 ether);
        if (balances[msg.sender] > 0) {
            balances[msg.sender] = balances[msg.sender].add(msg.value);
        } else {
            balances[msg.sender] = msg.value;
        }
    }

}

/// @title Crowdfundr

contract Crowdfundr {




    /// @notice  creators can register a new project, takes in a name and an array of creators
    function createProject (string memory _name, address _creator) public {

    }

}