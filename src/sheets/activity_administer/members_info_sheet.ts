class MembersInfoSheet extends MemberSheet {

    public addContactList(id: string) {
        const userRow = this.searchMember(id);

        this.setValue(Number(userRow[0]), 8, "TRUE");
    }
}