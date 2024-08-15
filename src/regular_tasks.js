// 一日毎に起動(0:00~1:00, 12:00~13:00)
function everydayTask() {

  const normal_attend_table = getDataTable("出欠表");
  const tutti_attend_table = getDataTable("Tutti出欠表");
  const setting_table = getDataTable("ユーザー設定");

  //----------------------------------------------------------------------

  setting_table[0].sort(4);
  setting_table[0].sort(3);

  [normal_attend_table[0], tutti_attend_table[0]].forEach((sheet)=> {
    sheet.sort(5, true); // 学年の列を昇順ソート
    sheet.sort(4, false); // パートの列を降順ソート
  });

  setting_table[0].sort(4, true); // 学年の列を昇順ソート
  setting_table[0].sort(3, false); // パートの列を降順ソート

  //----------------------------------------------------------------------

  const no_today_normal_column = find_today_column(normal_attend_table);
  const no_today_tutti_column = find_today_column(tutti_attend_table);

  if (no_today_normal_column && no_today_tutti_column) return;

  const code = generateAuthCode();

  sendAttendCode(code);
}

function find_today_column(table) {
  const col_number = getTodayColumn(table);

  if (col_number === 0) return true;

  set_absense(col_number, table);

  return false;
}

function set_absense(col_number, table) {
  for (let i = 1; i < table[1].length; ++i) {
    if (table[1][i][col_number] !== "") continue;

    table[0].getRange(i+1, col_number+1).setValue("欠席");
  }
}

function sendAttendCode(code) {
  // 現在が午前か午後かを判定する
  now_hours = new Date().getHours();

  time_slots = now_hours < 13 ? "午前" : "午後";

  UrlFetchApp.fetch(
    url = 'https://discord.com/api/webhooks/1215990174752833638/q7H71urtQaqvvKSCfEAQSMxroXuiaK12y4ZvU_LAgd1gQJiivmG6CnJKuJKKluHVqNFZ',
    params = {
      'method': 'post',
      'contentType': 'application/json',
      'payload': JSON.stringify(
        {
          'embeds': [
            {
              'title': `${code}`,
              'description': `${today()}の${time_slots}の出席認証コード`,
              'color': parseInt('ff8000', 16),
            }
          ]
        }
      )
    }
  );
}
