class Group {
    private readonly bookshelf: Bookshelf;
    private readonly sheet: Sheet;
    public readonly group: Array<User>;
    public readonly strings: Array<string> = ['Vn', 'Va', 'Vc', 'Cb'];
    public readonly brass: Array<string> = ['Trb', 'Tp', 'Hr'];
    public readonly woodwind: Array<string> = ['Fl', 'Ob', 'Cl', 'Fg'];
    public readonly percussion: Array<string> = ['Perc'];
    public readonly orchestra: Array<string> = this.strings.concat(this.brass, this.woodwind, this.percussion);

    constructor(sheet: Sheet, bookshelf: Bookshelf, group: Array<User>=new Array<User>()) {
        this.group = group;
        this.sheet = sheet;
        this.bookshelf = bookshelf;
    }

    public canRecieveActivityDm(type: string): Group {
        switch (type) {
            case 'strings':
                return this.isConcertPlayers().and(this.isParts(this.strings));

            case 'brass':
                return this.isConcertPlayers().and(this.isParts(this.brass));

            case 'woodwind':
                return this.isConcertPlayers().and(this.isParts(this.woodwind));

            case 'percussion':
                return this.isConcertPlayers().and(this.isParts(this.percussion));

            case 'orchestra':
                return this.isConcertPlayers().and(this.isParts(this.orchestra));
        }
    }

    private and(other: Group): Group {
        const newGroup = new Group(this.sheet, this.bookshelf, this.group.filter(user => other.group.includes(user)));
        return newGroup;
    }

    private or(other: Group): Group {
        const newGroup = new Group(this.sheet, this.bookshelf, this.group.concat(other.group));
        return newGroup;
    }

    
    public isParts(part: Array<string>, sheet: Sheet=this.sheet, bookshelf: Bookshelf=this.bookshelf): Group {
        const users = sheet.getGroupArray(2, part, bookshelf);
        const newGroup = new Group(sheet, bookshelf, users);
        return newGroup;
    }

    private isConcertPlayers(sheet: Sheet=this.sheet, bookshelf: Bookshelf=this.bookshelf): Group {
        const users = sheet.getGroupArray(8, ['true'], bookshelf);
        const newGroup = new Group(sheet, bookshelf, users);
        return newGroup;
    }

    discordFormat(): string {
        const userIds = this.group.map(user => user.id);
        return JSON.stringify(userIds);
    }
}