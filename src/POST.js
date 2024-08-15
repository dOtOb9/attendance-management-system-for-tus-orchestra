//HTTP通信関連/GAS関数 doPost()

function doPost(e){
  var json_data = JSON.parse(e.postData.contents);

  return_text = "返り値がありません。";

  return_text = judge_action(json_data);

  return ContentService.createTextOutput(return_text);
}


function judge_action(json_data) {
  mode = json_data.mode;

  switch (mode) {
    case "edit_user":
      editUser(json_data.name, json_data.id, json_data.part, json_data.grade);
      break;

    case "belong_contact_list":
      belongContactList(json_data.id, json_data.bool);
      break;

    case "generate_activity_date":
      generateActivityDate(json_data, tutti=false);
      break;

    case "generate_tutti_date":
      generateActivityDate(json_data, tutti=true);
      break;  

    case "auth_attend":
      return authAttend(json_data);
  }
}
