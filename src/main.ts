class Today {
    public date: Date

    constructor () {
        this.date = new Date();
    }

    public toString(): string {
        return Utilities.formatDate(this.date, 'Asia/Tokyo', 'yyyy/MM/dd');
    }

    public getTimeArea(): string {
        return this.date.getHours() < 12 ? '午前' : '午後';
    }

}

class Book {
    protected book: GoogleAppsScript.Spreadsheet.Spreadsheet;
    
    constructor(type: string) {
        this.book = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty(type));
    }
}

class SystemBook extends Book {
    constructor() {
        super("systemBookID");
    }

    public getAttendanceCodeSheet() {
        const sheet = this.book.getSheetByName("認証コード");

        return new AttendanceCodeSheet(sheet);
    }

    public getUserInfoSheet() {
        const sheet = this.book.getSheetByName("ユーザー情報");

        return new UserInfoSheet(sheet);
    }
}

class AdminActivityBook extends Book {
    constructor() {
        super("adminActivityBookID");
    }

    public getScheduleSheet() {
        const sheet = this.book.getSheetByName("練習予定");
        
        return new ScheduleSheet(sheet);
    }

    public getMembersInfoSheet() {
        const sheet = this.book.getSheetByName("乗り番");

        return new MembersInfoSheet(sheet);
    }
}

class AdminEventBook extends Book {
    readonly adminEventSheet: AdminEventSheet;
    readonly eventAttendanceSheet: EventAttendanceSheet;

    constructor() {
        super("adminEventBookID");

        this.adminEventSheet = new AdminEventSheet(this.book.getSheetByName("管理用"));
        this.eventAttendanceSheet = new EventAttendanceSheet(this.book.getSheetByName("出欠表"));
    }

    public setEventInfo() {
        const settingDate = this.adminEventSheet.getSettingDate();

        const EventDateColNumber = this.eventAttendanceSheet.getEventDate(settingDate);

        this.adminEventSheet.setAttendaneSummarize(EventDateColNumber);
    }
}

class AttendanceBook extends Book {

    
    public getSheet(sheetName: string) {
        const sheet = this.book.getSheetByName(sheetName);
        return new AttendanceSheet(sheet);
    }
}

class NormalAttendanceBook extends AttendanceBook {

    constructor() {
        super("normalAttendanceBookID");
    }
}

class TuttiAttendanceBook extends AttendanceBook {

    constructor() {
        super("tuttiAttendanceBookID");
    }
}

class Sheet {
  private sheet: GoogleAppsScript.Spreadsheet.Sheet;
  protected data: string[][];

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;

    // 入力されている右端のセルを取得
    const last_row = sheet.getLastRow();
    const last_col = sheet.getLastColumn();

    // 入力されているデータ全体を取得
    this.data = sheet.getRange(1, 1, last_row, last_col).getDisplayValues();

    // ==================================================================================
    const addRowNumbers = (matrix: string[][]): string[][] => {
      return matrix.map((row, index) => [(index + 1).toString(), ...row]);
    };

    const addColumnNumbers = (matrix: string[][]): string[][] => {
      const columnNumbers = Array.from({ length: matrix[0].length + 1 }, (_, index) => index.toString());
      return [columnNumbers, ...matrix];
    };
    // ==================================================================================

    this.data = addRowNumbers(this.data);
    this.data = addColumnNumbers(this.data);
  }
  
  protected createColumnsLeft(value: string, col: number, rows: number): number {
    this.sheet.insertColumnsBefore(col, rows);
    this.sheet.getRange(1, col).setValue(value);
    return this.data[0].length - col;
  }

  protected setValue(row: number, col: number, value: string): void {
    this.sheet.getRange(row, col).setValue(value);
  }

  protected setValues(startRow: number, startCol: number, NumRows: number, NumCols: number, values: Array<Array<string>>): void {
    this.sheet.getRange(startRow, startCol, NumRows, NumCols).setValues(values);
  }

  protected appendRow(row: Array<string>): void {
    this.sheet.appendRow(row);
  }
}
  
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

class AttendanceCodeSheet extends Sheet {
    private code: string;
    
    constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
        super(sheet);
        this.code = this.data[2][1];
    }
    
    public isRightCode(code: string): boolean {
        return code === this.code;
    }
    
    public replaceCode(notice=true) {
        this.code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        this.setValue(2, 1, this.code);
        
        if (notice) this.sendDiscord(this.code);
    }
    
    private sendDiscord(code: string) {
        const today = new Today();
        
        UrlFetchApp.fetch(PropertiesService.getScriptProperties().getProperty('AttendanceDiscordBotURL'), {
            method: 'post',
            contentType: 'application/json',
            payload: JSON.stringify({
                embeds: [
                    {
                        title: `${code}`,
                        description: `${today.toString()}\n${today.getTimeArea()}\nの出席認証コード`,
                        color: parseInt('ff8000', 16),
                    }
                ]
            })
        });
    }
}

class UserInfoSheet extends Sheet {
    
}

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
    
    public prepareActivityDate(date: string, section: string, tutti: string, slots: Array<string>): void {
        for (let i = 0; i < slots.length; ++i) {
            this.appendRow([date, tutti, (i+1).toString(), slots[i], "", section]);
        }
    }
}

class AttendanceSheet extends MemberSheet {
    
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
    
    public setActivityDate(date: string): number {
        const dateColNumber = this.createColumnsLeft(date, 8, 1);
        
        return dateColNumber;
    }
    
    public setAttend(id: string, datePos: number): boolean {
        const memberRow = this.searchMember(id);
        
        const rowNumber = Number(memberRow[0]);
        const colNumber = Number(this.data[0].length - 1 - datePos);
        
        if (this.data[rowNumber][colNumber] === "欠席") {
            this.setValue(rowNumber, colNumber, "出席");
            
            return true;
        }
        return false;
    }
    
    public setAbsense(dateColNumber: number): void {
        const values = Array(this.data.length-2).fill(["欠席"]);
        this.setValues(
            2, 
            this.data[0].length - 1 - dateColNumber, 
            this.data.length - 2,
            1,
            values
        );
    }
    
    public getMemberAttendanceRateAndBase(id: string) {
        const MemberRow = this.searchMember(id);
        
        const rate = MemberRow[5];
        const base = MemberRow[3];
        
        return { rate, base };
    };
}

class AdminEventSheet extends Sheet {
    public getSettingDate() {
        return this.data[4][8];
    }

    public setAttendaneSummarize(dateColNumber: number) {
        const dateCol = String.fromCharCode(dateColNumber+64);

        this.setValue(5, 8, `=COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "出席")+COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "委任状")`);
        this.setValue(6, 8, `=COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "出席")`);
        this.setValue(7, 8, `=COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "出席")+COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "早退")`);
        this.setValue(8, 8, `=COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "委任状")`);
        this.setValue(9, 8, `=COUNTIF('出欠表'!$${dateCol}2:$${dateCol}, "欠席")`);
    }
}

class EventAttendanceSheet extends AttendanceSheet {
    public getEventDate(date: string): number {
        return this.data[1].indexOf(date);
    }
}

class MembersInfoSheet extends MemberSheet {
    
    public addContactList(id: string) {
        const userRow = this.searchMember(id);
        
        this.setValue(Number(userRow[0]), 8, "TRUE");
    }
    
    public getContactListRows(): Array<Array<string>> {
        const MemberRows = this.data.filter((row) => row[9] === "TRUE");

        return MemberRows;
    }

    public getMemberIsPracticeContact(id: string) {
        const memberRow =  this.searchMember(id);

        return memberRow[9];
    }
}

interface AttendRateInfo{
    overture: AttendRateData;
    middle: AttendRateData;
    main: AttendRateData;
}

interface AttendRateData {
    rate: string;
    base: string;
}

class AttendanceStatus {
    private readonly id: string;
    private normalAttendRateInfo: AttendRateInfo;
    private tuttiAttendRateInfo: AttendRateInfo;
    
    constructor(id: string) {
        this.id = id;
        this.normalAttendRateInfo = this.getAttendRateStatus(new NormalAttendanceBook());
        this.tuttiAttendRateInfo = this.getAttendRateStatus(new TuttiAttendanceBook());
    }
    
    public getAttendRateStatus(attendanceBook: AttendanceBook): AttendRateInfo {
        const overture = attendanceBook.getSheet('前曲').getMemberAttendanceRateAndBase(this.id);
        const middle = attendanceBook.getSheet('中曲').getMemberAttendanceRateAndBase(this.id);
        const main = attendanceBook.getSheet('メイン曲').getMemberAttendanceRateAndBase(this.id);
        
        return { overture, middle, main };
    }
    
    public discordFormat(): string{
        return JSON.stringify({
            'attend_status': `
            - 前曲\n
            出席率 ... ${this.normalAttendRateInfo.overture.rate}\n
            母数 ... ${this.normalAttendRateInfo.overture.base}\n\n
            - 中曲\n
            出席率 ... ${this.normalAttendRateInfo.middle.rate}\n
            母数 ... ${this.normalAttendRateInfo.middle.base}\n\n
            - メイン曲
            出席率 ... ${this.normalAttendRateInfo.main.rate}\n
            母数 ... ${this.normalAttendRateInfo.main.base}\n
            `,
            'tutti_attend_status': `
            - 前曲\n
            出席率 ... ${this.tuttiAttendRateInfo.overture.rate}\n
            母数 ... ${this.tuttiAttendRateInfo.overture.base}\n\n
            - 中曲\n
            出席率 ... ${this.tuttiAttendRateInfo.middle.rate}\n
            母数 ... ${this.tuttiAttendRateInfo.middle.base}\n\n
            - メイン曲
            出席率 ... ${this.tuttiAttendRateInfo.main.rate}\n
            母数 ... ${this.tuttiAttendRateInfo.main.base}\n
            `,        
        })
    }
}



class Member {
    attendanceStatus: AttendanceStatus;
    readonly id: string;
    readonly name: string;
    readonly part: string;
    readonly grade: string;

    constructor(id: string, name: string = "", part: string = "", grade: string = "") {
        this.id = id;
        this.name = name;
        this.part = part;
        this.grade = grade;
        this.attendanceStatus = new AttendanceStatus(id);
    }

    public addContactList() {
        const membersInfoSheet = new AdminActivityBook().getMembersInfoSheet();

        membersInfoSheet.addContactList(this.id);
    }

    public edit() {
        const displayName = `=HYPERLINK("https://discord.com/users/${this.id}", "${this.name}")`;

        const memberRow = [displayName, this.id, this.part, this.grade];

        const memberInfoSheet = new AdminActivityBook().getMembersInfoSheet();

        memberInfoSheet.editMember(memberRow);

        const normalAttendanceBook = new NormalAttendanceBook();
        const tuttiAttendanceBook = new TuttiAttendanceBook();

        [normalAttendanceBook, tuttiAttendanceBook].forEach(book => {
            ['前曲', '中曲', 'メイン曲'].forEach(section => {
                const attendanceSheet = book.getSheet(section);

                attendanceSheet.editMember(memberRow);
            })
        })
    }
}


class verifyAttendance {
    private member: Member;
    private code: string;

    constructor(code: string, id: string) {
        this.member = new Member(id);
        this.code = code;
    }

    public start(): string {
        const attendanceCodeSheet = new SystemBook().getAttendanceCodeSheet();
        if (!attendanceCodeSheet.isRightCode(this.code)) {
            return '入力コードが拒否されました。';
        }

        const scheduleSheet = new AdminActivityBook().getScheduleSheet();

        const nowTermRows = scheduleSheet.getNowTermRow();

        let attendanceFlag = false;
        nowTermRows.forEach(row => {
            const attendanceSheet = row[2] === 'TRUE' ? new TuttiAttendanceBook().getSheet(row[4]) : new NormalAttendanceBook().getSheet(row[4]);

            attendanceFlag = attendanceSheet.setAttend(this.member.id, Number(row[5]));
        });

        if (attendanceFlag) return '出席を確認しました。';
        else return `本日は練習日ではないか、既に入力されています。`;
    }
}

function doGet(e) {
    const mode = e.parameter.mode;

    let response_text: string;

    switch (mode) {
        case 'dashboard':
            const normalAttendanceBook = new NormalAttendanceBook();
            const tuttiAttendanceBook = new TuttiAttendanceBook();


            const member = new Member(e.parameter.id);

            const normalAttendRateStatus = member.attendanceStatus.getAttendRateStatus(normalAttendanceBook);
            const tuttiAttendRateStatus = member.attendanceStatus.getAttendRateStatus(tuttiAttendanceBook);
            
            const dashboardHtml = HtmlService.createTemplateFromFile('src/views/dashboard');

            dashboardHtml.attendanceNormalOverture = normalAttendRateStatus.overture.rate;
            dashboardHtml.attendanceNormalMiddle = normalAttendRateStatus.middle.rate;
            dashboardHtml.attendanceNormalMain = normalAttendRateStatus.main.rate;

            dashboardHtml.attendanceTuttiOverture = tuttiAttendRateStatus.overture.rate;
            dashboardHtml.attendanceTuttiMiddle = tuttiAttendRateStatus.middle.rate;
            dashboardHtml.attendanceTuttiMain = tuttiAttendRateStatus.main.rate;

            dashboardHtml.cssContent = HtmlService.createHtmlOutputFromFile('src/views/dashboard-css').getContent();
            const dashboardHtmlOutput = dashboardHtml.evaluate();
            return dashboardHtmlOutput;

        case 'settingMeetingForm':
            const htmlTemplate = HtmlService.createTemplateFromFile('src/views/setting-meeting-form');

            htmlTemplate.cssContent = HtmlService.createHtmlOutputFromFile('src/views/setting-meeting-form-css').getContent();
            return htmlTemplate.evaluate();

        case 'user_data':
            const user = new Member(e.parameter.id);
            response_text = user.attendanceStatus.discordFormat();
            return ContentService.createTextOutput(response_text);

        case 'can_send_activity_dm':
            const sheet = new AdminActivityBook().getMembersInfoSheet();

            const contactListRows = sheet.getContactListRows();

            let memberList = [];
            
            let part = [];

            switch (e.parameter.type) {
                case 'strings':
                    part = ['Vn', 'Va', 'Vc', 'Cb'];
                    break;

                case 'brass':
                    part = ['Tp', 'Hr', 'Trb'];
                    break;

                case 'woodwind':
                    part = ['Fl', 'Ob', 'Cl', 'Fg'];
                    break;

                case 'percussion':
                    part = ['Perc'];
                    break;

                case 'orchestra':
                    part = ['Vn', 'Va', 'Vc', 'Cb', 'Tp', 'Hr', 'Trb', 'Fl', 'Fg', 'Ob', 'Cl', 'Perc'];
            }

            contactListRows.forEach(row => {
                if (part.includes(row[3])) {
                    memberList.push(row[2]);
                }
            });

            const json = {
                member_list: memberList
            };

            const response = JSON.stringify(json);
            
            return ContentService.createTextOutput(response);
    }
}

function doPost(e) {
    const jsonData = JSON.parse(e.postData.contents);

    const response_text = (mode=jsonData.mode) => {
        switch (mode) {
            case 'edit_user':{
                const member = new Member(jsonData.id, jsonData.name, jsonData.part, jsonData.grade);
                member.edit();
                break;
            }
            case 'belong_contact_list':{
                const member = new Member(jsonData.id);
                member.addContactList();
                break;
            }

            case 'generate_activity_date':{
                const scheduleSheet = new AdminActivityBook().getScheduleSheet();
                scheduleSheet.prepareActivityDate(jsonData.date, jsonData.section, jsonData.tutti, jsonData.slots);
                break;
            }

            case 'auth_attend':
                return new verifyAttendance(jsonData.code, jsonData.id).start();
        }
        return '返り値がありません';
    }
    return ContentService.createTextOutput(response_text());
}

function regular() {
    const scheduleSheet = new AdminActivityBook().getScheduleSheet();

    // 出欠列を生成
    scheduleSheet.setActivityDate();
    
    const today = new Today();

    if (!scheduleSheet.isActivityDate(today)) return; // もし、今日が練習日でないなら終了する

    // 午前0時なら出欠列を生成
    if (today.date.getHours() === 0) {
        scheduleSheet.beginActivityDate(today);
    }

    // 認証コードを置き換える
    const systemBook = new SystemBook();
    const attendanceCodeSheet = systemBook.getAttendanceCodeSheet();

    attendanceCodeSheet.replaceCode();
}

function setEventInfo() {
    const adminEventBook = new AdminEventBook();

    adminEventBook.setEventInfo();
}

function startEventFlow() {
    const ui = SpreadsheetApp.getUi();

    const htmlOutput = HtmlService
        .createHtmlOutput(`<a href="${PropertiesService.getScriptProperties().getProperty("doGetUrl")}?mode=dashboard">ここをクリック</a>`);

    ui.showModelessDialog(htmlOutput, "リンクからアクセス");
}