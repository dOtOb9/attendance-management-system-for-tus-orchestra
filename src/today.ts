class Today extends Date {

    public toString(): string {
        return Utilities.formatDate(this, 'Asia/Tokyo', 'yyyy/MM/dd');
    }

    public getTimeArea(): string {
        return this.getHours() < 12 ? '午前' : '午後';
    }

}