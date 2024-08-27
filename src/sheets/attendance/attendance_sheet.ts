class AttendanceSheet extends MemberSheet {

    public setActivityDate(date: string): number {
        const dateColNumber = this.createColumnsLeft(date, 8, 1);

        return dateColNumber;
    }

    public setAttend(id: string): boolean {
        const memberRow = this.searchMember(id);

        const rowNumber = Number(memberRow[0]);
        const colNumber = Number(this.data.length - Number(memberRow[5]));

        if (this.data[rowNumber][colNumber] === "欠席") {
            this.setValue(rowNumber, colNumber, "出席");

            return true;
        }
        return false;
    }

    public setAbsense(dateColNumber: number) {
        const values = Array(this.data.length-2).fill(["欠席"]);
        this.setValues(
            2, 
            this.data[0].length - 1 - dateColNumber, 
            this.data.length - 2,
            1,
            values
        );
    }
}