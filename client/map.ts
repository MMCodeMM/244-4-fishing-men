document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理
  
  // 初始化狀態變數（只有在未設置時才初始化）
  if ((window as any).isWaitingForMapClick === undefined) {
    (window as any).isWaitingForMapClick = false;
  }
  if ((window as any).pendingPhotoForMapping === undefined) {
    (window as any).pendingPhotoForMapping = null;
  }
  
  const mapImg = document.getElementById('map-img') as HTMLImageElement;
  const spotContainer = document.getElementById('spot-container') as HTMLElement;
  const flagContainer = document.getElementById('flag-container') as HTMLElement;
  const userInfo = document.getElementById('user-info') as HTMLElement;
  const loginStatus = document.getElementById('login-status') as HTMLElement;

  let currentUser: any = null;

  // 檢查登入狀態
  function checkLoginStatus(): boolean {
    const userData = localStorage.getItem('fishing_currentUser');
    if (userData) {
      currentUser = JSON.parse(userData);
      if (userInfo) {
        userInfo.textContent = `歡迎，${currentUser.username}！您可以在地圖上新增釣點標記。`;
        loginStatus.style.backgroundColor = '#d4edda';
        loginStatus.style.border = '1px solid #c3e6cb';
        loginStatus.style.color = '#155724';
      }
      return true;
    } else {
      currentUser = null;
      if (userInfo) {
        userInfo.textContent = '請先登入才能使用地圖標記功能。';
        loginStatus.style.backgroundColor = '#f8d7da';
        loginStatus.style.border = '1px solid #f5c6cb';
        loginStatus.style.color = '#721c24';
      }
      return false;
    }
  }

  // 載入使用者的地圖標記
  async function loadUserFlags() {
    if (!currentUser) return;
    
    try {
      const response = await fetch(`/api/map-flags/${currentUser.username}`);
      const data = await response.json();
      
      if (data.success && data.flags) {
        console.log(`載入 ${data.flags.length} 個地圖標記`);
        data.flags.forEach((flag: any) => {
          createFlag({
            x: flag.x,
            y: flag.y,
            fish: flag.fish,
            place: flag.place,
            time: flag.time,
            id: flag.id
          }, false); // 不儲存到伺服器，因為已經存在
        });
      }
    } catch (error) {
      console.error('載入地圖標記失敗:', error);
    }
  }

  // 檢查來自相冊的待處理地圖標記
  function checkPendingMapFlag(): void {
    const pendingFlag = localStorage.getItem('pendingMapFlag');
    if (pendingFlag) {
      try {
        const flagData = JSON.parse(pendingFlag);
        
        // 清除暫存資料
        localStorage.removeItem('pendingMapFlag');
        
        // 檢查是否已登入
        if (!checkLoginStatus()) {
          alert('請先登入才能添加地圖標記！');
          return;
        }
        
        if (flagData.fromMapClick) {
          // 來自地圖點擊後選擇照片 - 直接創建標記
          handleMapClickPhotoSelection(flagData);
        } else {
          // 來自相冊的正常流程 - 顯示照片並讓用戶選擇位置
          showAlbumPhotoForMapping(flagData);
        }
        
      } catch (error) {
        console.error('處理待處理標記失敗:', error);
        localStorage.removeItem('pendingMapFlag');
      }
    }
  }
  
  // 顯示來自相冊的照片並等待用戶在地圖上點擊位置
  function showAlbumPhotoForMapping(photoData: any): void {
    // 創建浮動視窗顯示照片資訊
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    const modal = document.createElement('div');
    modal.style.backgroundColor = 'white';
    modal.style.padding = '30px';
    modal.style.borderRadius = '10px';
    modal.style.maxWidth = '500px';
    modal.style.textAlign = 'center';
    modal.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    
    modal.innerHTML = `
      <h3 style="color: #2c3e50; margin-bottom: 20px;">📸 來自相冊的照片</h3>
      <img src="${photoData.imageData}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-bottom: 15px;">
      <p style="margin: 10px 0; color: #34495e;"><strong>位置：</strong>${photoData.location}</p>
      <p style="margin: 10px 0; color: #34495e;"><strong>上傳時間：</strong>${new Date(photoData.uploadDate).toLocaleString('zh-TW')}</p>
      <hr style="margin: 20px 0;">
      <p style="color: #e74c3c; font-weight: bold; margin: 15px 0;">🎯 請在地圖上點擊要添加標記的位置</p>
      <div style="margin-top: 20px;">
        <button id="cancelMapping" style="padding: 10px 20px; margin: 0 10px; background-color: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">確定</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 確定按鈕事件 - 只關閉對話框，保持狀態
    const cancelBtn = modal.querySelector('#cancelMapping') as HTMLButtonElement;
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      // 不清除狀態，保持等待地圖點擊的狀態
      // (window as any).isWaitingForMapClick = false;
      // (window as any).pendingPhotoForMapping = null;
      // restoreUserInfo();
    };
    
    // 臨時儲存照片資料供地圖點擊使用
    (window as any).pendingPhotoForMapping = photoData;
    
    // 修改地圖點擊行為以處理來自相冊的照片
    (window as any).isWaitingForMapClick = true;
    
    console.log('設置場景一狀態:', {
      isWaitingForMapClick: (window as any).isWaitingForMapClick,
      pendingPhotoForMapping: (window as any).pendingPhotoForMapping
    });
    
    // 更新用戶提示
    if (userInfo) {
      const originalText = userInfo.textContent;
      userInfo.style.backgroundColor = '#fff3cd';
      userInfo.style.color = '#856404';
      userInfo.textContent = '🎯 請在地圖上點擊要添加標記的位置，或取消操作';
      
      // 儲存原始樣式以便恢復
      (window as any).originalUserInfoStyle = {
        text: originalText,
        backgroundColor: loginStatus.style.backgroundColor,
        color: loginStatus.style.color
      };
    }
  }
  
  // 處理來自地圖點擊後選擇照片的情況
  function handleMapClickPhotoSelection(flagData: any): void {
    console.log('處理來自地圖點擊的照片選擇:', flagData);
    
    // 使用照片資訊和預設的地圖位置創建標記
    const fish = `照片標記 - ${flagData.location}`;
    const place = flagData.location;
    const time = new Date(flagData.uploadDate).toLocaleDateString('zh-TW');
    
    // 直接在指定位置創建標記
    createFlag({
      x: flagData.x, 
      y: flagData.y, 
      fish, 
      place, 
      time, 
      photoId: flagData.photoId
    }, true);
    
    // 顯示成功訊息
    alert('📸 已成功將選擇的照片添加為地圖標記！');
    
    // 通知其他頁面標記已創建，需要刷新狀態
    localStorage.setItem('flagCreated', Date.now().toString());
    
    // 設置延遲標記，確保相冊頁面能檢測到
    localStorage.setItem('needAlbumRefresh', 'true');
    
    // 設置標記後重新載入頁面
    setTimeout(() => {
      window.location.reload();
    }, 1000); // 等待1秒讓標記保存完成
  }

  // 恢復用戶資訊顯示
  function restoreUserInfo(): void {
    const originalStyle = (window as any).originalUserInfoStyle;
    if (originalStyle && userInfo) {
      userInfo.textContent = originalStyle.text;
      loginStatus.style.backgroundColor = originalStyle.backgroundColor;
      loginStatus.style.color = originalStyle.color;
    }
  }

  // 顯示創建標記確認對話框
  function showCreateFlagConfirmDialog(x: number, y: number): void {
    // 創建覆蓋層
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '1000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    // 創建對話框
    const dialog = document.createElement('div');
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '30px';
    dialog.style.borderRadius = '10px';
    dialog.style.maxWidth = '400px';
    dialog.style.textAlign = 'center';
    dialog.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    
    dialog.innerHTML = `
      <h3 style="color: #2c3e50; margin-bottom: 20px;">🎯 您想要在此位置創建標記嗎？</h3>
      <p style="margin: 15px 0; color: #34495e;">點擊「確定」將跳轉到相冊選擇照片</p>
      <div style="margin: 20px 0;">
        <button id="confirmCreate" style="padding: 12px 25px; margin: 0 10px; background-color: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">確定</button>
        <button id="cancelCreate" style="padding: 12px 25px; margin: 0 10px; background-color: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">取消</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // 確定按鈕
    const confirmBtn = dialog.querySelector('#confirmCreate') as HTMLButtonElement;
    confirmBtn.onclick = () => {
      document.body.removeChild(overlay);
      // 跳轉到相冊選擇照片
      localStorage.setItem('pendingMapFlag', JSON.stringify({
        x: x,
        y: y,
        fromMapClick: true, // 標識這是從地圖點擊過來的
        timestamp: Date.now()
      }));
      
      // 跳轉到相冊頁面
      window.location.href = '/my_album.html';
    };
    
    // 取消按鈕
    const cancelBtn = dialog.querySelector('#cancelCreate') as HTMLButtonElement;
    cancelBtn.onclick = () => {
      document.body.removeChild(overlay);
      // 什麼都不做，直接關閉對話框
    };
  }

  // 儲存標記到伺服器
  async function saveFlagToServer(flagData: any): Promise<number | false> {
    if (!currentUser) return false;
    
    try {
      const response = await fetch('/api/map-flags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser.username,
          ...flagData
        })
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('標記儲存成功:', result);
        return result.flagId;
      } else {
        console.error('儲存失敗:', result.message);
        alert('儲存失敗: ' + result.message);
        return false;
      }
    } catch (error) {
      console.error('網路錯誤:', error);
      alert('網路錯誤，請稍後再試');
      return false;
    }
  }

  // 從伺服器刪除標記
  async function deleteFlagFromServer(flagId: number): Promise<boolean> {
    if (!currentUser) return false;
    
    try {
      const response = await fetch(`/api/map-flags/${currentUser.username}/${flagId}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      if (result.success) {
        console.log('標記刪除成功');
        return true;
      } else {
        console.error('刪除失敗:', result.message);
        return false;
      }
    } catch (error) {
      console.error('網路錯誤:', error);
      return false;
    }
  }
  
  if (mapImg && spotContainer) {
    mapImg.addEventListener('click', function(e: MouseEvent) {
      // 避免右鍵觸發
      if (e.button !== 0) return;
      
      // 檢查登入狀態
      if (!checkLoginStatus()) {
        alert('請先登入才能新增釣點標記！請前往登入頁面進行登入。');
        return;
      }
      
      const rect = mapImg.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // 檢查是否是來自相冊的照片添加標記
      console.log('地圖點擊檢查狀態:', {
        isWaitingForMapClick: (window as any).isWaitingForMapClick,
        pendingPhotoForMapping: (window as any).pendingPhotoForMapping
      });
      
      if ((window as any).isWaitingForMapClick && (window as any).pendingPhotoForMapping) {
        console.log('場景一：來自相冊，直接創建標記');
        const photoData = (window as any).pendingPhotoForMapping;
        
        // 使用照片資訊創建標記
        const fish = `照片標記 - ${photoData.location}`;
        const place = photoData.location;
        const time = new Date(photoData.uploadDate).toLocaleDateString('zh-TW');
        
        // 創建標記並儲存，包含照片ID關聯
        createFlag({x, y, fish, place, time, photoId: photoData.photoId}, true);
        
        // 清理狀態
        (window as any).isWaitingForMapClick = false;
        (window as any).pendingPhotoForMapping = null;
        
        // 移除浮動視窗
        const overlay = document.querySelector('div[style*="position: fixed"][style*="z-index: 1000"]');
        if (overlay) {
          document.body.removeChild(overlay);
        }
        
        // 恢復用戶資訊顯示
        restoreUserInfo();
        
        // 通知其他頁面標記已創建，需要刷新狀態
        localStorage.setItem('flagCreated', Date.now().toString());
        
        // 設置延遲標記，確保相冊頁面能檢測到
        localStorage.setItem('needAlbumRefresh', 'true');
        
        // 顯示成功訊息
        alert('📸 已成功將相冊照片添加為地圖標記！');
        
        // 設置標記後重新載入頁面
        setTimeout(() => {
          window.location.reload();
        }, 1000); // 等待1秒讓標記保存完成
        return;
      }
      
      // 一般的地圖點擊處理 - 顯示確認對話框
      console.log('場景二：地圖點擊，顯示確認對話框');
      showCreateFlagConfirmDialog(x, y);
    });
  }

  // 載入固定的魚類資訊展示點
  async function loadFishInfoSpots() {
    try {
      const response = await fetch('/api/fish');
      const fishList = await response.json();
      
      // 為 12 種魚類預設的地圖位置（百分比）
      const fishSpots = [
        { x: 15, y: 20 },   // 九肚魚
        { x: 85, y: 25 },   // 木棉
        { x: 35, y: 15 },   // 白飯魚
        { x: 65, y: 30 },   // 白鱲
        { x: 25, y: 40 },   // 芝麻班
        { x: 75, y: 45 },   // 紅衫
        { x: 45, y: 35 },   // 烏頭
        { x: 55, y: 60 },   // 馬頭
        { x: 20, y: 70 },   // 黃鱲鯧
        { x: 70, y: 75 },   // 鯉魚
        { x: 40, y: 80 },   // 鯇魚
        { x: 80, y: 55 }    // 鯧魚
      ];
      
      fishList.forEach((fish: any, index: number) => {
        if (index < fishSpots.length) {
          const spot = fishSpots[index];
          createFishInfoSpot(spot.x, spot.y, fish);
        }
      });
      
    } catch (error) {
      console.error('載入魚類資訊點失敗:', error);
    }
  }

  // 創建魚類資訊展示點（供訪客查看）
  function createFishInfoSpot(x: number, y: number, fish: any) {
    const spot = document.createElement('div');
    spot.style.position = 'absolute';
    spot.style.left = x + '%';
    spot.style.top = y + '%';
    spot.style.transform = 'translate(-50%, -100%)';
    spot.style.cursor = 'pointer';
    spot.style.pointerEvents = 'auto';
    spot.style.zIndex = '10';
    
    // 魚類資訊點的外觀（與用戶標記區別開）
    spot.innerHTML = `
      <div style="
        width: 20px; 
        height: 20px; 
        background: linear-gradient(45deg, #28a745, #20c997); 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 8px rgba(40, 167, 69, 0.4);
        position: relative;
      ">
        <div style="
          position: absolute;
          top: -2px;
          left: -2px;
          width: 20px;
          height: 20px;
          border: 2px solid #28a745;
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
      </div>
    `;
    
    // 魚類資訊展示
    const tooltip = document.createElement('div');
    tooltip.className = 'flag-info';
    tooltip.style.position = 'absolute';
    tooltip.style.bottom = '25px';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.background = 'white';
    tooltip.style.padding = '10px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    tooltip.style.minWidth = '120px';
    tooltip.style.display = 'none';
    tooltip.style.zIndex = '15';
    
    tooltip.innerHTML = `
      <div style="text-align: center;">
        <img src="${fish.image}" alt="${fish.name}" style="width: 80px; height: 60px; object-fit: contain; margin-bottom: 8px;">
        <div style="font-weight: bold; color: #28a745; margin-bottom: 8px;">${fish.name}</div>
        <div style="font-size: 0.8em; color: #999;">點擊查看詳細介紹</div>
      </div>
    `;
    
    spot.appendChild(tooltip);
    
    // 懸停顯示資訊
    spot.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
    });
    
    spot.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
    
    // 點擊跳轉到相冊查看該魚類
    spot.addEventListener('click', () => {
      window.location.href = `album.html?fish=${encodeURIComponent(fish.name)}`;
    });
    
    if (spotContainer) {
      spotContainer.appendChild(spot);
    }
  }

  // 初始化
  checkLoginStatus();
  loadFishInfoSpots(); // 先載入魚類資訊展示點（背景層）
  loadUserFlags();     // 後載入用戶標記（前景層）
  
  // 檢查來自相冊的待處理標記
  checkPendingMapFlag();
  
  // 監聽登入狀態變化
  window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser') {
      checkLoginStatus();
      // 清空現有標記
      if (flagContainer) {
        flagContainer.innerHTML = '';
      }
      // 重新載入標記
      loadUserFlags();
    }
  });

  function createFlag(
    {x, y, fish, place, time, id, photoId}: {x: number, y: number, fish: string, place: string, time: string, id?: number, photoId?: number}, 
    saveToServer: boolean = true
  ) {
    const flag = document.createElement('div');
    flag.style.position = 'absolute';
    flag.style.left = x + '%';
    flag.style.top = y + '%';
    flag.style.transform = 'translate(-50%, -100%)';
    flag.style.cursor = 'pointer';
    flag.style.pointerEvents = 'auto';
    
    function wrapPlaceText(text: string) {
      // 中文字正則
      const isChinese = (c: string) => /[\u4e00-\u9fa5]/.test(c);
      let lines: string[] = [];
      let line = '';
      let count = 0;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (isChinese(c)) {
          count += 1;
          if (count > 10) {
            lines.push(line);
            line = '';
            count = 1;
          }
        } else {
          count += 1;
          if (count > 25) {
            lines.push(line);
            line = '';
            count = 1;
          }
        }
        line += c;
      }
      if (line) lines.push(line);
      return lines.join('<br>');
    }
    
    flag.innerHTML = `
      <svg width="24" height="32" viewBox="0 0 24 32" style="vertical-align:bottom;">
        <polygon points="2,2 20,8 2,14" fill="#e74c3c" stroke="#c0392b" stroke-width="2"/>
        <rect x="2" y="2" width="2" height="28" fill="#555"/>
      </svg>
      <div class="flag-info" style="display:none; position:absolute; left:28px; top:0; background:rgba(255,255,255,0.95); padding:6px 12px; border-radius:6px; box-shadow:0 2px 8px #aaa; font-size:14px; min-width:120px; z-index:100; border:1.5px solid rgb(71, 30, 153);">
        <div><b>魚名：</b><span class="fish-name">${fish}</span></div>
        <div><b>地點：</b><span class="fish-place">${wrapPlaceText(place)}</span></div>
        <div><b>時間：</b><span class="fish-time">${time}</span></div>
      </div>
    `;
    
    // 滑鼠懸停顯示資訊
    flag.addEventListener('mouseenter', function() {
      const info = flag.querySelector('.flag-info') as HTMLElement;
      if (info) info.style.display = 'block';
    });
    flag.addEventListener('mouseleave', function() {
      const info = flag.querySelector('.flag-info') as HTMLElement;
      if (info) info.style.display = 'none';
    });
    
    // 右鍵顯示選單
    flag.addEventListener('contextmenu', function(ev: MouseEvent) {
      ev.preventDefault();
      // 若已存在選單則不重複加
      if (flag.querySelector('.flag-menu')) return;
      const menu = document.createElement('div');
      menu.className = 'flag-menu';
      menu.style.position = 'absolute';
      menu.style.right = '28px';
      menu.style.top = '60px';
      
      // 刪除按鈕
      const delBtn = document.createElement('button');
      delBtn.textContent = '刪除';
      delBtn.onclick = async function(e2: MouseEvent) {
        e2.stopPropagation();
        
        // 檢查登入狀態
        if (!checkLoginStatus()) {
          alert('請先登入才能刪除標記！');
          return;
        }
        
        if (confirm('確定要刪除這個釣點標記嗎？')) {
          if (id && await deleteFlagFromServer(id)) {
            flag.remove();
            alert('標記已刪除並同步到您的會員資料');
            
            // 通知其他頁面標記已刪除，需要刷新狀態
            localStorage.setItem('flagDeleted', Date.now().toString());
            
          } else if (!id) {
            flag.remove(); // 如果沒有 ID（本地標記），直接刪除
          } else {
            alert('刪除失敗，請稍後再試');
          }
        }
      };
      
      // 編輯按鈕
      const editBtn = document.createElement('button');
      editBtn.textContent = '編輯';
      editBtn.onclick = function(e2: MouseEvent) {
        e2.stopPropagation();
        
        // 檢查登入狀態
        if (!checkLoginStatus()) {
          alert('請先登入才能編輯標記！');
          return;
        }
        
        // 取得現有值
        const fishSpan = flag.querySelector('.fish-name') as HTMLElement;
        const placeSpan = flag.querySelector('.fish-place') as HTMLElement;
        const timeSpan = flag.querySelector('.fish-time') as HTMLElement;
        const newFish = prompt('請輸入魚名:', fishSpan.textContent || '');
        if (!newFish) return;
        // 取得原始地點內容（去除換行）
        const oldPlace = placeSpan.innerText.replace(/\n/g, '');
        const newPlace = prompt('請輸入地點:', oldPlace);
        if (!newPlace) return;
        const newTime = prompt('請輸入時間:', timeSpan.textContent || '');
        if (!newTime) return;
        fishSpan.textContent = newFish;
        placeSpan.innerHTML = wrapPlaceText(newPlace);
        timeSpan.textContent = newTime;
        
        // 提示用戶編輯功能
        alert('標記已更新！\n注意：編輯功能目前只在本地生效，伺服器同步功能將在未來版本中實作。');
      };
      
      menu.appendChild(editBtn);
      menu.appendChild(delBtn);
      
      // 點擊其他地方自動移除選單
      document.addEventListener('click', function docClick(ev2: MouseEvent) {
        if (!menu.contains(ev2.target as Node)) {
          menu.remove();
          document.removeEventListener('click', docClick);
        }
      });
      flag.appendChild(menu);
    });
    
    if (flagContainer) {
      flagContainer.appendChild(flag);
    }
    
    // 設置標記 ID
    let flagId = id;

    // 如果需要儲存到伺服器
    if (saveToServer && currentUser) {
      saveFlagToServer({ x, y, fish, place, time, photoId }).then((savedFlagId) => {
        if (savedFlagId) {
          flagId = savedFlagId;
          console.log('標記已儲存到會員資料，ID:', flagId);
          // 顯示成功訊息
          const successMsg = document.createElement('div');
          successMsg.style.position = 'fixed';
          successMsg.style.top = '20px';
          successMsg.style.right = '20px';
          successMsg.style.backgroundColor = '#d4edda';
          successMsg.style.border = '1px solid #c3e6cb';
          successMsg.style.color = '#155724';
          successMsg.style.padding = '10px 15px';
          successMsg.style.borderRadius = '5px';
          successMsg.style.zIndex = '1000';
          successMsg.textContent = '釣點標記已儲存到您的會員資料！';
          document.body.appendChild(successMsg);
          
          // 3秒後自動移除訊息
          setTimeout(() => {
            if (successMsg.parentNode) {
              successMsg.parentNode.removeChild(successMsg);
            }
          }, 3000);
        }
      });
    }
  }
});