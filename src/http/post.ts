function doPost(e) {
    const bookshelf = new Bookshelf();
    const json_data = JSON.parse(e.postData.contents);

    const user = new User(json_data.id, bookshelf);

    const response_text = (mode=json_data.mode) => {
        switch (mode) {
            case 'edit_user':
                user.edit(json_data.name, json_data.id, json_data.part, json_data.grade);
                break;

            case 'belong_contact_list':
                user.belongContactList(json_data.id);
                break;

            case 'generate_activity_date':
                createDate(json_data, false, bookshelf);
                break;

            case 'generate_tutti_date':
                createDate(json_data, true, bookshelf);
                break;

            case 'auth_attend':
                return new verifyToAttend(json_data.code, json_data.id, bookshelf).start();
        }
        return '返り値がありません';
    }
    return response_text;
}