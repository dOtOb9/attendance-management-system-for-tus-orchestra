//出席コードを生成する
function generateAuthCode() {
  code = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  pass_sheet = getDataTable("管理");

  pass_sheet[0].getRange("出席コード").setValue(code);

  return code;
}

//==================================================================================
//今日の日付を文字列で取得する/GAS関数 Utilities.formatDate()/new Date()
function today() {
  date = new Date();

  date_text =  Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd');

  return date_text;
}

//================================================================================
// 今日の出欠列を取得

function getTodayColumn(attend_table) {
  today_text = today();
  
  col_number = 0;

  for (i = 5; i < attend_table[1][0].length; ++i) {
    if (attend_table[1][0][i] === today_text) {
      col_number = i;
      break;
    }
  }

  return col_number;
}

//===============================================================================
//出席に登録する/GAS関数 .getRange()/.setValue()

function writeAttend(data, attend_table) {

  var user_row_number = researchUser(data.id, attend_table[1]);

  col_number = getTodayColumn(attend_table);

  if (col_number === 0) return "nothing_date";

  //---------------------------------------------------------------------------------

  status = attend_table[1][user_row_number][col_number];
  if (status !== "欠席") return status;

  attend_table[0].getRange(++user_row_number, ++col_number).setValue("出席");

  return "verified_attend";
}

//==================================================================================
//出席コードが有効か判定する。/GAS関数 .getRange()/.getValue()
function authAttend(data) {
  pass_sheet = getDataTable("管理")
  right_code = pass_sheet[0].getRange("出席コード").getDisplayValue();

  if (data.code !== right_code) return "入力コードが拒否されました。";

  //--------------------------------------------------------------------

  normal_attend_table = getDataTable("出欠表");
  tutti_attend_table = getDataTable("Tutti出欠表");

  normal_approval = writeAttend(data, normal_attend_table);
  tutti_approval = writeAttend(data, tutti_attend_table);

  if (normal_approval === "verified_attend" || tutti_approval === "verified_attend") {
    return "入力コードが承認されました。";

  } else if (normal_approval === "nothing_date" && tutti_approval === "nothing_date") {
    return "今日は活動日ではありません。";
  } else {
    if (normal_approval !== "nothing_date") status = normal_approval;
    else status = tutti_approval;

    return `既に**${status}**と入力されています。`;
  }
}

