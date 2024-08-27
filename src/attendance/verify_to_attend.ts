class verifyToAttend {
    private user: User;
    private bookshelf: Bookshelf;
    private code: string;

    constructor(code: string, id: string, bookshelf: Bookshelf) {
        this.user = new User(id, bookshelf);
        this.bookshelf = bookshelf;
        this.code = code;
    }

    public start(): string {
        if (new AttendanceCode(this.bookshelf).isDifferentFrom(this.code)) return '入力コードが拒否されました。';
        
        const scheduleSheet = this.bookshelf.user_info_tables.getSheet('練習予定');

        const todayText = new Today().toString();

        const todayRows = scheduleSheet.getValueRowsFromUpper(todayText, 0);

        const today = new Today();

        const nowTermRows = (term=today.amOrPm()==='午前') => {
            if (term) {
                return todayRows.filter(row => row[2] === '1' || row[2] === '2');
            } else {
                return todayRows.filter(row => row[2] === '3' || row[2] === '4');
            }
        }

        const rows = nowTermRows();

        let attend_flag = false;
        rows.forEach(row => {
            const sheet = row[1] === 'TRUE' ? this.bookshelf.tutti_attending_tables.getSheet(row[3]) : this.bookshelf.normal_attending_tables.getSheet(row[3]);

            const userRow = sheet.reserchUser(this.user.id);

            if (sheet.getCellValue(userRow, sheet.getColumnsLength() - 1 - parseInt(row[4])) === '欠席') {
                sheet.setCellValue(userRow, sheet.getColumnsLength() - 1 - parseInt(row[4]), '出席');
                attend_flag = true;
            } 
        });

        if (attend_flag) return '出席を確認しました。';
        else return `本日は練習日ではないか、既に入力されています。`;
    }
}