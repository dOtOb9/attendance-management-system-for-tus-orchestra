class AttendanceSheet extends MemberSheet {

    public setActivityDate(date: string): number {
        const dateColNumber = this.createColumnsLeft(date, 8, 1);

        return dateColNumber;
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