class MembersInfoSheet extends MemberSheet {

    public addContactList(id: string) {
        const userRow = this.searchMember(id);

        this.setValue(Number(userRow[0]), 8, "TRUE");
    }

    public getContactListRows(): Array<Array<string>> {
        const MemberRows = this.data.filter((row) => row[9] === "TRUE");

        return MemberRows;
    }
}