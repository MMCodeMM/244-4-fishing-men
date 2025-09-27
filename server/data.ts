export type User = {
    id:number 
    username:string 
    collection_fish_ids:number[]
    liked_fish_ids:number[]
    friends_user_ids:number[]
}

export type Fish = {
    id:number
    image:string 
    message:string
    lat:number
    lng:number
    location:string 
    timestamp:number
}

export let users:User[]=[]