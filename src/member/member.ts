class Member {
    attend_status: AttendStatus;
    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    public addContactList() {
        const membersInfoSheet = new AdminActivityBook().getMembersInfoSheet();

        membersInfoSheet.addContactList(this.id);
    }

    public edit(MemberRow: Array<string>) {
        MemberRow[0] = `=HYPERLINK("https://discord.com/users/${MemberRow[1]}", "${MemberRow[0]}")`;
        
        const memberInfoSheet = new AdminActivityBook().getMembersInfoSheet();

        memberInfoSheet.editMember(MemberRow);

        const normalAttendanceBook = new NormalAttendanceBook();
        const tuttiAttendanceBook = new TuttiAttendanceBook();

        [normalAttendanceBook, tuttiAttendanceBook].forEach(book => {
            ['前曲', '中曲', 'メイン曲'].forEach(section => {
                const attendanceSheet = book.getSheet(section);

                attendanceSheet.editMember(MemberRow);
            })
        })
    }
}