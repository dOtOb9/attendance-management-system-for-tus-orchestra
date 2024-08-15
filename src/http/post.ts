function doPost(e) {
    const bookshelf = new Bookshelf();
    const json_data = JSON.parse(e.postData.contents);

    const response_text = (mode=json_data.mode) => {
        switch (mode) {
            case 'edit_user':
                break;

            case 'belong_contact_list':
                break;

            case 'generate_activity_date':
                createDate(json_data, false, bookshelf);
                break;

            case 'generate_tutti_date':
                createDate(json_data, true, bookshelf);
                break;

            case 'auth_attend':
                return 'aa';
        }
        return '返り値がありません';
    }
    return response_text;
}