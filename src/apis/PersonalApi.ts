import type { Host, OsUser, User } from '@/utils/type'
import request, { type PageObject, type Response } from './request'

// ========== Auth ==========

export type ReqSignIn = {
    Username: string
    Password: string
}

// ========== Host ==========

export type ReqQueryHost = {
    Uid?: string
    Search?: string
    Page?: number
    PageSize?: number
}

export type ReqCreateHost = {
    Name: string
    Ip: string
    OsType?: string
    SSHPort?: number
    RDPPort?: number
    VNCPort?: number
    OsUserUids?: string[]
}

export type ReqUpdateHost = {
    Uid: string
    Name?: string
    Ip?: string
    OsType?: string
    SSHPort?: number
    RDPPort?: number
    VNCPort?: number
}

export type ReqDeleteHost = {
    Uid: string
    DeleteOsUser?: boolean
}

// ========== OsUser ==========

export type ReqCreateOsUser = {
    Name: string
    User: string
    Password?: string
    PrivateKey?: string
    PrivateKeyPsd?: string
    HostUid?: string
}

export type ReqUpdateOsUser = {
    Uid: string
    Name?: string
    User?: string
    Password?: string
    PrivateKey?: string
    PrivateKeyPsd?: string
}

export type ReqQueryOsUser = {
    Page?: number
    PageSize?: number
    Name?: string
    User?: string
}

export type ReqDeleteOsUser = {
    Uid: string
}

// ========== HostOsUser ==========

export type ReqQueryHostOsUser = {
    HostUid: string
    Page?: number
    PageSize?: number
}

export type ReqCreateHostOsUser = {
    HostUid: string
    OsUserUid: string
}

export type ReqDeleteHostOsUser = {
    HostUid: string
    OsUserUid: string
    DeleteOsUser?: boolean
}

// ========== User ==========

export type ReqUpdatePassword = {
    OldPassword: string
    NewPassword: string
}

export type ReqQueryUser = {
    Username?: string
    Page?: number
    PageSize?: number
}

export type ReqCreateUser = {
    Username: string
    Nickname?: string
    Email?: string
    Phone?: string
    Password: string
    IsAdmin?: boolean
}

export type ReqUpdateUser = {
    Uid: string
    Username?: string
    Nickname?: string
    Email?: string
    Phone?: string
    Password?: string
    IsAdmin?: boolean
}

export type ReqDeleteUser = {
    Uid: string
}

export default {
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

    // WebSocket
    GetSSHWebSocketUrl: (hostUid: string, osUserUid: string): string => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        return `${protocol}//${window.location.host}/api/ws/ssh/${hostUid}?osUserUid=${encodeURIComponent(osUserUid)}`
    },
    GetRDPWebSocketUrl: (hostUid: string, osUserUid: string): string => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        return `${protocol}//${window.location.host}/api/ws/rdp/${hostUid}?osUserUid=${encodeURIComponent(osUserUid)}`
    },
}