class User {
    attend_status: AttendStatus;
    readonly id: string;
    private bookshelf: Bookshelf;

    constructor(id: string, bookshelf: Bookshelf) {
        this.attend_status = new AttendStatus(id);
        this.import(bookshelf);
    }

    private import(bookshelf: Bookshelf) {
        this.bookshelf = bookshelf;
        this.attend_status.import(bookshelf);
    }
}