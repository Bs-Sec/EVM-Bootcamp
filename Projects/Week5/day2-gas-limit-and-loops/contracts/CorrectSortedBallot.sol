// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract CorrectSortedBallot {
    struct Proposal {
        bytes32 name;
        uint256 voteCount;
    }

    Proposal[] public proposals;
    Proposal[] public proposalsBeingSorted;
    uint public swaps;
    uint public sortedWords;
    uint public savedIndex;

    constructor(bytes32[] memory proposalNames) {
        for (uint256 i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
        savedIndex = 1;
        proposalsBeingSorted = proposals;
    }

    function restartLoop() public {
        swaps = 0;
        sortedWords = 0;
        savedIndex = 1;
        proposalsBeingSorted = proposals;
    }

    function sortProposals(uint256 steps) public returns (bool) {
        uint256 step = 0;
        while (sortedWords < proposalsBeingSorted.length) {
            if (step >= steps) return (false);
            if (savedIndex >= proposalsBeingSorted.length) {
                sortedWords = proposalsBeingSorted.length - swaps;
                swaps = 0;
                savedIndex = 1;
            } else {
                Proposal memory prevObj = proposalsBeingSorted[savedIndex - 1];
                if (
                    uint256(prevObj.name) >
                    uint256(proposalsBeingSorted[savedIndex].name)
                ) {
                    proposalsBeingSorted[savedIndex - 1] = proposalsBeingSorted[
                        savedIndex
                    ];
                    proposalsBeingSorted[savedIndex] = prevObj;
                    swaps++;
                }
                savedIndex++;
            }
            step++;
        }
        proposals = proposalsBeingSorted;
        return (true);
    }
}
