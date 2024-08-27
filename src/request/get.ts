function doGet(e) {
    const mode = e.parameter.mode;

    let response_text: string;

    switch (mode) {
        case 'dashboard':
            return HtmlService.createHtmlOutputFromFile('src/views/dashboard');

        case 'user_data':
            const user = new Member(e.parameter.id);
            response_text = user.attend_status.discordFormat();
            return ContentService.createTextOutput(response_text);

        case 'can_send_activity_dm':
            const sheet = new AdminActivityBook().getMembersInfoSheet();

            const contactListRows = sheet.getContactListRows();

            let memberList = [];
            
            let part = [];

            switch (e.parameter.type) {
                case 'strings':
                    part = ['Vn', 'Va', 'Vc', 'Cb'];
                    break;

                case 'brass':
                    part = ['Tp', 'Hr', 'Trb'];
                    break;

                case 'woodwind':
                    part = ['Fl', 'Ob', 'Cl', 'Fg'];
                    break;

                case 'percussion':
                    part = ['Perc'];
                    break;

                case 'orchestra':
                    part = ['Vn', 'Va', 'Vc', 'Cb', 'Tp', 'Hr', 'Trb', 'Fl', 'Fg', 'Ob', 'Cl', 'Perc'];
            }

            contactListRows.forEach(row => {
                if (part.includes(row[2])) {
                    memberList.push(row[1]);
                }
            });

            const json = {
                member_list: memberList
            };

            const response = JSON.stringify(json);
            
            return ContentService.createTextOutput(response);
    }
}