class AdministerActivityBook extends Book {
    constructor() {
        super("administerActivityBookID");
    }

    public getScheduleSheet() {
        const sheet = this.book.getSheetByName("練習予定");
        
        return new ScheduleSheet(sheet);
    }

    public getMembersInfoSheet() {
        const sheet = this.book.getSheetByName("乗り番");

        return new MembersInfoSheet(sheet);
    }
}