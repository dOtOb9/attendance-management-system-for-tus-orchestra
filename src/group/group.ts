class Group {
    private readonly bookshelf: Bookshelf;
    private readonly sheet: Sheet;
    public readonly users: Array<User>;
    public readonly strings: Array<string> = ['Vn', 'Va', 'Vc', 'Cb'];
    public readonly brass: Array<string> = ['Trb', 'Tp', 'Hr'];
    public readonly woodwind: Array<string> = ['Fl', 'Ob', 'Cl', 'Fg'];
    public readonly percussion: Array<string> = ['Perc'];
    public readonly orchestra: Array<string> = this.strings.concat(this.brass, this.woodwind, this.percussion);

    constructor(sheet: Sheet, bookshelf: Bookshelf, users: Array<User>=new Array<User>()) {
        this.users = users;
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

    public and(other: Group): Group {
        const newGroup = new Group(this.sheet, this.bookshelf, this.users.filter(user => other.users.includes(user)));
        return newGroup;
    }

    public or(other: Group): Group {
        const newGroup = new Group(this.sheet, this.bookshelf, this.users.concat(other.users));
        return newGroup;
    }

    
    public isParts(part: Array<string>, sheet: Sheet=this.sheet, bookshelf: Bookshelf=this.bookshelf): Group {
        const users = sheet.getGroupArray(2, part, bookshelf);
        const newGroup = new Group(sheet, bookshelf, users);
        return newGroup;
    }

    public isConcertPlayers(sheet: Sheet=this.sheet, bookshelf: Bookshelf=this.bookshelf, program: number=4): Group {

        const users = sheet.getGroupArray(program+4, ['TRUE'], bookshelf);
        const newGroup = new Group(sheet, bookshelf, users);
        return newGroup;
    }

    discordFormat(): string {
        const userIds = this.users.map(user => user.id);
        return JSON.stringify(userIds);
    }
}