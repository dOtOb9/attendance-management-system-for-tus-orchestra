function regular() {
    const bookshelf = new Bookshelf();
    
    const scheduleSheet = bookshelf.user_info_tables.getSheet('練習予定');
    const UserInfoSheet = bookshelf.user_info_tables.getSheet('ユーザー設定');
    
    const noneValueRows = scheduleSheet.getValueRowsFromUpper('', 4);
    
    
    let rowNumber = 1;
    noneValueRows.forEach(row => {
        console.log(row);
        const book = row[1] === 'TRUE' ? bookshelf.tutti_attending_tables : bookshelf.normal_attending_tables;
        
        const sheet = book.getSheet(row[3]);
        const resColNumber = sheet.createColumnsLeft(row[0], 7, 1);
        for (let i=1; i<noneValueRows.length;++i) {
            sheet.setCellValue(i, row.length - Number(resColNumber), '欠席');
        }
        scheduleSheet.setCellValue(rowNumber, 4, resColNumber);
        
        rowNumber++;
    });
    
    
    
    const today = new Today();
    
    if (scheduleSheet.hasValueRow(today.toString(), 0)) {
        const attendanceCode = new AttendanceCode(bookshelf);
        attendanceCode.replace();
        attendanceCode.sendDiscord();
    }
    const todayRows = scheduleSheet.getValueRowsFromUpper(today.toString(), 0);
    
    
}