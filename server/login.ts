import { Router } from "express";
import {existsSync , readFileSync , writeFileSync} from "fs";

export type userData ={
    user_name: string;
    pass : number;
}
export let userData :
let file = 'userData.json'
if(existsSync(file)){
    let text = readFileSync(file).toString()
    userData = JSON.parse(text)
}