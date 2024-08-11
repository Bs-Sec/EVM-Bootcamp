// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;


contract HWMod {

    mapping(address => bool) private allowedUsage;
    string public ownerText = "Empty";
    string public anonText = "Empty";
    address public currentOwner;

    constructor() {
        allowedUsage[msg.sender] = true;
        currentOwner = msg.sender;
        allowedUsage[0xE2359274Defb4e45425DBB6DF363354Ea7C74753] = true;
        allowedUsage[0xD30a79E487351Eb0064c8a78eb341DA364d78a9a] = true;
        allowedUsage[0xf9e0f3b2DF52fc0a71F098A90686De51FaCA40B4] = true;
        allowedUsage[0xF4dE885058983230aa4308E9a10E7421cD05d9d5] = true;
        allowedUsage[0x8071527946235eF9Ca115bd409C8487496BEbF9B] = true;
        allowedUsage[0x8152ae0BE775eE8C530b5b13f229D75ADc9291b0] = true;
        allowedUsage[0xFAa96971DF0D33315F10e35fB1c1aE3b2ff0e6F0] = true;
        allowedUsage[0x9a010C5c4F23E0fE184C0FA0B1CB2E190e490d74] = false;
    }

    modifier usageCheck() {
        require(allowedUsage[msg.sender] == true, "Your wallet address is not allowed to interact with this function.");
        _;
    }

    function _checkCurrentOwner(address _currentSender) internal view returns (bool) {
        if(currentOwner == _currentSender) {
            return true;
        }
        else {
            return false;
        }
    }

    function transferOwnership() public usageCheck returns (string memory) {
        if(_checkCurrentOwner(msg.sender) == true) {
            return "You are already the current contract owner.";
        }
        else {
            currentOwner = msg.sender;
            return "Ownership changed.";
        }
    }

    function setText(string calldata _input) external {
        if(_checkCurrentOwner(msg.sender) == true) {
            ownerText = _input;
        }
        else{
            anonText = _input;
        }
    }
}

