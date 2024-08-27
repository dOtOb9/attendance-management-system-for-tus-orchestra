class Sheet {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  protected data: string[][];

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;

    // 入力されている右端のセルを取得
    const last_row = sheet.getLastRow();
    const last_col = sheet.getLastColumn();

    // 入力されているデータ全体を取得
    this.data = sheet.getRange(1, 1, last_row, last_col).getDisplayValues();

    // ==================================================================================
    const addRowNumbers = (matrix: string[][]): string[][] => {
      return matrix.map((row, index) => [(index + 1).toString(), ...row]);
    };

    const addColumnNumbers = (matrix: string[][]): string[][] => {
      const columnNumbers = Array.from({ length: matrix[0].length + 1 }, (_, index) => index.toString());
      return [columnNumbers, ...matrix];
    };
    // ==================================================================================

    this.data = addRowNumbers(this.data);
    this.data = addColumnNumbers(this.data);
  }
  
  protected createColumnsLeft(value: string, col: number, rows: number): number {
    this.sheet.insertColumnsBefore(col, rows);
    this.sheet.getRange(1, col).setValue(value);
    return this.data[0].length - col;
  }

  protected setValue(row: number, col: number, value: string): void {
    this.sheet.getRange(row, col).setValue(value);
  }

  protected setValues(startRow: number, startCol: number, NumRows: number, NumCols: number, values: Array<Array<string>>): void {
    this.sheet.getRange(startRow, startCol, NumRows, NumCols).setValues(values);
  }

  protected appendRow(row: Array<string>): void {
    this.sheet.appendRow(row);
  }
}