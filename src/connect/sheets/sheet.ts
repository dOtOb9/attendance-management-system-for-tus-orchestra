class Sheet {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  private data: string[][];

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;

    //入力されている右端のセルを取得
    const last_row = sheet.getLastRow();
    const last_col = sheet.getLastColumn();

    //入力されているのデータ全体を取得
    this.data = sheet.getRange(1, 1, last_row, last_col).getValues();
  }

  // ユーザーの行位置を返す
  private reserchUser(id: string): number {
    let rowNumber = 0;
    for (let i = 1; i < this.data.length; ++i) {
      if (this.data[i][1] === id) rowNumber = i;
    }

    return rowNumber;
  }

  getCellValue(row: number, col: number): string {
    return this.data[row][col];
  }

  getUserCellValue(id: string, col: number): string {
    let row = this.reserchUser(id);
    return this.data[row][col];
  }

  getGroupArray(col: number, features: Array<string>, currentBookshelf: Bookshelf): Array<User> {
    const users: Array<User> = [];
    for (let i = 1; i < this.data.length; ++i) {
      features.forEach(feature => {
        if(this.data[i][col] === feature){
          users.push(new User(this.data[i][col], currentBookshelf));
        }
      });
      
    }
    return users;
  }

  createColumnsLeft(col: number=5, rows: number=1): void {
    this.sheet.insertColumnsBefore(col+1, rows);
    this.sheet.getRange(1, col+1).setValue(this.data[0][col+1] + 1);
  }

  createRowsBottom(values: Array<Array<string>>) {
    this.sheet.insertRowsAfter(this.data.length, values.length);
    this.sheet.getRange(this.data.length+1, 1, values.length, values[0].length).setValues(values);
  }

  setCellValue(row: number, col: number, value: string) {
    this.sheet.getRange(row+1, col+1).setValue(value);
  }
}