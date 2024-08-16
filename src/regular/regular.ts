function regular() {
    const bookshelf = new Bookshelf();

    const scheduleSheet = bookshelf.user_info_tables.getSheet('練習予定');

    const noneValueRows = scheduleSheet.getValueRowsFromUpper('', 4);
    
    
    let rowNumber = 1;
    noneValueRows.forEach(row => {
        console.log(row);
        const book = row[1] === 'TRUE' ? bookshelf.tutti_attending_tables : bookshelf.normal_attending_tables;
        
        const sheet = book.getSheet(row[3]);
        const response = sheet.createColumnsLeft(row[0], 7, 1);
        scheduleSheet.setCellValue(rowNumber, 4, response);
        
        rowNumber++;
    });
    
    
        
    const today = new Today();

    const todayRows = scheduleSheet.getValueRowsFromUpper(today.toString(), 0);

    const nowTermRows = (term=today.amOrPm()==='午前') => {
        if (term) {
            return todayRows.filter(row => row[2] === '1' || row[2] === '2');
        } else {
            return todayRows.filter(row => row[2] === '3' || row[2] === '4');
        }
    }
    
    const rows = nowTermRows();
    rows.forEach(row => {
        const book = row[1] === 'TRUE' ? bookshelf.tutti_attending_tables : bookshelf.normal_attending_tables;
        const sheet = book.getSheet(row[3]);
        
        const group = new Group(sheet, bookshelf);
        
        let count = 0;
        const parts: Array<string> = [];
        [group.strings, group.brass, group.woodwind, group.percussion, group.orchestra].forEach(part => {
            if (row[5+count] === 'TRUE') {
                parts.concat(part);
            }
        });
        
        const users = group.isParts(parts).group;
        
        const colNumber = parseInt(row[4], 10);
        
        users.forEach(user => {
            const userRow = sheet.reserchUser(user.id);
            if (sheet.getCellValue(userRow, colNumber) === '') {
                sheet.setCellValue(userRow, colNumber, '欠席');    
            };
        })
    });
    
    if (todayRows.length === 0) return;
    
    if (scheduleSheet.hasValueRow(today.toString(), 0)) {
        const attendanceCode = new AttendanceCode(bookshelf);
        attendanceCode.replace();
        attendanceCode.sendDiscord();
    }
    
}