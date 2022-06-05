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
    /**
     * the field index
     */
    field: number,
  },
}

/**
 * Notifies the player of the current board
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
 * Notifies the player that a field has been marked
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
 * Notifies the player that the field they tried to mark is occupied and by who
 */
export interface FieldOccupied {
  name: "field_occupied",
  data: {
    /**
     * the field index
     */
    field: number,
    /**
     * the id of the player occupying the field
     */
    player: string,
  },
}

/**
 * Notifies the player that it is their turn
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

/**
 * Notifies the player that the game is tied
 */
export interface Tie {
  name: "tie",
  data?: undefined,
}

export type Events = Start | Mark | Board | Marked | FieldOccupied | MyTurn | OpponentsTurn | Winner | Looser | Tie;
