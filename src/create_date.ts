function createDate(json_data, isTutti: boolean, bookshelf: Bookshelf) {
    const schedule_sheet = bookshelf.normal_attending_tables.getSheet('練習予定');

    const tutti = isTutti ? 'YES' : 'FALSE';

    const partyNumber = (name=json_data.party) => {
        switch (name) {
            case 'strings':
                return ['TRUE', 'FALSE', 'FALES', 'FALSE'];
            case 'woodwind':
                return ['FALSE', 'TRUE', 'FALES', 'FALSE'];
            case 'brass':
                return ['FALSE', 'FALSE', 'TRUE', 'FALSE'];
            case 'percussion':
                return ['FALSE', 'FALSE', 'FALES', 'TRUE'];
            case 'orchestra':
                return ['TRUE', 'TRUE', 'TRUE', 'TRUE'];
        }
    }

    schedule_sheet.createRowsBottom([
        [json_data.date_text, 'TRUE', '1', json_data.timeslots.first, ...partyNumber(json_data.party)],
        [json_data.date_text, 'TRUE', '2', json_data.timeslots.second, ...partyNumber(json_data.party)],
        [json_data.date_text, 'TRUE', '3', json_data.timeslots.third, ...partyNumber(json_data.party)],
        [json_data.date_text, 'TRUE', '4', json_data.timeslots.forth, ...partyNumber(json_data.party)],
    ])
}