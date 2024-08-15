class Today {
    private text: string;

    constructor(){
        const today = new Date();
        this.text = Utilities.formatDate(today, 'Asia/Tokyo', 'yyyy/MM/dd');
    }

    public toString(): string {
        return this.text;
    }
}