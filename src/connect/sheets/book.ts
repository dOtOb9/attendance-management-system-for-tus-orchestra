class Book {
  public readonly book_name: string;
  private book: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(name: string) {
    this.book_name = name;
  }

  private import() {
    switch (this.book_name){
      case "normal_atteding_tables":
        this.book = SpreadsheetApp.openById('1KZHcP57G4gtLo4xYT7Ambx-WgPPxPFDPMagTVdf068Q');
        break;

      case "tutti_attending_tables":
        this.book = SpreadsheetApp.openById('1NOQWIqt2tZE-e9FenWXtjx8VA-tW2Y4vX9W5wEuuDRY');
        break;

      case "user_info_tables":
        this.book = SpreadsheetApp.openById('1l9acuef7KRGIFWIVcrjwimHJ-UWOTE9503RZcoLIlC8');
        break;

      case "private_info_tables":
        this.book = SpreadsheetApp.openById('1TcOxE7GNvhJ_AVhwicLo6QceD1C-BJd9T5dPRRSdfZ0');
        break;
    }
  }

  public getSheet(sheet_name: string): Sheet {
    this.import();

    const sheet = this.book.getSheetByName(sheet_name);

    return new Sheet(sheet);
  }
}