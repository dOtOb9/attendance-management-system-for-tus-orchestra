class ScheduleSheet extends Sheet {

    // 現在の練習コマの情報を取得する
    public getNowTermRow(): Array<Array<string>> {
        const today = new Today();
        const todayText = today.toString();
        const todayTimeArea = today.getTimeArea();

        const todayRows = this.data.filter(row => row[1] === todayText);

        const nowTermRows = todayRows.filter(row => {
            if (todayTimeArea === "午前") {
                return row[3] === "1" || row[3] === "2";
            } else {
                return row[3] === "3" || row[3] === "4";
            }
        })

        return nowTermRows;
    }

    public setActivityDate(): void {
        // 列名が空白の行だけ取得
        const noneSetDateRows = this.data.filter(row => row[5] === "");

        const noneSetNormalDateRows = noneSetDateRows.filter(row => row[2] === "FALSE");
        const noneSetTuttiDateRows = noneSetDateRows.filter(row => row[2] === "TRUE");

        // 通常練習、Tutti練習どちらも実行する
        [noneSetNormalDateRows, noneSetTuttiDateRows].forEach((rows: Array<Array<string>>): void => {
            // 追加する列がなければ終了する
            if (rows.length === 0) return;

            // Tutti列にチェックが入っているか、入っていないかの判定
            const attendanceBook = rows[0][2] === "TRUE" ? new TuttiAttendanceBook() : new NormalAttendanceBook();

            rows.forEach((row) => {
                // 曲名から対象のシートを取得する
                const attendanceSheet = attendanceBook.getSheet(row[4]);

                // 日付の出欠列を生成し、生成した列の右端から数えた列数を返す
                const dateColNumber = attendanceSheet.setActivityDate(row[1]);

                // 生成した列の位置を記録する
                this.setValue(Number(row[0]), 5, dateColNumber.toString());
            })
        });
    }

    public beginActivityDate(today: Today): void {
        const todayRows = this.data.filter(row => row[1] === today.toString());

        const todayNormalRows = this.data.filter(row => row[2] === "FALSE");
        const todayTuttiRows = this.data.filter(row => row[2] === "TRUE");

        [todayNormalRows, todayTuttiRows].forEach((rows) => {
            // Tutti列にチェックが入っているか、入っていないかの判定
            const attendanceBook = todayRows[0][2] === "TRUE" ? new TuttiAttendanceBook() : new NormalAttendanceBook();

            rows.forEach((row) => {
                // 曲名から対象のシートを取得する
                const attendanceSheet = attendanceBook.getSheet(row[4]);

                // 列名から対象のコマ列を取得し、各ユーザーに欠席を設定する
                attendanceSheet.setAbsense(Number(row[5]));
            });
        });

        if (todayRows.length !== 0) {
            const systemBook = new SystemBook();

            const attendanceCodeSheet = systemBook.getAttendanceCodeSheet();

            attendanceCodeSheet.replaceCode();
        }
    }

    public isActivityDate(today: Today): boolean {
        const todayRows = this.data.filter(row => row[1] === today.toString());

        return todayRows.length !== 0;
    }

    public prepareActivityDate(date: string, section: string, tutti: string, slots: Array<string>) {
        for (let i = 0; i < slots.length; ++i) {
            this.appendRow([date, tutti, (i+1).toString(), slots[i], "", section]);
        }
    }
}