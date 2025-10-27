document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理，這裡只處理搜尋功能
  
  // 添加圖片選擇事件監聽器
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  const cameraInput = document.getElementById('cameraInput') as HTMLInputElement;
  
  if (fileInput) {
    fileInput.addEventListener('change', handleImageSearch);
  }
  
  if (cameraInput) {
    cameraInput.addEventListener('change', handleImageSearch);
  }
});

async function searchByName() {
  const name = (document.getElementById('searchNameInput') as HTMLInputElement).value.trim();
  const resultDiv = document.getElementById('searchResult') as HTMLElement;
  resultDiv.innerHTML = '';
  
  if (!name) {
    alert('請輸入名稱');
    return;
  }
  
  // 從後端取得所有魚種
  const res = await fetch('/api/fish');
  const fishList = await res.json();
  
  // 模糊搜尋（部分關鍵字，不分大小寫）
  const foundList = fishList.filter((f: any) => f.name.toLowerCase().includes(name.toLowerCase()));
  
  if (foundList.length === 0) {
    resultDiv.innerHTML = '<div style="color:red;">查無此魚種</div>';
    return;
  }
  
  resultDiv.innerHTML = foundList.map((found: any) => `
    <div style="display:inline-block; text-align:center; border:1px solid #ccc; border-radius:8px; padding:16px; margin:10px; box-shadow:0 2px 8px #eee;">
      <img src="${found.image}" alt="${found.name}" style="max-width:220px; border-radius:6px; box-shadow:0 2px 8px #aaa;">
      <div style="font-size:20px; font-weight:bold; margin-top:12px;">${found.name}</div>
      <div style="font-size:15px; color:#555; margin-top:8px;">${found.description.replace(/\\n/g, '<br>')}</div>
    </div>
  `).join('');
}

// 處理圖片搜尋
async function handleImageSearch(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const resultDiv = document.getElementById('searchResult') as HTMLElement;
  
  console.log('handleImageSearch called', file); // 調試資訊
  
  if (!file) {
    console.log('No file selected');
    return;
  }
  
  // 檢查檔案類型
  if (!file.type.startsWith('image/')) {
    resultDiv.innerHTML = '<div style="color:red;">請選擇圖片檔案</div>';
    return;
  }
  
  // 顯示載入中
  resultDiv.innerHTML = `
    <div style="color:blue; text-align:center; padding:20px;">
      <div>正在處理圖片...</div>
      <div style="margin-top:10px;">檔案名稱: ${file.name}</div>
      <div>檔案大小: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
    </div>
  `;
  
  try {
    // 顯示選中的圖片
    const reader = new FileReader();
    reader.onload = function(e) {
      console.log('Image loaded successfully'); // 調試資訊
      
      const imagePreview = `
        <div style="text-align:center; margin:20px; padding:20px; border:2px dashed #4CAF50; border-radius:10px; background-color:#f9f9f9;">
          <h3 style="color:#2c3e50; margin-bottom:15px;">📸 已選擇的圖片</h3>
          <img src="${e.target?.result}" alt="Selected Image" style="max-width:300px; max-height:300px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
          <div style="margin-top:15px; padding:15px; background-color:white; border-radius:8px; color:#666;">
            <p style="margin:5px 0;"><strong>檔案名稱:</strong> ${file.name}</p>
            <p style="margin:5px 0;"><strong>檔案大小:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            <hr style="margin:15px 0;">
            <p style="color:#e67e22; font-weight:bold;">🔍 智能圖片識別功能開發中...</p>
            <p style="color:#27ae60;">目前顯示所有魚種供您參考比對：</p>
          </div>
        </div>
      `;
      
      // 暫時顯示所有魚種作為搜尋結果
      showAllFishAsSearchResult(imagePreview);
    };
    
    reader.onerror = function() {
      console.error('FileReader error');
      resultDiv.innerHTML = '<div style="color:red;">讀取圖片失敗，請重試</div>';
    };
    
    reader.readAsDataURL(file);
    
  } catch (error) {
    console.error('處理圖片時發生錯誤:', error);
    resultDiv.innerHTML = '<div style="color:red;">處理圖片時發生錯誤，請重試。</div>';
  }
}

// 暫時顯示所有魚種作為搜尋結果
async function showAllFishAsSearchResult(imagePreview: string) {
  const resultDiv = document.getElementById('searchResult') as HTMLElement;
  
  try {
    console.log('Fetching fish data...'); // 調試資訊
    const res = await fetch('/api/fish');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const fishList = await res.json();
    console.log('Fish data loaded:', fishList.length, 'species'); // 調試資訊
    
    const allFishHTML = fishList.map((fish: any, index: number) => `
      <div style="display:inline-block; text-align:center; border:2px solid #3498db; border-radius:12px; padding:20px; margin:15px; box-shadow:0 4px 15px rgba(52, 152, 219, 0.2); background-color:white; max-width:280px; cursor:pointer; transition:all 0.3s ease;" 
           onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 25px rgba(52, 152, 219, 0.4)';"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(52, 152, 219, 0.2)';"
           onclick="window.location.href='fish_detail.html?id=${fish.id}'">
        <div style="background-color:#f8f9fa; padding:10px; border-radius:8px; margin-bottom:15px;">
          <img src="${fish.image}" alt="${fish.name}" style="max-width:100%; max-height:200px; object-fit:contain; border-radius:6px;">
        </div>
        <div style="font-size:18px; font-weight:bold; margin:10px 0; color:#2c3e50; line-height:1.3;">${fish.name}</div>
        <div style="font-size:13px; color:#7f8c8d; background-color:#ecf0f1; padding:10px; border-radius:6px; line-height:1.4; max-height:100px; overflow:hidden; position:relative;">
          ${fish.description.replace(/\\n/g, '<br>').substring(0, 120)}${fish.description.length > 120 ? '...' : ''}
        </div>
        <div style="margin-top:10px; font-size:12px; color:#3498db; font-weight:bold;">點擊查看詳細資料 →</div>
      </div>
    `).join('');
    
    const fishResultsHTML = `
      <div style="margin-top:30px; padding:20px; background-color:#f8f9fa; border-radius:10px;">
        <h2 style="text-align:center; color:#2c3e50; margin-bottom:20px;">🐟 魚種圖鑑 (共 ${fishList.length} 種)</h2>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:10px;">
          ${allFishHTML}
        </div>
      </div>
    `;
    
    resultDiv.innerHTML = imagePreview + fishResultsHTML;
    
  } catch (error) {
    console.error('取得魚種資料時發生錯誤:', error);
    const errorMessage = error instanceof Error ? error.message : '未知錯誤';
    resultDiv.innerHTML = imagePreview + `
      <div style="color:red; text-align:center; padding:20px; border:2px solid #e74c3c; border-radius:8px; background-color:#ffeaea; margin:20px;">
        <h3>❌ 無法載入魚種資料</h3>
        <p>錯誤訊息: ${errorMessage}</p>
        <p>請檢查網路連線或重新整理頁面</p>
      </div>
    `;
  }
}

// Make functions globally available
(window as any).searchByName = searchByName;