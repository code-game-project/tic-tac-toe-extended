export interface GameConfig {
  /**
   * The amount of marked squares in any direction required to win. default = `3`;
   * minimum = `3`
   */
  win_row_size: number,
  /**
   * The side length of the board. Equals the board size by calculating `board_size^2`.
   * default = `(player_count + 1)^2`; minimum = `3`
   */
  board_size: number,
}

/**
 * Starts or restarts the game before the maximum, but after
 * the minumum, player count is reached.
 */
export interface StartCmd {
  name: "start",
  data?: undefined,
}

/**
 * Notifies everyone that the game has started.
 */
export interface StartedEvent {
  name: "started",
  data?: undefined,
}

/**
 * Notifies the player of the current board.
 */
export interface BoardEvent {
  name: "board",
  data: {
    /**
     * The board as rows of columns.
     */
    board: string[],
  },
}

/**
 * Marks a field with the player's symbol.
 */
export interface MarkCmd {
  name: "mark",
  data: {
    /**
     * The field index.
     */
    field: number,
  },
}

/**
 * Notifies the player that a field has been marked.
 */
export interface MarkedEvent {
  name: "marked",
  data: {
    /**
     * The field index.
     */
    field: number,
  },
}

/**
 * Notifies the player that the action they want to take is forbidden (at the moment).
 */
export interface ForbiddenActionEvent {
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
export interface MyTurnEvent {
  name: "my_turn",
  data?: undefined,
}

/**
 * Notifies the player that it is an opponents turn.
 */
export interface OpponentsTurnEvent {
  name: "opponents_turn",
  data: {
    /**
     * The ID of the player who's turn it is.
     */
    player: string,
  },
}

export enum Result {
  /**
   * The player that receives this variant has won.
   */
  WINNER = "winner",
  /**
   * The player that receives this variant has lost.
   */
  LOOSER = "looser",
  /**
   * It's a draw.
   */
  DRAW = "draw"
}

/**
 * Notifies the players that the game has ended.
 */
export interface FinishEvent {
  name: "finish",
  data: {
    /**
     * The game's outcome.
     */
    result: Result,
    /**
     * The winner's player ID if it was not a draw.
     */
    winner: string,
  },
}

export type Commands = StartCmd | MarkCmd;
export type Events = StartedEvent | BoardEvent | MarkedEvent | ForbiddenActionEvent | MyTurnEvent | OpponentsTurnEvent | FinishEvent;
