/**
 * Starts or restarts the game before the maximum player count is reached.
 */
export interface Start {
  name: "start",
  data?: undefined,
}

/**
 * Marks a field with the player's symbol.
 */
export interface Mark {
  name: "mark",
  data: {
    /**
     * the field index
     */
    field: number,
  },
}

/**
 * Notifies the player of the current board.
 */
export interface Board {
  name: "board",
  data: {
    /**
     * the board as rows of columns
     */
    board: string[],
  },
}

/**
 * Notifies the player that a field has been marked.
 */
export interface Marked {
  name: "marked",
  data: {
    /**
     * the field index
     */
    field: number,
  },
}

/**
 * Notifies the player that the action they want to take is forbidden (at the moment).
 */
export interface ForbiddenAction {
  name: "forbidden_action",
  data: {
    /**
     * A message detailing what and why the action is forbidden.
     */
    message: string,
  },
}

/**
 * Notifies the player that it is their turn.
 */
export interface MyTurn {
  name: "my_turn",
  data?: undefined,
}

/**
 * Notifies the player that it is an opponents turn.
 */
export interface OpponentsTurn {
  name: "opponents_turn",
  data: {
    /**
     * the ID of the player who's turn it is
     */
    player: string,
  },
}

/**
 * - winner: The player that receives this variant has won.
 * - looser: The player that receives this variant has lost.
 * - tie: It's a tie.
 */
export type Result = "winner" | "looser" | "tie";

/**
 * Notifies the players that the game has ended.
 */
export interface Finish {
  name: "finish",
  data: {
    /**
     * The game's outcome
     */
    result: Result,
  },
}

export type Events = Start | Mark | Board | Marked | ForbiddenAction | MyTurn | OpponentsTurn | Finish;
