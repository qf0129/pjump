import type { AccessGroup, Group, Host, LoginRecord, OperationRecord, OsUser, SessionRecord, User } from '@/utils/type';
import request, { type PageObject, type Response } from './request';

// ========== Auth ==========

export type ReqSignIn = {
  Username: string;
  Password: string;
};

// ========== Host ==========

export type ReqQueryHost = {
  Uid?: string;
  Search?: string;
  Page?: number;
  PageSize?: number;
};

export type ReqCreateHost = {
  Name: string;
  Ip: string;
  OsType?: string;
  SSHPort?: number;
  RDPPort?: number;
  VNCPort?: number;
  OsUserUids?: string[];
};

export type ReqUpdateHost = {
  Uid: string;
  Name?: string;
  Ip?: string;
  OsType?: string;
  SSHPort?: number;
  RDPPort?: number;
  VNCPort?: number;
};

export type ReqDeleteHost = {
  Uid: string;
  DeleteOsUser?: boolean;
};

// ========== OsUser ==========

export type ReqCreateOsUser = {
  Name: string;
  Username: string;
  Password?: string;
  VncPassword?: string;
  PrivateKey?: string;
  PrivateKeyPsd?: string;
  HostUid?: string;
};

export type ReqUpdateOsUser = {
  Uid: string;
  Name?: string;
  Username?: string;
  Password?: string;
  VncPassword?: string;
  PrivateKey?: string;
  PrivateKeyPsd?: string;
  ClearPassword?: boolean;
  ClearVncPassword?: boolean;
  ClearPrivateKey?: boolean;
  ClearPrivateKeyPsd?: boolean;
};

export type ReqQueryOsUser = {
  Page?: number;
  PageSize?: number;
  Search?: string;
  Name?: string;
  Username?: string;
};

export type ReqDeleteOsUser = {
  Uid: string;
};

// ========== HostOsUser ==========

export type ReqQueryHostOsUser = {
  HostUid: string;
  Page?: number;
  PageSize?: number;
};

export type ReqCreateHostOsUser = {
  HostUid: string;
  OsUserUid: string;
};

export type ReqDeleteHostOsUser = {
  HostUid: string;
  OsUserUid: string;
  DeleteOsUser?: boolean;
};

// ========== User ==========

export type ReqUpdatePassword = {
  OldPassword: string;
  NewPassword: string;
};

export type ReqQueryUser = {
  Username?: string;
  Search?: string;
  Page?: number;
  PageSize?: number;
};

export type ReqCreateUser = {
  Username: string;
  Nickname?: string;
  Email?: string;
  Phone?: string;
  Password: string;
  IsAdmin?: boolean;
};

export type ReqUpdateUser = {
  Uid: string;
  Username?: string;
  Nickname?: string;
  Email?: string;
  Phone?: string;
  Password?: string;
  IsAdmin?: boolean;
};

export type ReqDeleteUser = {
  Uid: string;
};

// ========== Group ==========

export type ReqQueryGroupHost = {
  GroupUid: string;
  Page?: number;
  PageSize?: number;
};

// ========== AccessGroup ==========

export type ReqQueryAccessGroup = {
  Uid?: string;
  Search?: string;
  Page?: number;
  PageSize?: number;
};

export type ReqCreateAccessGroup = {
  Name: string;
  Description?: string;
  ExpiredAt?: string;
  AllowedOsUsernames?: string[];
};

export type ReqUpdateAccessGroup = {
  Uid: string;
  Name?: string;
  Description?: string;
  ExpiredAt?: string;
  AllowedOsUsernames?: string[];
};

export type ReqDeleteAccessGroup = {
  Uid: string;
};

export type ReqQueryAccessGroupRelation = {
  GroupUid: string;
  Page?: number;
  PageSize?: number;
};

export type ReqAccessGroupUserRelation = {
  GroupUid: string;
  UserUid: string;
};

export type ReqAccessGroupHostRelation = {
  GroupUid: string;
  HostUid: string;
};

export type ReqAccessGroupOsUserRelation = {
  GroupUid: string;
  OsUserUid: string;
};

// ========== Audit ==========

export type ReqQueryOperationRecord = {
  Page?: number;
  PageSize?: number;
  Username?: string;
  Action?: string;
  Resource?: string;
  TargetUid?: string;
};

export type ReqQueryLoginRecord = {
  Page?: number;
  PageSize?: number;
  Username?: string;
  Success?: boolean;
};

export type ReqQuerySessionRecord = {
  Page?: number;
  PageSize?: number;
  UserUid?: string;
  HostUid?: string;
  Protocol?: string;
  Online?: boolean;
};

export const Apis = {
  // Auth
  SignIn: (data: ReqSignIn): Promise<Response<{ Token: string }>> => request.post('/api/SignIn', data),
  GetHealth: (): Promise<Response<string>> => request.get('/api/health'),

  // User
  GetUserInfo: (): Promise<Response<User>> => request.post('/api/GetUserInfo'),
  UpdatePassword: (data: ReqUpdatePassword): Promise<Response<string>> => request.post('/api/UpdatePassword', data),
  QueryUser: (data: ReqQueryUser): Promise<Response<PageObject<User>>> => request.post('/api/QueryUser', data),
  CreateUser: (data: ReqCreateUser): Promise<Response<string>> => request.post('/api/CreateUser', data),
  UpdateUser: (data: ReqUpdateUser): Promise<Response<string>> => request.post('/api/UpdateUser', data),
  DeleteUser: (data: ReqDeleteUser): Promise<Response<string>> => request.post('/api/DeleteUser', data),

  // Host
  QueryHost: (data: ReqQueryHost): Promise<Response<PageObject<Host>>> => request.post('/api/QueryHost', data),
  CreateHost: (data: ReqCreateHost): Promise<Response<string>> => request.post('/api/CreateHost', data),
  UpdateHost: (data: ReqUpdateHost): Promise<Response<string>> => request.post('/api/UpdateHost', data),
  DeleteHost: (data: ReqDeleteHost): Promise<Response<string>> => request.post('/api/DeleteHost', data),

  // OsUser
  QueryOsUser: (data: ReqQueryOsUser): Promise<Response<PageObject<OsUser>>> => request.post('/api/QueryOsUser', data),
  CreateOsUser: (data: ReqCreateOsUser): Promise<Response<string>> => request.post('/api/CreateOsUser', data),
  UpdateOsUser: (data: ReqUpdateOsUser): Promise<Response<string>> => request.post('/api/UpdateOsUser', data),
  DeleteOsUser: (data: ReqDeleteOsUser): Promise<Response<null>> => request.post('/api/DeleteOsUser', data),

  // HostOsUser
  QueryHostOsUser: (data: ReqQueryHostOsUser): Promise<Response<PageObject<OsUser>>> => request.post('/api/QueryHostOsUser', data),
  CreateHostOsUser: (data: ReqCreateHostOsUser): Promise<Response<null>> => request.post('/api/CreateHostOsUser', data),
  DeleteHostOsUser: (data: ReqDeleteHostOsUser): Promise<Response<null>> => request.post('/api/DeleteHostOsUser', data),

  // Group
  QueryUserGroup: (data: object): Promise<Response<Group[]>> => request.post('/api/QueryUserGroup', data),
  QueryGroupHost: (data: ReqQueryGroupHost): Promise<Response<PageObject<Host>>> => request.post('/api/QueryGroupHost', data),

  // AccessGroup
  QueryAccessGroup: (data: ReqQueryAccessGroup): Promise<Response<PageObject<AccessGroup>>> => request.post('/api/QueryAccessGroup', data),
  QueryMyAccessGroup: (data: ReqQueryAccessGroup): Promise<Response<PageObject<AccessGroup>>> => request.post('/api/QueryMyAccessGroup', data),
  CreateAccessGroup: (data: ReqCreateAccessGroup): Promise<Response<string>> => request.post('/api/CreateAccessGroup', data),
  UpdateAccessGroup: (data: ReqUpdateAccessGroup): Promise<Response<string>> => request.post('/api/UpdateAccessGroup', data),
  DeleteAccessGroup: (data: ReqDeleteAccessGroup): Promise<Response<string>> => request.post('/api/DeleteAccessGroup', data),
  QueryAccessGroupOwner: (data: ReqQueryAccessGroupRelation): Promise<Response<PageObject<User>>> => request.post('/api/QueryAccessGroupOwner', data),
  CreateAccessGroupOwner: (data: ReqAccessGroupUserRelation): Promise<Response<null>> => request.post('/api/CreateAccessGroupOwner', data),
  DeleteAccessGroupOwner: (data: ReqAccessGroupUserRelation): Promise<Response<null>> => request.post('/api/DeleteAccessGroupOwner', data),
  QueryAccessGroupUser: (data: ReqQueryAccessGroupRelation): Promise<Response<PageObject<User>>> => request.post('/api/QueryAccessGroupUser', data),
  CreateAccessGroupUser: (data: ReqAccessGroupUserRelation): Promise<Response<null>> => request.post('/api/CreateAccessGroupUser', data),
  DeleteAccessGroupUser: (data: ReqAccessGroupUserRelation): Promise<Response<null>> => request.post('/api/DeleteAccessGroupUser', data),
  QueryAccessGroupHost: (data: ReqQueryAccessGroupRelation): Promise<Response<PageObject<Host>>> => request.post('/api/QueryAccessGroupHost', data),
  CreateAccessGroupHost: (data: ReqAccessGroupHostRelation): Promise<Response<null>> => request.post('/api/CreateAccessGroupHost', data),
  DeleteAccessGroupHost: (data: ReqAccessGroupHostRelation): Promise<Response<null>> => request.post('/api/DeleteAccessGroupHost', data),
  QueryAccessGroupOsUser: (data: ReqQueryAccessGroupRelation): Promise<Response<PageObject<OsUser>>> => request.post('/api/QueryAccessGroupOsUser', data),
  CreateAccessGroupOsUser: (data: ReqAccessGroupOsUserRelation): Promise<Response<null>> => request.post('/api/CreateAccessGroupOsUser', data),
  DeleteAccessGroupOsUser: (data: ReqAccessGroupOsUserRelation): Promise<Response<null>> => request.post('/api/DeleteAccessGroupOsUser', data),

  // Audit
  QueryOperationRecord: (data: ReqQueryOperationRecord): Promise<Response<PageObject<OperationRecord>>> => request.post('/api/QueryOperationRecord', data),
  QueryLoginRecord: (data: ReqQueryLoginRecord): Promise<Response<PageObject<LoginRecord>>> => request.post('/api/QueryLoginRecord', data),
  QuerySessionRecord: (data: ReqQuerySessionRecord): Promise<Response<PageObject<SessionRecord>>> => request.post('/api/QuerySessionRecord', data),

  // WebSocket
  GetWebSocketUrl: (remoteProtocol: 'ssh' | 'rdp' | 'vnc', hostUid: string, osUserUid?: string): string => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let url = `${protocol}//${window.location.host}/api/ws/${remoteProtocol}/${hostUid}`;
    if (osUserUid) {
      url += `?u=${encodeURIComponent(osUserUid)}`;
    }
    return url;
  },
};

export default Apis;
