// 會員資料型別
export type User = {
    id: number;
    username: string;
    collection_fish_ids: number[];
    liked_fish_ids: number[];
    friends_user_ids: number[];
}

// 地圖釣點記錄型別
export type Fish = {
    id: number;
    image: string;
    message: string;
    lat: number;
    lng: number;
    location: string;
    timestamp: number;
}

// 魚種資料型別（用於 fish.json）
export type FishJson = {
    id: number;
    image: string;
    name: string;
    description: string;
}

// 會員資料陣列
export let users: User[] = [];

// 地圖釣點記錄陣列
export let fishRecords: Fish[] = [];

// 魚種資料陣列（由 fish.json 載入）
export let fishs: FishJson[] = [];