class MemberSheet extends Sheet {
    public editMember(memberRow: Array<string>): void {
        const userRow = this.searchMember(memberRow[1]);

        if (userRow === undefined) {
            this.addMember(memberRow);
            return;
        }
    }

    private addMember(memberRow: Array<string>) {
        this.appendRow(memberRow);
    }

    protected searchMember(id: string) {
        const memberRow = this.data.find((row) => row[2] === id);

        return memberRow;
    }
}