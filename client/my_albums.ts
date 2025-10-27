// My Album functionality for image upload and management

// Global variable to store uploaded image data
let uploadedImageData: string | null = null;

// 檢查用戶是否已登入並返回用戶資料
function getCurrentUser(): any {
    try {
        const userData = localStorage.getItem('fishing_currentUser');
        return userData ? JSON.parse(userData) : null;
    } catch (error) {
        console.error('檢查登入狀態失敗:', error);
        return null;
    }
}

// 檢查用戶是否已登入
function checkLoginStatus(): boolean {
    return getCurrentUser() !== null;
}

// 檢查是否有來自地圖點擊的待處理標記
function checkPendingMapFromMapClick(): void {
    try {
        const pendingData = localStorage.getItem('pendingMapFlag');
        if (pendingData) {
            const data = JSON.parse(pendingData);
            
            // 檢查是否是從地圖點擊過來的
            if (data.fromMapClick) {
                // 顯示提示訊息
                const message = document.createElement('div');
                message.style.position = 'fixed';
                message.style.top = '20px';
                message.style.left = '50%';
                message.style.transform = 'translateX(-50%)';
                message.style.backgroundColor = '#3498db';
                message.style.color = 'white';
                message.style.padding = '15px 25px';
                message.style.borderRadius = '8px';
                message.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                message.style.zIndex = '9999';
                message.style.fontFamily = 'Arial, sans-serif';
                message.style.fontSize = '16px';
                message.style.textAlign = 'center';
                message.style.maxWidth = '90%';
                message.innerHTML = `
                    <div style="margin-bottom: 10px;">
                        <strong>📍 來自地圖標記</strong>
                    </div>
                    <div style="margin-bottom: 10px;">
                        請選擇一張照片來關聯到地圖位置 (${data.x.toFixed(1)}%, ${data.y.toFixed(1)}%)
                    </div>
                    <div style="font-size: 14px; opacity: 0.9;">
                        點擊任一照片即可完成關聯
                    </div>
                `;
                
                document.body.appendChild(message);
                
                // 5秒後自動隱藏提示
                setTimeout(() => {
                    if (document.body.contains(message)) {
                        document.body.removeChild(message);
                    }
                }, 5000);
                
                console.log('檢測到來自地圖點擊的待處理標記:', data);
            }
        }
    } catch (error) {
        console.error('檢查來自地圖的待處理標記時發生錯誤:', error);
    }
}

// Initialize the album functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // 檢查登入狀態
    if (!checkLoginStatus()) {
        alert('請先登入才能使用我的圖鑑功能！');
        window.location.href = 'register.html';
        return;
    }
    
    initializeAlbum();
    
    // 檢查是否有待處理的刷新需求
    const needRefresh = localStorage.getItem('needAlbumRefresh');
    if (needRefresh === 'true') {
        console.log('檢測到待處理的相冊刷新需求');
        localStorage.removeItem('needAlbumRefresh');
    }
    
    loadUserPhotos(); // 載入用戶已儲存的相片
    
    // 監聽標記刪除事件，自動刷新相冊狀態
    window.addEventListener('storage', function(e) {
        if (e.key === 'flagDeleted' || e.key === 'flagCreated' || e.key === 'needAlbumRefresh') {
            // 延遲一點時間讓服務器操作完成
            setTimeout(() => {
                loadUserPhotos();
                console.log('檢測到標記狀態變更，已刷新相冊狀態');
            }, 1000);
        }
    });
    
    // 當頁面重新獲得焦點時也檢查是否需要刷新
    window.addEventListener('focus', function() {
        // 檢查是否有待處理的刷新請求
        const lastDeleted = localStorage.getItem('flagDeleted');
        const lastCreated = localStorage.getItem('flagCreated');
        const needRefresh = localStorage.getItem('needAlbumRefresh');
        let shouldRefresh = false;
        
        if (lastDeleted) {
            const deleteTime = parseInt(lastDeleted);
            const currentTime = Date.now();
            // 如果刪除時間在5分鐘內，則刷新
            if (currentTime - deleteTime < 5 * 60 * 1000) {
                shouldRefresh = true;
                localStorage.removeItem('flagDeleted');
            }
        }
        
        if (lastCreated) {
            const createTime = parseInt(lastCreated);
            const currentTime = Date.now();
            // 如果創建時間在5分鐘內，則刷新
            if (currentTime - createTime < 5 * 60 * 1000) {
                shouldRefresh = true;
                localStorage.removeItem('flagCreated');
            }
        }
        
        if (needRefresh === 'true') {
            shouldRefresh = true;
            localStorage.removeItem('needAlbumRefresh');
        }
        
        if (shouldRefresh) {
            loadUserPhotos();
            console.log('頁面重新獲得焦點，已刷新相冊狀態');
        }
    });
});

function initializeAlbum(): void {
    // 檢查是否有來自地圖的待處理標記
    checkPendingMapFromMapClick();
    
    // Add image button click handler - 保持現有功能
    const addImageButton = document.getElementById('addImageButton') as HTMLButtonElement;
    if (addImageButton) {
        addImageButton.addEventListener('click', function() {
            const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
            if (imageUpload) {
                imageUpload.click(); // Trigger file selection
            }
        });
    }

    // Image upload change handler - 保存圖片資料供後續使用
    const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
    if (imageUpload) {
        imageUpload.addEventListener('change', function(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e: ProgressEvent<FileReader>) {
                    if (e.target?.result) {
                        uploadedImageData = e.target.result as string; // Save image data
                        console.log('圖片已選擇，準備提交');
                    }
                };
                
                reader.readAsDataURL(file); // Read file as data URL
            }
        });
    }

    // Submit image button click handler - 整合服務器儲存
    const submitImageButton = document.getElementById('submitImageButton') as HTMLButtonElement;
    if (submitImageButton) {
        submitImageButton.addEventListener('click', async function() {
            const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
            const photoGrid = document.getElementById('photoGrid') as HTMLElement;

            if (fileInput.files && fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                
                reader.onload = async function(e: ProgressEvent<FileReader>) {
                    if (!e.target?.result) return;
                    
                    const imageData = e.target.result as string;
                    const currentUser = getCurrentUser();
                    
                    if (!currentUser) {
                        alert('請先登入！');
                        return;
                    }
                    
                    try {
                        // 儲存到服務器
                        const response = await fetch('/api/user-photos', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: currentUser.username,
                                imageData: imageData,
                                location: `上傳於 ${new Date().toLocaleDateString('zh-TW')}`,
                                description: `由 ${currentUser.username} 上傳`
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            // 在頁面上顯示圖片（保持現有HTML結構和CSS）
                            displayPhoto(imageData, `上傳於 ${new Date().toLocaleDateString('zh-TW')}`, new Date().toISOString(), result.photoId);
                            
                            // 清空檔案輸入
                            fileInput.value = '';
                            uploadedImageData = null;
                            
                            alert('相片已成功儲存到您的相冊！');
                        } else {
                            alert('儲存失敗：' + result.message);
                        }
                    } catch (error) {
                        console.error('儲存圖片時發生錯誤:', error);
                        alert('網路錯誤，請稍後再試');
                    }
                };
                
                reader.readAsDataURL(file);
            } else {
                alert('請先選擇一張圖片！');
            }
        });
    }
}

// 顯示相片在網格中（保持現有HTML結構和CSS）
async function displayPhoto(imageData: string, location: string, uploadDate: string, photoId: number): Promise<void> {
    const photoGrid = document.getElementById('photoGrid') as HTMLElement;
    if (!photoGrid) return;
    
    const photoItem = document.createElement('div');
    photoItem.classList.add('photo-item');
    photoItem.dataset.photoId = photoId.toString();

    const img = document.createElement('img');
    img.src = imageData;

    const title = document.createElement('div');
    title.classList.add('photo-title');
    title.textContent = location || '我的相片';

    const description = document.createElement('div');
    description.classList.add('photo-description');
    const date = new Date(uploadDate);
    
    // 檢查照片是否已有對應的地圖標記
    const currentUser = getCurrentUser();
    let hasMapFlag = false;
    
    console.log('當前用戶:', currentUser);
    
    if (currentUser) {
        try {
            console.log(`檢查照片 ${photoId} 的標記狀態...`);
            const response = await fetch(`/api/photo-flag-status/${currentUser.username}/${photoId}`);
            const result = await response.json();
            hasMapFlag = result.success && result.hasFlag;
            console.log(`照片 ${photoId} 標記狀態:`, { success: result.success, hasFlag: result.hasFlag, response: result });
        } catch (error) {
            console.error('檢查照片標記狀態失敗:', error);
        }
    } else {
        console.log('用戶未登入，跳過標記狀態檢查');
    }
    
    // 根據是否已有標記來設置不同的樣式和行為
    if (hasMapFlag) {
        photoItem.classList.add('flagged');
        photoItem.title = '此照片已在地圖上添加標記，無法重複添加';
        description.innerHTML = `上傳時間: ${date.toLocaleDateString('zh-TW')} ${date.toLocaleTimeString('zh-TW')}\n\n🚫 此照片已在地圖上設置標記`;
        
        // 添加視覺提示
        const flagIndicator = document.createElement('div');
        flagIndicator.style.position = 'absolute';
        flagIndicator.style.top = '5px';
        flagIndicator.style.left = '5px';
        flagIndicator.style.backgroundColor = 'rgba(231, 76, 60, 0.9)';
        flagIndicator.style.color = 'white';
        flagIndicator.style.padding = '2px 6px';
        flagIndicator.style.borderRadius = '3px';
        flagIndicator.style.fontSize = '10px';
        flagIndicator.style.fontWeight = 'bold';
        flagIndicator.style.zIndex = '5';
        flagIndicator.textContent = '已標記';
        photoItem.appendChild(flagIndicator);
        
        console.log('照片已設置為已標記狀態，photoId:', photoId);
    } else {
        photoItem.style.cursor = 'pointer';
        photoItem.title = '點擊圖片在地圖上添加標記';
        description.innerHTML = `上傳時間: ${date.toLocaleDateString('zh-TW')} ${date.toLocaleTimeString('zh-TW')}\n\n💡 點擊圖片在地圖上添加標記`;
        
        console.log('照片已設置為可點擊狀態，photoId:', photoId);
    }

    // 圖片點擊事件 - 只有在沒有標記時才允許點擊
    const handlePhotoClick = async function(event: Event) {
        // 防止點擊刪除按鈕時觸發
        if ((event.target as HTMLElement).classList.contains('delete-button')) {
            return;
        }
        
        // 如果已有標記，禁止點擊
        if (hasMapFlag) {
            alert('此照片已在地圖上設置標記，無法重複添加。如需重新設置，請先在地圖中刪除現有標記。');
            return;
        }
        
        const currentUser = getCurrentUser();
        if (!currentUser) {
            alert('請先登入！');
            return;
        }
        
        try {
            // 檢查是否有來自地圖點擊的待處理標記
            const pendingMapData = localStorage.getItem('pendingMapFlag');
            let mapClickData = null;
            
            if (pendingMapData) {
                try {
                    const data = JSON.parse(pendingMapData);
                    if (data.fromMapClick) {
                        mapClickData = data;
                    }
                } catch (e) {
                    console.error('解析待處理地圖資料時出錯:', e);
                }
            }
            
            if (mapClickData) {
                // 來自地圖點擊 - 直接創建標記並關聯照片
                console.log('處理來自地圖點擊的照片選擇:', mapClickData);
                
                // 合併地圖位置和照片資料
                const combinedData = {
                    x: mapClickData.x,
                    y: mapClickData.y,
                    imageData: imageData,
                    location: location,
                    uploadDate: uploadDate,
                    photoId: photoId,
                    fromMapClick: true
                };
                
                // 更新 localStorage 資料
                localStorage.setItem('pendingMapFlag', JSON.stringify(combinedData));
                
                // 跳轉到地圖頁面完成標記創建
                window.location.href = 'map.html?fromMapClick=true';
            } else {
                // 正常的相冊跳轉地圖流程
                const mapFlagData = {
                    imageData: imageData,
                    location: location,
                    uploadDate: uploadDate,
                    photoId: photoId,
                    fromAlbum: true
                };
                
                // 將資料暫存到 localStorage，供地圖頁面使用
                localStorage.setItem('pendingMapFlag', JSON.stringify(mapFlagData));
                
                // 跳轉到地圖頁面
                window.location.href = 'map.html?fromAlbum=true';
            }
            
        } catch (error) {
            console.error('準備跳轉到地圖時發生錯誤:', error);
            alert('跳轉失敗，請稍後再試');
        }
    };
    
    // 為整個相片項目添加點擊事件（除了刪除按鈕）
    photoItem.addEventListener('click', handlePhotoClick);

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.textContent = '×';
    deleteButton.title = '刪除圖片';
    deleteButton.onclick = async function(event) {
        // 阻止事件冒泡，防止觸發相片點擊事件
        event.stopPropagation();
        
        if (confirm('確定要刪除這張相片嗎？')) {
            const currentUser = getCurrentUser();
            if (currentUser) {
                try {
                    const response = await fetch(`/api/user-photos/${currentUser.username}/${photoId}`, {
                        method: 'DELETE'
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        photoGrid.removeChild(photoItem);
                        alert('相片已刪除');
                    } else {
                        alert('刪除失敗：' + result.message);
                    }
                } catch (error) {
                    console.error('刪除相片時發生錯誤:', error);
                    alert('網路錯誤，請稍後再試');
                }
            }
        }
    };

    photoItem.appendChild(img);
    photoItem.appendChild(title);
    photoItem.appendChild(description);
    photoItem.appendChild(deleteButton);
    photoGrid.appendChild(photoItem);
}

// 載入用戶已儲存的相片
async function loadUserPhotos(): Promise<void> {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        console.log('沒有找到當前用戶，無法載入照片');
        return;
    }
    
    try {
        const response = await fetch(`/api/user-photos/${currentUser.username}`);
        const result = await response.json();
        
        if (result.success && result.photos) {
            // 清空現有照片顯示
            const photoGrid = document.getElementById('photoGrid') as HTMLElement;
            if (photoGrid) {
                photoGrid.innerHTML = '';
            }
            
            // 重新載入所有照片
            for (const photo of result.photos) {
                await displayPhoto(photo.imageData, photo.location, photo.uploadDate, photo.id);
            }
            
            if (result.photos.length > 0) {
                console.log(`已載入 ${result.photos.length} 張相片`);
            }
        }
    } catch (error) {
        console.error('載入相片時發生錯誤:', error);
    }
}

// 刷新相冊狀態（當從地圖回到相冊時調用）
async function refreshAlbumStatus(): Promise<void> {
    await loadUserPhotos();
}

// 將刷新函數掛載到全域物件，供其他頁面調用
(window as any).refreshAlbumStatus = refreshAlbumStatus;