class Today {
    private readonly today: Date;

    constructor(){
        this.today = new Date();
    }

    public toString(): string {
        return Utilities.formatDate(this.today, 'Asia/Tokyo', 'yyyy/MM/dd');
    }

    public amOrPm(): string {
        return this.today.getHours() < 12 ? '午前' : '午後';
    }

}