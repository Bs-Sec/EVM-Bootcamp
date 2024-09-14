// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Gas {
    uint256 public highScore;

    function loopActions(uint256 actions) public {
        while (actions > 1) {
            highScore += actions / (1 + highScore);
            actions--;
        }
    }

    uint256 highestNumber1;

    function updateNumber(uint256 countValue) public {
        while (countValue > highestNumber1) {
            // 1 Memory Read + 1 Storage Read + 1 Comparison
            countValue--; // 1 Memory Write
            highestNumber1++; // 1 Storage Write
        }
    }

    uint256 highestNumber2;

    function updateNumberOptimized(uint256 countValue) public {
        uint256 highestNumber = highestNumber2; // 1 Storage Read + 1 Memory Write
        while (countValue > highestNumber) {
            // 1 Memory Read + 1 Memory Read + 1 Comparison
            countValue--; // 1 Memory Write
            highestNumber++; // 1 Memory Write
        }
        highestNumber2 = highestNumber; // 1 Storage Write + 1 Memory Read
    }

    struct Packed {
        // Stored in storage using only 3 Words
        uint256 a;
        uint128 b;
        uint128 c;
        uint64 d;
        uint64 e;
        uint64 f;
        uint32 g;
        uint8 h;
        uint8 i;
        uint8 j;
        uint8 k;
    }

    struct Unpacked {
        // Stored in storage using 4 Words
        uint128 b;
        uint8 h;
        uint64 d;
        uint8 k;
        uint256 a;
        uint64 e;
        uint128 c;
        uint8 j;
        uint64 f;
        uint8 i;
        uint32 g;
    }

    Packed[] packedObjectsArray;

    Unpacked[] unpackedObjectsArray;

    function createPacked() public {
        packedObjectsArray.push(
            Packed({
                a: 0,
                b: 0,
                c: 0,
                d: 0,
                e: 0,
                f: 0,
                g: 0,
                h: 0,
                i: 0,
                j: 0,
                k: 0
            })
        );
    }

    function createUnpacked() public {
        unpackedObjectsArray.push(
            Unpacked({
                a: 0,
                b: 0,
                c: 0,
                d: 0,
                e: 0,
                f: 0,
                g: 0,
                h: 0,
                i: 0,
                j: 0,
                k: 0
            })
        );
    }
}
