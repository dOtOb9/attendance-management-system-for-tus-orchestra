function regular() {
    const bookshelf = new Bookshelf();

    const attendanceCode = new AttendanceCode(bookshelf);
    attendanceCode.replace();
    attendanceCode.sendDiscord();
}