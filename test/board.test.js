import assert from "assert";
import { Board } from "../dist/board.js";

const SIDE_LENGTH = 12;

const board = new Board(SIDE_LENGTH);
board.resetAndResize(SIDE_LENGTH);

it(`the board has a size of ${SIDE_LENGTH}^2 fields`, () => {
  assert.equal(board.size(), SIDE_LENGTH ** 2);
});

/**
 * The field numbers of twelve fields going from
 * the top left to bottom right of the board
 */
const fields = [
  0 * SIDE_LENGTH + 0,
  1 * SIDE_LENGTH + 1,
  2 * SIDE_LENGTH + 2,
  3 * SIDE_LENGTH + 3,
  4 * SIDE_LENGTH + 4,
  5 * SIDE_LENGTH + 5,
  6 * SIDE_LENGTH + 6,
  7 * SIDE_LENGTH + 7,
  8 * SIDE_LENGTH + 8,
  9 * SIDE_LENGTH + 9,
  10 * SIDE_LENGTH + 10,
  11 * SIDE_LENGTH + 11
];
it("unmarked fields can be marked", () => {
  for (const field of fields) {
    assert.equal(board.mark(field, "X"), true);
  }
});

it("getFields() functions correctly", () => {
  assert.equal(board.getField(fields[8]), "X");
});

it("marked fields cannot be marked", () => {
  assert.equal(board.mark(fields[8]), false);
});

it("player Y has not won yet", () => {
  board.mark(3, "Y");
  assert.equal(board.isWinningMark("Y", 3), false);
});

it("player X has won", () => {
  assert.equal(board.isWinningMark("X", fields[4]), true);
});
