class AttendStatus {
    private readonly id: string;
    private practice_contact: string;
    private normal_attend_rate_info: AttendRateInfo;
    private tutti_attend_rate_info: AttendRateInfo;

    constructor(id: string) {
        this.id = id;
    }

    private getAttendRateData(sheet: Sheet): AttendRateData {
        const rate = sheet.getUserCellValue(this.id, 4);
        const base = sheet.getUserCellValue(this.id, 2);
        return { rate, base };
    }

    private getAttendRateStatus(book: Book): AttendRateInfo {
        const overture = this.getAttendRateData(book.getSheet('前曲'));
        const middle = this.getAttendRateData(book.getSheet('中曲'));
        const main = this.getAttendRateData(book.getSheet('メイン曲'));
        return { overture, middle, main };
    }

    import(bookshelf: Bookshelf){
        this.practice_contact = bookshelf.user_info_tables.getSheet('ユーザー設定').getUserCellValue(this.id, 8);
        this.normal_attend_rate_info = this.getAttendRateStatus(bookshelf.normal_attending_tables);
        this.tutti_attend_rate_info = this.getAttendRateStatus(bookshelf.tutti_attending_tables);
    }

    discordFormat(): string{
        return JSON.stringify({
            'practice_contact': this.practice_contact,
            'attend_status': `出席率 ... ${this.normal_attend_rate_info}\n母数 ... ${this.normal_attend_rate_info}`,
            'tutti_attend_status': `出席率 ... ${this.tutti_attend_rate_info}\n母数 ... ${this.tutti_attend_rate_info}`,
        })
    }
}