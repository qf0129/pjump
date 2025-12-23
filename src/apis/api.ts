import type { Group } from '@/utils/type'
import request, { type Response } from './request'

export type ReqAuth = {
    Username: string
    Password: string
}

export type ReqQueryUserGroup = {
    Page?: number
    PageSize?: number
}


export default {
    SignIn: (data: ReqAuth): Promise<Response<{ Token: string }>> => request.post('/api/SignIn', data),
    SignUp: (data: ReqAuth): Promise<Response<{ Uid: string }>> => request.post('/api/SignUp', data),
    SignOut: (): Promise<Response<boolean>> => request.post('/api/SignOut'),
    QueryUserGroup: (data: ReqQueryUserGroup): Promise<Response<Group[]>> => request.post('/api/QueryUserGroup', data),


    // "/UserSignUp":  public_api.UserSignUp,
    // "/UserSignIn":  public_api.UserSignIn,
    // "/UserSignOut": public_api.UserSignOut,
    // "/GetUserInfo":    user_api.GetUserInfo,
    // "/QueryUserGroup": user_api.QueryUserGroup,
    // "/QueryGroupHost": group_api.QueryGroupHost,
    // "/ConnectHost":    host_api.ConnectHost,
}