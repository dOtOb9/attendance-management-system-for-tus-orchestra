class AttendanceBook extends Book {

    
    public getSheet(sheetName: string) {
        const sheet = this.book.getSheetByName(sheetName);
        return new AttendanceSheet(sheet);
    }
}