class AttendanceCodeSheet extends Sheet {
    private code: string;

    constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
        super(sheet);
        this.code = this.data[2][1];
    }

    public replaceCode(notice=true) {
        this.code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        this.setValue(2, 1, this.code);

        if (notice) this.sendDiscord(this.code);
    }

    private sendDiscord(code: string) {
        const today = new Today();

        UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('AttendanceDiscordBotUrl'), {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify({
                embeds: [
                    {
                        title: `${code}`,
                        description: `${today.toString()}\n${today.getTimeArea()}\nの出席認証コード`,
                        color: parseInt('ff8000', 16),
                    }
                ]
            })
        });
    }
}