function doGet(e) {
    const mode = e.parameter.mode;

    const bookshelf = new Bookshelf();

    let response_text: string;

    switch (mode) {
        case 'dashboard':
            return HtmlService.createHtmlOutputFromFile('dashboard');

        case 'user_data':
            const user = new User(e.parameter.id, bookshelf);
            response_text = user.attend_status.discordFormat();
            return ContentService.createTextOutput(response_text);

        case 'can_send_activity_dm':
            const group = new Group(bookshelf.user_info_tables.getSheet('ユーザー設定'), bookshelf);
            response_text = group.canRecieveActivityDm(e.parameter.type).discordFormat();
            return ContentService.createTextOutput(response_text);
    }
}