//ユーザーを検索し、削除する

//function deleteUserData(sheet, row_number) {
//  sheet.deleteRow(++row_number);
//}
//
//function removeUser(id) {
//  attend_data = getDataTable("出欠表");
//  setting_data = getDataTable("ユーザー設定");
//
//  var row_number = researchUser(id, attend_data[1]);
//
//  if (row_number === 0) return;
//  
//  deleteUserData(attend_data[0], row_number);
//  deleteUserData(setting_data[0], row_number);
//}

//===============================================================================

function editUser(name, id, part, grade) {
  attend_data = getDataTable("出欠表");
  tutti_attend_data = getDataTable("Tutti出欠表");
  setting_data = getDataTable("ユーザー設定");

  name_url = `=HYPERLINK("https://discord.com/users/${id}", "${name}")`;

  attend_tables = [attend_data, tutti_attend_data];
  //出欠表の編集
  attend_tables.forEach((table) => {

  row_number = researchUser(id, table[1]);
  if (row_number === 0) {
    addUser(name_url, id, part, grade);
    return;
  }

  table[0].getRange(row_number+1, 1).setValue(name_url);
  table[0].getRange(row_number+1, 2).setValue(id);
  table[0].getRange(row_number+1, 4).setValue(part);
  table[0].getRange(row_number+1, 5).setValue(grade);
  });

  //ユーザー設定の編集
  row_number = researchUser(id, attend_data[1]);
  setting_data[0].getRange(row_number+1, 1).setValue(name_url);
  setting_data[0].getRange(row_number+1, 2).setValue(id);
  setting_data[0].getRange(row_number+1, 3).setValue(part);
  setting_data[0].getRange(row_number+1, 4).setValue(grade);
}


//===============================================================================
//新規ユーザーを追加する
//GAS関数 SpreadSheetApp()/.getActiveSpreadsheet()./getSheetByName().getRange().appendRow()

function addUser(name_url, id, part, grade) {
  attend_data = getDataTable("出欠表");
  tutti_attend_data = getDataTable("Tutti出欠表");
  setting_data = getDataTable("ユーザー設定");


  //出欠表シートの操作---------------------------------------------------------
  attend_tables = [attend_data, tutti_attend_data];
  attend_tables.forEach((table) => {

    last_row = attend_data[0].getLastRow();
    table[0].appendRow([name_url, id, setAttendFormula(last_row), part, grade]);
  });

  //ユーザー設定シートの操作-------------------------------------------------------
  setting_data[0].appendRow([name_url,id, part, grade]);
}

//=======================================================================================
//出席率の数式を生成する
function setAttendFormula(row) {
  range = `E${row}:${row}`;
  attend_cnt = `(COUNTIF(${range}, "出席"))`;
  absence_cnt = `(COUNTIF(${range}, "欠席"))`;
  late_cnt = `(COUNTIF(${range}, "遅刻"))`;
  leaving_early_cnt = `(COUNTIF(${range}, "早退"))`

  return `=(${attend_cnt}+${late_cnt}*0.5+${leaving_early_cnt}*0.5)/MAX(1, ${attend_cnt}+${absence_cnt}+${late_cnt}+${leaving_early_cnt})`
}
