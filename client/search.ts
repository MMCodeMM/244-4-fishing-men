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

// 處理圖片搜尋 - 使用 Formidable 上傳
async function handleImageSearch(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  const resultDiv = document.getElementById('searchResult') as HTMLElement;
  
  if (!file) {
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
      <div>正在上傳並分析圖片...</div>
      <div style="margin-top:10px;">檔案名稱: ${file.name}</div>
      <div>檔案大小: ${(file.size / 1024 / 1024).toFixed(2)} MB</div>
    </div>
  `;
  
  try {
    // 創建 FormData 進行文件上傳
    const formData = new FormData();
    formData.append('image', file);
    
    // 上傳圖片到伺服器進行分析
    const uploadResponse = await fetch('/api/search-image', {
      method: 'POST',
      body: formData
    });
    
    const uploadResult = await uploadResponse.json();
    
    if (uploadResult.success) {
      // 生成圖片預覽 URL
      const imageUrl = `/uploads/search-images/${uploadResult.filename}`;
      
      // 顯示 AI 識別結果
      let aiResultHTML = '';
      if (uploadResult.aiEnabled && uploadResult.aiPredictions) {
        aiResultHTML = `
          <div style="margin-top:15px; padding:15px; background-color:#e8f5e9; border-radius:8px; border-left:4px solid #4CAF50;">
            <h4 style="color:#2e7d32; margin:0 0 10px 0;">🤖 AI 識別結果</h4>
            ${uploadResult.aiPredictions.map((pred: any, index: number) => `
              <div style="padding:8px; margin:5px 0; background-color:white; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:${index === 0 ? 'bold' : 'normal'}; color:#2c3e50;">
                  ${index + 1}. ${pred.name} (${pred.nameEn})
                </span>
                <span style="color:#4CAF50; font-weight:bold;">${pred.confidence}%</span>
              </div>
            `).join('')}
          </div>
        `;
      } else {
        aiResultHTML = `
          <div style="margin-top:15px; padding:15px; background-color:#fff3cd; border-radius:8px; border-left:4px solid #ffc107;">
            <p style="color:#856404; margin:0;">⚠️ AI 識別暫時不可用，顯示所有魚種供參考</p>
          </div>
        `;
      }
      
      const imagePreview = `
        <div style="text-align:center; margin:20px; padding:20px; border:2px dashed #4CAF50; border-radius:10px; background-color:#f9f9f9;">
          <h3 style="color:#2c3e50; margin-bottom:15px;">📸 已上傳的圖片</h3>
          <img src="${imageUrl}" alt="Uploaded Image" style="max-width:300px; max-height:300px; border-radius:8px; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
          <div style="margin-top:15px; padding:15px; background-color:white; border-radius:8px; color:#666;">
            <p style="margin:5px 0;"><strong>檔案名稱:</strong> ${file.name}</p>
            <p style="margin:5px 0;"><strong>檔案大小:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
            ${aiResultHTML}
          </div>
        </div>
      `;
      
      // 顯示搜尋結果（AI 匹配的魚種或所有魚種）
      await showSearchResults(imagePreview, uploadResult.searchResults || []);
      
    } else {
      resultDiv.innerHTML = `<div style="color:red;">上傳失敗：${uploadResult.message}</div>`;
    }
    
  } catch (error) {
    console.error('處理圖片時發生錯誤:', error);
    resultDiv.innerHTML = '<div style="color:red;">處理圖片時發生錯誤，請重試。</div>';
  }
}

// 顯示搜尋結果（AI 匹配的魚種或所有魚種）
async function showSearchResults(imagePreview: string, fishList: any[]) {
  const resultDiv = document.getElementById('searchResult') as HTMLElement;
  
  try {
    // 如果沒有提供魚種列表，從 API 獲取所有魚種
    if (!fishList || fishList.length === 0) {
      const res = await fetch('/api/fish');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      fishList = await res.json();
    }
    
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