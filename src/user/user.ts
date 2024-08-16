class User {
    attend_status: AttendStatus;
    readonly id: string;
    private bookshelf: Bookshelf;

    constructor(id: string, bookshelf: Bookshelf) {
        this.attend_status = new AttendStatus(id);
        this.id = id;
        this.import(bookshelf);
    }

    private import(bookshelf: Bookshelf) {
        this.bookshelf = bookshelf;
        this.attend_status.import(bookshelf);
    }

    public belongContactList(id: string) {
        const sheet = this.bookshelf.user_info_tables.getSheet('ユーザー設定');

        const user_row = sheet.reserchUser(id);

        sheet.setCellValue(user_row, 8, 'TRUE');
    }

    public edit(name: string, id: string, part: string, grade: string) {
        const nameUrl = `=HYPERLINK("https://discord.com/users/${id}", "${name}")`;

        const normalAttendanceBook = this.bookshelf.normal_attending_tables;
        const tuttiAttendanceBook = this.bookshelf.tutti_attending_tables;

        [normalAttendanceBook, tuttiAttendanceBook].forEach(book => {
            ['前曲', '中曲', 'メイン曲'].forEach(section => {
                const sheet = book.getSheet(section);
                const userRow = sheet.reserchUser(id);
                if (userRow === 0) {
                    this.add(sheet, 'attendance', nameUrl, id, part, grade);
                    return;
                }

                sheet.setCellValue(userRow, 0, nameUrl);
                sheet.setCellValue(userRow, 1, id);
                sheet.setCellValue(userRow, 5, part);
                sheet.setCellValue(userRow, 6, grade);
            })
        });

        const UserInfoBook = this.bookshelf.user_info_tables;
        const privateInfoBook = this.bookshelf.private_info_tables;

        [UserInfoBook, privateInfoBook].forEach((book) => {
            const sheet = book.getSheet('ユーザー設定');
            const userRow = sheet.reserchUser(id);
            if (userRow === 0) {
                this.add(sheet, 'setting', nameUrl, id, part, grade);
                return;
            }

            sheet.setCellValue(userRow, 0, nameUrl);
            sheet.setCellValue(userRow, 1, id);
            sheet.setCellValue(userRow, 2, part);
            sheet.setCellValue(userRow, 3, grade);
        });
    }

    public add(sheet: Sheet, type: string, nameUrl: string, id: string, part: string, grade: string) {
        if (type === 'attendance') {
            const lastRow = sheet.lastRow();

            sheet.createRowsBottom([
                [
                    nameUrl, 
                    id, 
                    `=COUNTIF(H${lastRow+1}:${lastRow+1}, "出席")+COUNTIF(H${lastRow+1}:${lastRow+1}, "欠席")+COUNTIF(H${lastRow+1}:${lastRow+1}, "遅刻")+COUNTIF(H${lastRow+1}:${lastRow+1}, "早退")`,
                    `=((COUNTIF(G${lastRow+1}:${lastRow+1}, "出席"))+(COUNTIF(G${lastRow+1}:${lastRow+1}, "遅刻"))*0.5+(COUNTIF(G${lastRow+1}:${lastRow+1}, "早退"))*0.5)`,
                    `=((COUNTIF(G${lastRow+1}:${lastRow+1}, "出席"))+(COUNTIF(G${lastRow+1}:${lastRow+1}, "遅刻"))*0.5+(COUNTIF(G${lastRow+1}:${lastRow+1}, "早退"))*0.5)/MAX(1, (COUNTIF(G${lastRow+1}:${lastRow+1}, "出席"))+(COUNTIF(G${lastRow+1}:${lastRow+1}, "欠席"))+(COUNTIF(G${lastRow+1}:${lastRow+1}, "遅刻"))+(COUNTIF(G${lastRow+1}:${lastRow+1}, "早退")))`, 
                    part, 
                    grade
                ]
            ]);
        } else {
            sheet.createRowsBottom([[nameUrl, id, part, grade]]);
        }
    }
}