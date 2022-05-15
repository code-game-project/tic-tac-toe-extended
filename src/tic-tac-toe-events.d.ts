/*
 * Tic Tac Toe v0.0.1
 */

/**
 * Starts the game before the maximum player count is reached
 */
export interface Start {
  name: "start",
  data?: undefined,
}

/**
 * Marks a field with the player's symbol
 */
export interface Mark {
  name: "mark",
  data: {
    row: number,
    column: string,
  },
}

/**
 * The available symbols
 * - a: Player 1's symbol
 * - b: Player 2's symbol
 * - c: Player 3's symbol
 * - d: Player 4's symbol
 * - e: Player 5's symbol
 * - empty: Empty field
 */
export type Symbol = "a" | "b" | "c" | "d" | "e" | "empty";

/**
 * Notifies the player of the current board
 */
export interface Board {
  name: "board",
  data: {
    board: { [index: string]: Symbol }[],
  },
}

/**
 * Notifies the player that a field has been marked
 */
export interface Marked {
  name: "marked",
  data: {
    row: number,
    column: string,
    symbol: Symbol,
  },
}

/**
 * Notifies the player that the field they tried to mark is occupied
 */
export interface FieldOccupied {
  name: "field_occupied",
  data: {
    row: number,
    column: string,
    symbol: Symbol,
  },
}

/**
 * Notifies the player that it is their turn to mark a field
 */
export interface MyTurn {
  name: "my_turn",
  data?: undefined,
}

/**
 * Notifies the player that it is an opponents turn
 */
export interface OpponentsTurn {
  name: "opponents_turn",
  data: {
    /**
     * The id of the player who's turn it is
     */
    player: string,
  },
}

/**
 * Notifies the player that they have won
 */
export interface Winner {
  name: "winner",
  data?: undefined,
}

/**
 * Notifies the player that they have lost
 */
export interface Looser {
  name: "looser",
  data?: undefined,
}

export type Events = Start | Mark | Board | Marked | FieldOccupied | MyTurn | OpponentsTurn | Winner | Looser;
