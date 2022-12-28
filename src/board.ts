/** Marks an unmarked/empty field */
const UNMARKED = "";

export class Board {
  private board: string[] = [];
  private boardSideLength: number = 2;
  private emptyFieldsLeft = 0;
  private readonly winRowSize: number;

  public constructor(winRowSize: number) {
    this.winRowSize = winRowSize;
  }

  public asArray() {
    return this.board;
  }

  public size() {
    return this.board.length;
  }

  /**
   * Clears the board and resizes it.
   * @param boardSideLength The side length of the board. `boardSideLength^2` is the entire board.
   */
  public resetAndResize(boardSideLength: number = this.boardSideLength) {
    this.boardSideLength = boardSideLength;
    const fields = this.boardSideLength ** 2;
    this.emptyFieldsLeft = fields;
    this.board = new Array(fields).fill(UNMARKED);
  }

  public mark(field: number, symbol: string): boolean {
    if (this.getField(field) === UNMARKED) {
      this.emptyFieldsLeft--;
      this.board[field] = symbol;
      return true;
    }
    return false;
  }

  /** Checks if the game is tied. */
  public isDraw() {
    // TODO: detect tie when it happens, even before all fields are marked
    return this.emptyFieldsLeft === 0;
  }

  /**
   * Checks if a mark wins the game.
   * @param symbol The symbol of the player that marked the field.
   * @param field The newly marked field.
  */
  public isWinningMark(symbol: string, field: number): boolean {
    const fieldsToTopLeft = this.countFieldsInDirection(symbol, field, -1, -1);
    const fieldsToTopCenter = this.countFieldsInDirection(symbol, field, -1, 0);
    const fieldsToTopRight = this.countFieldsInDirection(symbol, field, -1, 1);
    const fieldsToLeft = this.countFieldsInDirection(symbol, field, 0, -1);
    const fieldsToRight = this.countFieldsInDirection(symbol, field, 0, 1);
    const fieldsToBottomLeft = this.countFieldsInDirection(symbol, field, 1, -1);
    const fieldsToBottomCenter = this.countFieldsInDirection(symbol, field, 1, 0);
    const fieldsToBottomRight = this.countFieldsInDirection(symbol, field, 1, 1);
    return Math.max(
      fieldsToTopLeft + fieldsToBottomRight,    // \
      fieldsToTopCenter + fieldsToBottomCenter, // |
      fieldsToTopRight + fieldsToBottomLeft,    // /
      fieldsToLeft + fieldsToRight              // -
    ) + 1 === this.winRowSize;
  }

  private countFieldsInDirection(symbol: string, field: number, deltaRow: number, deltaColumn: number) {
    let fields = 0;
    let rowOffset = 0;
    let columnOffset = 0;
    while (this.getField(field, (rowOffset += deltaRow), (columnOffset += deltaColumn)) === symbol) fields++;
    return fields;
  }

  /**
   * Gets a field relative another field on the board.
   * @param field The field.
   * @param rowOffset Relative row.
   * @param columnOffset Relative column.
   * @returns the symbol or `UNMARKED` marking the field or `null` if the requested field is out of bounds.
   */
  public getField(
    field: number,
    rowOffset: number = 0,
    columnOffset: number = 0
  ): string | null {
    const relativeColumn = field % this.boardSideLength + columnOffset;
    if (relativeColumn < 0 || relativeColumn >= this.boardSideLength) return null;
    const relativeRow = Math.floor(field / this.boardSideLength) + rowOffset;
    if (relativeRow < 0 || relativeRow >= this.boardSideLength) return null;
    const relativeField = relativeRow * this.boardSideLength + relativeColumn;
    if (relativeField >= 0 && relativeField < this.board.length) return this.board[relativeField];
    else return null;
  }
}
