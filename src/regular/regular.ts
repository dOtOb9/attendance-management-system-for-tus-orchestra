function regular() {
    const scheduleSheet = new AdminActivityBook().getScheduleSheet();

    // 出欠列を生成
    scheduleSheet.setActivityDate();
    
    const today = new Today();

    if (scheduleSheet.isActivityDate(today)) return; // もし、今日が練習日出ないなら終了する

    // 午前0時なら出欠列を生成
    if (today.getHours() === 0) {
        scheduleSheet.beginActivityDate(today);
    }

    // 認証コードを置き換える
    const systemBook = new SystemBook();
    const attendanceCodeSheet = systemBook.getAttendanceCodeSheet();

    attendanceCodeSheet.replaceCode();
}