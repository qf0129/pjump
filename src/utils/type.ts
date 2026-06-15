export type BaseModel = {
    Id: number
    Uid: string
    Ctime: string
    Mtime: string
}

export type User = BaseModel & {
    Username: string
    Role: string
    Phone: string
    Email: string
    Nickname: string
    Password: string
    IsAdmin: boolean
}

export type Group = BaseModel & {
    Name: string
    Description: string
    ExpiredAt: string
    Owners: User[]
    Users: User[]
    Hosts: User[]
    OsUsers: OsUser[]
}


export type Host = BaseModel & {
    Name: string
    Ip: string
    OsType: string
    SSHPort: number
    RDPPort: number
    VNCPort: number
    OsUsers: OsUser[]
}

export type OsUser = BaseModel & {
    Name: string
    User: string
    Password: string
    PrivateKey: string
    PrivateKeyPsd: string
}

export type HostOsUser = BaseModel & {
    HostUid: string
    OsUserUid: string
}