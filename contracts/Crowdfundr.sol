pragma solidity ^0.8.4;
/// @author dd0sxx

    /// @dev planned usage:
        // creators can call createProject and set a goal and time limit
            // users can contribute to the contract while the contract is unlocked
            // the contract can be locked after the goal is met by the owner, or by the users if the contract does not meet its goal by the end of the time limit
            // the contract can also be canceled by the owner at any time while it is unlocked
            // after the contract is locked, the bool success will determine if the project met its goal or not
                // users can withdraw their contributions if the project failed
                // creators can withdraw the funds if the project succeeded

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
    uint public constant minimumEther = 0.01 ether;
    bool public locked;
    bool public success;

    constructor(uint _goal, uint _daysToExpiration) {
        require(_daysToExpiration < 90 days, 'cannot take longer than 90 days');
        expirationDate = block.timestamp + _daysToExpiration;
        goal = _goal;
        locked = false;
    }

    /// @notice ensures contract is unlocked
    modifier isUnlocked {
        require(!locked, 'the project is currently locked');
        _;
    }
    /// @notice ensures contract is locked
    modifier isLocked {
        require(locked, 'the project is currently unlocked');
        _;
    }
    /// @notice emits event when the contract is canceled
    event canceled (bool canceled, address owner);

    /// @notice for creators to lock their project in order to withdraw funds
    function lockOwner () public onlyOwner isUnlocked {
        require(totalFunds >= goal, 'goal has not been reached yet');
        locked = true;
        success = true;
    }

    /// @notice for creators to cancel the project
    function cancel () public onlyOwner isUnlocked {
        require(block.timestamp < expirationDate);
        success = false;
        locked = true;
        emit canceled(true, msg.sender);
    }

    /// @notice for users to lock if the goal has not been met after 30 days
    function lockContributor () public isUnlocked {
        require(block.timestamp > expirationDate, 'project has not yet expired');
        require(totalFunds < goal, 'goal has not been met');
        require(balances[msg.sender] >= minimumEther, 'you have not contributed');
        locked = true;
        success = false;
    }



    /// @notice  for contributors to withdraw their funds if the goal has not been met
    function withdrawContributor () public isLocked {
        require(!success, 'crowdfundr was successful');
        uint amount = balances[msg.sender];
        require(amount >= minimumEther);
        totalFunds = totalFunds.sub(amount);
        balances[msg.sender] = 0;
        (bool success, bytes memory data) = msg.sender.call{value: amount}("");
        require(success, 'withdraw: Transfer Failed');
    }

    /// @notice  for creators to withdraw funds after the goal has been met
    /// @param amount the amount of ether to withdraw from totalFunds
    function withdrawOwner (uint amount) public onlyOwner isLocked {
        require(success, 'crowdfundr was unsuccessful');
        require (amount <= totalFunds);
        totalFunds = totalFunds.sub(amount);
        (bool success, bytes memory data) = msg.sender.call{value: amount}("");
        require(success, 'withdraw: Transfer Failed');
    }

    /// @notice users can contribute to the Project
    fallback () external payable {
        require(msg.data.length == 0);
        require(msg.value >= minimumEther, 'value was less than 0.01 ether');
        require(!locked, 'project is locked');
        require(totalFunds < goal, 'the project has already met its goal');
        totalFunds = totalFunds.add(msg.value);
        balances[msg.sender] = balances[msg.sender].add(msg.value);

    }
}

/// @title Crowdfundr
/// @notice Project factory, stores an array of all projects 
contract Crowdfundr {

    Project[] public projects;

    /**  
    * @notice  creators can register a new project, takes in a name and an array of creators
    * @param _goal the amount of ether intended to raise
    * @param _daysToExpiration the number of days to raise the goal
     */
    function createProject (uint _goal, uint _daysToExpiration) public returns (address project) {
        Project newProject = new Project(_goal, _daysToExpiration);
        newProject.transferOwnership(msg.sender);
        projects.push(newProject);
        return payable(newProject);
    }

    function getProjects () external view returns (Project[] memory) {
        return projects;
    }

}