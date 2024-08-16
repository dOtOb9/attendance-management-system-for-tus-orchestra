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

        if (todayRows.length === 0) return '本日は練習日ではありません。';

        
    }
}