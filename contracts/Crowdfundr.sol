pragma solidity ^0.8.4;

contract Crowdfundr {

// mapping to store projects to an array of owners (storing project names as hashs hence bytes data type)
mapping(bytes => address[]) public projectsToCreators;
// mapping projects to their state (locked or unlocked)
mapping(bytes => bool) public projectStatus;



// a function to register a new project, takes in a name and an array of creators
function createProject (string memory _name, address[] memory _creators) public {

}

// a function to contribute to an existing project
function contribute (string memory _name) public {

}


}