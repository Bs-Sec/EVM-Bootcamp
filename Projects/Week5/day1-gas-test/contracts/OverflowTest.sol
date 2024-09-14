// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract OverflowTest {
    uint8 public counter; // a uint8 can store up to 256 values on it -> from 0 to 255

    function increment(uint8 amount) public {
        counter += amount;
    }

    function forceIncrement(uint8 amount) public {
        unchecked {
            counter += amount;
        }
    }
}
