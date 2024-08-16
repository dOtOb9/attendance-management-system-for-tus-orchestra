class AttendanceCode {
    private readonly pass_sheet: Sheet
    private code: string;

    constructor(bookshelf: Bookshelf) {
        this.pass_sheet = bookshelf.private_info_tables.getSheet('認証コード');
        this.code = this.pass_sheet.getCellValue(1, 0);
    }

    public isDifferentFrom(code: string): boolean {
        return this.code !== code;
    }

    public replace() {
        this.code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

        this.pass_sheet.setCellValue(1, 0, this.code);
    }

    public sendDiscord() {
        const nowHours = new Date().getHours();
        const timeArea = nowHours < 12 ? '午前' : '午後';

        UrlFetchApp.fetch('https://discord.com/api/webhooks/1215990174752833638/q7H71urtQaqvvKSCfEAQSMxroXuiaK12y4ZvU_LAgd1gQJiivmG6CnJKuJKKluHVqNFZ', {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify({
                embeds: [
                    {
                        title: `${this.code}`,
                        description: `${new Today().toString()}\n${timeArea}\nの出席認証コード`,
                        color: parseInt('ff8000', 16),
                    }
                ]
            })
        });
    }
}