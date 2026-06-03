export type BaseModel = {
    Id?: number
    Uid?: string
    Ctime?: string
    Mtime?: string
}

export type User = BaseModel & {
    Username?: string
    Role?: string
    Phone?: string
    Email?: string
    Nickname?: string
    Password?: string
    IsAdmin?: boolean
}

export type Group = BaseModel & {
    Name?: string
    Description?: string
    ExpiredAt?: string
    Owners?: User[]
    Users?: User[]
    Hosts?: User[]
    OsUsers?: OsUser[]
}


export type Host = BaseModel & {
    Name?: string
    Ip?: string
    Os?: string
    Port: number;
    Protocol: string;
    User: string;
    Password?: string
    PrivateKey?: string
    PrivateKeyPsd?: string
}

export type OsUser = User & {
    AppUid?: string
    Role?: string
}