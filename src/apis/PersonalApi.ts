import type { Host, User } from '@/utils/type'
import request, { type PageObject, type Response } from './request'

// ========== Auth ==========

export type ReqSignIn = {
    Username: string
    Password: string
}

// ========== Host ==========

export type ReqQueryHost = {
    Uid?: string
    Page?: number
    PageSize?: number
}

export type ReqCreateHost = {
    Name: string
    Ip: string
    Port: number
    Protocol: string
    User: string
    Password?: string
    PrivateKey?: string
    PrivateKeyPsd?: string
}

export type ReqUpdateHost = {
    Uid: string
    Name?: string
    Ip?: string
    Port?: number
    Protocol?: string
    User?: string
    Password?: string
    PrivateKey?: string
    PrivateKeyPsd?: string
}

export type ReqDeleteHost = {
    Uid: string
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
}