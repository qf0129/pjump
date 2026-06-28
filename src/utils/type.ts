export type BaseModel = {
  Id: number;
  Uid: string;
  Ctime: string;
  Mtime: string;
};

export type User = BaseModel & {
  Username: string;
  Role: string;
  Phone: string;
  Email: string;
  Nickname: string;
  Password: string;
  IsAdmin: boolean;
};

export type Group = BaseModel & {
  Name: string;
  Description: string;
  ExpiredAt: string;
  Owners: User[];
  Users: User[];
  Hosts: User[];
  OsUsers: OsUser[];
};

export type Host = BaseModel & {
  Name: string;
  Ip: string;
  OsType: string;
  SSHPort: number;
  RDPPort: number;
  VNCPort: number;
  OsUsers: OsUser[];
};

export type OsUser = BaseModel & {
  Name: string;
  Username: string;
  Password: string;
  VncPassword: string;
  PrivateKey: string;
  PrivateKeyPsd: string;
};

export type HostOsUser = BaseModel & {
  HostUid: string;
  OsUserUid: string;
};

export type LoginRecord = BaseModel & {
  UserUid: string;
  Username: string;
  Ip: string;
  UserAgent: string;
  Success: boolean;
  Message: string;
  LoginTime: string;
};

export type OperationRecord = BaseModel & {
  UserUid: string;
  Username: string;
  Action: string;
  Resource: string;
  ResourceName: string;
  TargetUid: string;
  Ip: string;
  UserAgent: string;
  Detail: string;
  OperateTime: string;
};

export type SessionRecord = BaseModel & {
  UserUid: string;
  HostUid: string;
  OsUserUid: string;
  Proctol: string;
  StartTime: string;
  EndTime: string;
  Online: boolean;
};
