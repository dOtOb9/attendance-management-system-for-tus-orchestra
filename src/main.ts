class Property {
    private readonly property: GoogleAppsScript.Properties.Properties;

    constructor() {
        this.property = PropertiesService.getScriptProperties();
    }

    public setProperty(key: string, value: string): void {
        this.property.setProperty(key, value);
    }

    public getProperty(key: string) {
        const propertyValue =  this.property.getProperty(key);

        if (propertyValue === null) {
            throw new Error(`Property for key ${key} is not set.`);
        }
        return propertyValue;
    }
}


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
    private book: GoogleAppsScript.Spreadsheet.Spreadsheet;
    
    constructor(type: string) {
        this.book = SpreadsheetApp.openById(new Property().getProperty(type));
    }

    protected getSheetByName(sheetName: string) {
        const sheet = this.book.getSheetByName(sheetName);

        // シートが存在しない場合はエラーを返す
        if (sheet === null) {
            throw new Error(`Sheet ${sheetName} is not found.`);
        }
        return sheet;
    }
}

class SystemBook extends Book {
    constructor() {
        super("systemBookID");
    }

    public getAttendanceCodeSheet() {
        const sheet = this.getSheetByName("認証コード");

        return new AttendanceCodeSheet(sheet);
    }

    public getUserInfoSheet() {
        const sheet = this.getSheetByName("ユーザー情報");

        return new UserInfoSheet(sheet);
    }
}

class AdminActivityBook extends Book {
    constructor() {
        super("adminActivityBookID");
    }

    public getScheduleSheet() {
        const sheet = this.getSheetByName("練習予定");
        
        return new ScheduleSheet(sheet);
    }

    public getMembersInfoSheet() {
        const sheet = this.getSheetByName("乗り番");

        return new MembersInfoSheet(sheet);
    }
}

class AttendanceBook extends Book {
    
    public getSheet(sheetName: string) {
        const sheet = super.getSheetByName(sheetName);
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
  protected sheetName: string;

  constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
    this.sheet = sheet;

    this.sheetName = sheet.getSheetName();

    // 入力されている右端のセルを取得
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();

    // 入力されているデータ全体を取得
    this.data = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();

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
    this.data[row][col] = value;
  }

  protected setValues(startRow: number, startCol: number, NumRows: number, NumCols: number, values: Array<Array<string>>): void {
    this.sheet.getRange(startRow, startCol, NumRows, NumCols).setValues(values);
    values.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        this.data[startRow + rowIndex][startCol + colIndex] = value;
      });
    });
  }

  protected appendRow(row: Array<string>): void {
    this.sheet.appendRow(row);
  }

  protected sortCol(colNumber: number, type: boolean = true) {
    this.sheet.sort(colNumber, type);
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

      // ユーザーが見つからなかった場合はエラーを返す
        if (memberRow === undefined) {
            throw new Error(`Member ${id} is not found.`);
        }
      
      return memberRow;
  }
}

class AttendanceCodeSheet extends Sheet {
    private code: string;
    
    constructor(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
        super(sheet);
        this.code = this.data[2][1];
    }
    
    public getCode() {
        return this.code;
    }
    
    public replaceCode(notice=true) {
        this.code = (Math.floor(Math.random() * 9000) + 1000).toString();
        
        this.setValue(2, 1, this.code);
        
        if (notice) this.sendDiscord(this.code);
    }
    
    private sendDiscord(code: string) {
        const today = new Today();
        
        UrlFetchApp.fetch(new Property().getProperty('AttendanceDiscordBotURL'), {
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
                return row[2] === "1" || row[2] === "2";
            } else {
                return row[2] === "3" || row[2] === "4";
            }
        })
        
        return nowTermRows;
    }
    
    public setActivityDate(): void {
        // 列名が空白の行だけ取得
        const noneSetDateRows = this.data.filter(row => row[4] === "");
        
        const noneSetNormalDateRows = noneSetDateRows.filter(row => row[5] === "Tutti");
        const noneSetTuttiDateRows = noneSetDateRows.filter(row => row[5] !== "Tutti");
        
        // 通常練習、Tutti練習どちらも実行する
        [noneSetNormalDateRows, noneSetTuttiDateRows].forEach((rows: Array<Array<string>>): void => {
            // 追加する列がなければ終了する
            if (rows.length === 0) return;
            
            // Tutti列にチェックが入っているか、入っていないかの判定
            const attendanceBook = rows[0][5] === "Tutti" ? new TuttiAttendanceBook() : new NormalAttendanceBook();
            
            rows.forEach((row) => {
                // 曲名から対象のシートを取得する
                
                const attendanceSheet = attendanceBook.getSheet(row[3]);
                // 日付の出欠列を生成し、生成した列の右端から数えた列数を返す
                const dateColNumber = attendanceSheet.setActivityDate(row[1]);
                
                // 生成した列の位置を記録する
                this.setValue(Number(row[0]), 4, dateColNumber.toString());
            })
        });
    }
    
    public beginActivityDate(today: Today, membersInfoSheet: MembersInfoSheet): void {
        const todayRows = this.data.filter(row => row[1] === today.toString());

        const tuttiAttendanceBook = new TuttiAttendanceBook();
        const normalAttendanceBook = new NormalAttendanceBook();
        
        todayRows.forEach((row) => {
            // Tutti列にチェックが入っているか、入っていないかの判定
            const attendanceBook = row[5] === "Tutti" ? tuttiAttendanceBook : normalAttendanceBook;
            
            // 曲名から対象のシートを取得する
            const attendanceSheet = attendanceBook.getSheet(row[3]);
            
            // 列名から対象のコマ列を取得し、各ユーザーに欠席を設定する
            attendanceSheet.setAbsense(Number(row[4]));

            // 降り番の入力をする
            attendanceSheet.setOffMembers(Number(row[4]), membersInfoSheet);
        });
    }
    
    public isActivityDate(today: Today): boolean {
        const todayRows = this.data.filter(row => row[1] === today.toString());
        
        return todayRows.length !== 0;
    }
    
    public prepareActivityDate(date: string, section: string, slots: Array<string>): void {
        for (let i = 0; i < slots.length; ++i) {
            this.appendRow([date, (i+1).toString(), slots[i], "", section]);
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
    
    public setAttend(id: string, dateColNumber: number) {
        const memberRow = this.searchMember(id);
        
        const rowNumber = Number(memberRow[0]);
        const colNumber = Number(this.data[0].length - 1 - dateColNumber);
        
        if (this.data[rowNumber][colNumber] === "欠席") {
            this.setValue(rowNumber, colNumber, "出席");
        }
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

    public setOffMembers(dateColNumber: number, membersInfoSHeet: MembersInfoSheet) {
        const offMemberIdsList = membersInfoSHeet.getOffMemberIds(this.sheetName);

        offMemberIdsList.forEach((id: string) => {
            const memberRow = this.searchMember(id);

            const rowNumber = Number(memberRow[0]);
            const colNumber = Number(this.data[0].length - 1 - dateColNumber);

            this.setValue(rowNumber, colNumber, "降り番");
        });
    }
    
    public getMemberAttendanceRateAndBase(id: string) {
        const MemberRow = this.searchMember(id);
        
        const rate = MemberRow[5];
        const base = MemberRow[3];
        
        return { rate, base };
    };

    public sortClear() {
        this.sortCol(2);
        this.sortCol(7);
        this.sortCol(6,false);
    };
}

class MembersInfoSheet extends MemberSheet {
    
    public addContactList(id: string) {
        const userRow = this.searchMember(id);
        
        this.setValue(Number(userRow[0]), 8, "TRUE");
    }
    
    public getContactListRows(): Array<Array<string>> {
        const MemberRows = this.data.filter((row) => row[8] === "TRUE");

        return MemberRows;
    }

    public getMemberIsPracticeContact(id: string) {
        const memberRow =  this.searchMember(id);

        return memberRow[9];
    }

    public getCustomMemberList() {
        return this.data.filter(row => row[8] === "TRUE").map(row => row[2]);
    }

    public getOffMemberIds(tuneName: string) {
        let tuneColNumber: number;

        switch(tuneName) {
            case '前曲':
                tuneColNumber = 5;
                break;

            case '中曲':
                tuneColNumber = 6;
                break;

            default:
                tuneColNumber = 7;
        }

        return this.data.filter(row => row[tuneColNumber] === 'FALSE').map(row => row[2]);
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
        const main = attendanceBook.getSheet('メイン１').getMemberAttendanceRateAndBase(this.id);
        
        return { overture, middle, main };
    }
    
    public discordFormat(): string{
        return JSON.stringify({
            'attend_status': `
            **前曲**
            出席率 ... ${this.normalAttendRateInfo.overture.rate}
            母数 ... ${this.normalAttendRateInfo.overture.base}
            **中曲**
            出席率 ... ${this.normalAttendRateInfo.middle.rate}
            母数 ... ${this.normalAttendRateInfo.middle.base}
            **メイン１**
            出席率 ... ${this.normalAttendRateInfo.main.rate}
            母数 ... ${this.normalAttendRateInfo.main.base}
            `,
            'tutti_attend_status': `
            **前曲**
            出席率 ... ${this.tuttiAttendRateInfo.overture.rate}
            母数 ... ${this.tuttiAttendRateInfo.overture.base}
            **中曲**
            出席率 ... ${this.tuttiAttendRateInfo.middle.rate}
            母数 ... ${this.tuttiAttendRateInfo.middle.base}
            **メイン１**
            出席率 ... ${this.tuttiAttendRateInfo.main.rate}
            母数 ... ${this.tuttiAttendRateInfo.main.base}
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
            ['前曲', '中曲', 'メイン１'].forEach(section => {
                const attendanceSheet = book.getSheet(section);

                attendanceSheet.editMember(memberRow);
            })
        })
    }
}


class setAttendance {
    private member: Member;

    constructor(id: string) {
        this.member = new Member(id);
    }

    public start() {
        const scheduleSheet = new AdminActivityBook().getScheduleSheet();

        const nowTermRows = scheduleSheet.getNowTermRow();

        nowTermRows.forEach(row => {
            const attendanceSheet = row[2] === 'TRUE' ? new TuttiAttendanceBook().getSheet(row[3]) : new NormalAttendanceBook().getSheet(row[3]);

            attendanceSheet.setAttend(this.member.id, Number(row[4]));
        });
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

            dashboardHtmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1')

            return dashboardHtmlOutput;

        case 'verify_attendance':
            const attendanceCodeSheet = new SystemBook().getAttendanceCodeSheet();

            const code = attendanceCodeSheet.getCode();

            const verifyAttendanceHtml = HtmlService.createTemplateFromFile('src/views/verify-attendance-form');

            verifyAttendanceHtml.env = {
                codeSubmitUrl: new Property().getProperty('codeSubmitUrl'),
                id: e.parameter.id,
                code: code
            }
            
            verifyAttendanceHtml.cssContent = HtmlService.createHtmlOutputFromFile('src/views/verify-attendance-form-css').getContent();
            const verifyAttendanceHtmlOutput = verifyAttendanceHtml.evaluate();

            verifyAttendanceHtmlOutput.addMetaTag('viewport', 'width=device-width, initial-scale=1')

            return verifyAttendanceHtmlOutput;

        case 'user_data':
            const user = new Member(e.parameter.id);
            response_text = user.attendanceStatus.discordFormat();
            return ContentService.createTextOutput(response_text);

        case 'can_send_activity_dm':
            const sheet = new AdminActivityBook().getMembersInfoSheet();

            const contactListRows = sheet.getContactListRows();

            let memberList: string[] = [];

            if (e.parameter.type === 'custom') {
                memberList = sheet.getCustomMemberList();
            } else {

                let part: string[] = [];
    
                switch (e.parameter.section) {
                    case '弦楽器':
                        part = ['Vn', 'Va', 'Vc', 'Cb'];
                        break;
    
                    case '金管楽器':
                        part = ['Tp', 'Hr', 'Trb'];
                        break;
    
                    case '木管楽器':
                        part = ['Fl', 'Ob', 'Cl', 'Fg'];
                        break;
    
                    case '打楽器':
                        part = ['Perc'];
                        break;
    
                    case 'Tutti':
                        part = ['Vn', 'Va', 'Vc', 'Cb', 'Tp', 'Hr', 'Trb', 'Fl', 'Fg', 'Ob', 'Cl', 'Perc'];
                }
    
                contactListRows.forEach(row => {
                    if (part.includes(row[3])) {
                        memberList.push(row[2]);
                    }
                });
            }
            

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
                scheduleSheet.prepareActivityDate(jsonData.date, jsonData.section, jsonData.slots);
                break;
            }

        }
        return '返り値がありません';
    }
    return ContentService.createTextOutput(response_text());
}

function regular() {
    const adminAcrivtyBook = new AdminActivityBook();
    const scheduleSheet = adminAcrivtyBook.getScheduleSheet();
    
    scheduleSheet.setActivityDate();
    const today = new Today();
    
    if (scheduleSheet.isActivityDate(today)){
        // 午前0時なら出欠列を生成
        if (today.date.getHours() === 0) {
            // 出欠列の生成
            const membersInfoSheet = adminAcrivtyBook.getMembersInfoSheet();

            // 欠席と降り番の入力をする
            scheduleSheet.beginActivityDate(today, membersInfoSheet);
        }
    
        // 認証コードを置き換える
        const systemBook = new SystemBook();
        const attendanceCodeSheet = systemBook.getAttendanceCodeSheet();
    
        attendanceCodeSheet.replaceCode();
    }

    const normalAttendanceBook = new NormalAttendanceBook();
    const tuttiAttendanceBook = new TuttiAttendanceBook();

    ['前曲', '中曲', 'メイン１', 'メイン２', 'メイン３', 'メイン４'].forEach((sheetName)=> {

        const normalAttendanceSheet = normalAttendanceBook.getSheet(sheetName);
        const tuttiAttendanceSheet = tuttiAttendanceBook.getSheet(sheetName);

        [normalAttendanceSheet, tuttiAttendanceSheet].forEach((sheet)=>{
            sheet.sortClear();
        });
    });
}

function registerAttendance(id: string) {
    new setAttendance(id).start();
}