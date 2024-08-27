function doPost(e) {
    const jsonData = JSON.parse(e.postData.contents);

    const response_text = (mode=jsonData.mode) => {
        switch (mode) {
            case 'edit_user':{
                const member = new Member(jsonData.id, jsonData.name, jsonData.part, jsonData.grade);
                member.edit();
                break;
            }
            case 'belong_contact_list':{
                const member = new Member(jsonData.id);
                member.addContactList();
                break;
            }

            case 'generate_activity_date':{
                const scheduleSheet = new AdminActivityBook().getScheduleSheet();
                scheduleSheet.prepareActivityDate(jsonData.date, jsonData.section, jsonData.tutti, jsonData.slots);
                break;
            }

            case 'auth_attend':
                return new verifyAttendance(jsonData.code, jsonData.id).start();
        }
        return '返り値がありません';
    }
    return ContentService.createTextOutput(response_text());
}