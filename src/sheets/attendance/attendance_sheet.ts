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

    override editMember(memberRow: Array<string>) {
        const newRowNumber = this.data.length;

        // 練習回数
        const activityNumber = `=COUNTIF(G${newRowNumber}:${newRowNumber}, "出席")+COUNTIF(G${newRowNumber}:${newRowNumber}, "欠席")+COUNTIF(G${newRowNumber}:${newRowNumber}, "遅刻")+COUNTIF(G${newRowNumber}:${newRowNumber}, "早退")`;
        // 出席回数
        const attendanceNumber = `=(COUNTIF(G${newRowNumber}:${newRowNumber}, "出席"))+(COUNTIF(G${newRowNumber}:${newRowNumber}, "遅刻"))*0.5+(COUNTIF(G${newRowNumber}:${newRowNumber}, "早退"))*0.5`;
        // 出席率
        const attendanceRate = `=D${newRowNumber}/MAX(C${newRowNumber})`;

        // 出欠表用の行を作成する
        const attendanceMemberRow = [memberRow[0], memberRow[1], activityNumber, attendanceNumber, attendanceRate, memberRow[2], memberRow[3]];

        super.editMember(attendanceMemberRow);
    }
}