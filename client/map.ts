document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理
  
  const mapImg = document.getElementById('map-img') as HTMLImageElement;
  const spotContainer = document.getElementById('spot-container') as HTMLElement;
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
      // 彈窗輸入
      const fish = prompt('請輸入魚名:');
      if (!fish) return;
      const place = prompt('請輸入地點:');
      if (!place) return;
      const time = prompt('請輸入時間:');
      if (!time) return;
      createFlag({x, y, fish, place, time}, true);
    });
  }

  // 初始化
  checkLoginStatus();
  loadUserFlags();
  
  // 監聽登入狀態變化
  window.addEventListener('storage', (e) => {
    if (e.key === 'currentUser') {
      checkLoginStatus();
      // 清空現有標記
      if (spotContainer) {
        spotContainer.innerHTML = '';
      }
      // 重新載入標記
      loadUserFlags();
    }
  });

  function createFlag(
    {x, y, fish, place, time, id}: {x: number, y: number, fish: string, place: string, time: string, id?: number}, 
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
      <div class="flag-info" style="display:none; position:absolute; left:28px; top:0; background:rgba(255,255,255,0.95); padding:6px 12px; border-radius:6px; box-shadow:0 2px 8px #aaa; font-size:14px; min-width:120px; z-index:20; border:1.5px solid rgb(71, 30, 153);">
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
    
    spotContainer.appendChild(flag);
    
    // 設置標記 ID
    let flagId = id;

    // 如果需要儲存到伺服器
    if (saveToServer && currentUser) {
      saveFlagToServer({ x, y, fish, place, time }).then((savedFlagId) => {
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