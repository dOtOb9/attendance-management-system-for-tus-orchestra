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