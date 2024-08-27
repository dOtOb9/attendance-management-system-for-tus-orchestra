class SystemBook extends Book {
    constructor() {
        super("systemBookID");
    }

    public getAttendanceCodeSheet() {
        const sheet = this.book.getSheetByName("認証コード");

        return new AttendanceCodeSheet(sheet);
    }

    public getUserInfoSheet() {
        const sheet = this.book.getSheetByName("ユーザー情報");

        return new UserInfoSheet(sheet);
    }
}