import type { Host, } from '@/utils/type'
import request, { type PageObject, type Response } from './request'

export type ReqAuth = {
    Username: string
    Password: string
}

export type ReqQueryHost = {
    Uid?: string
    Page?: number
    PageSize?: number
}

export type ReqQueryGroupHost = {
    GroupUid?: string
    Page?: number
    PageSize?: number
}



export default {
    QueryHost: (data: ReqQueryHost): Promise<Response<PageObject<Host>>> => request.post('/api/QueryHost', data),
}