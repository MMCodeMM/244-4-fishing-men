document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理，這裡只處理搜尋功能
  
  // 添加圖片選擇事件監聽器
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.addEventListener('change', handleImageSearch);
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
  
  if (!file) {
    return;
  }
  
  // 顯示載入中
  resultDiv.innerHTML = '<div style="color:blue;">正在分析圖片...</div>';
  
  try {
    // 顯示選中的圖片
    const reader = new FileReader();
    reader.onload = function(e) {
      const imagePreview = `
        <div style="text-align:center; margin:20px;">
          <h3>已選擇的圖片：</h3>
          <img src="${e.target?.result}" alt="Selected Image" style="max-width:300px; border-radius:8px; box-shadow:0 2px 8px #aaa;">
          <div style="margin-top:15px; color:#666;">
            <p>圖片搜尋功能開發中...</p>
            <p>目前顯示所有魚種供參考：</p>
          </div>
        </div>
      `;
      
      // 暫時顯示所有魚種作為搜尋結果
      showAllFishAsSearchResult(imagePreview);
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
    const res = await fetch('/api/fish');
    const fishList = await res.json();
    
    const allFishHTML = fishList.map((fish: any) => `
      <div style="display:inline-block; text-align:center; border:1px solid #ccc; border-radius:8px; padding:16px; margin:10px; box-shadow:0 2px 8px #eee;">
        <img src="${fish.image}" alt="${fish.name}" style="max-width:220px; border-radius:6px; box-shadow:0 2px 8px #aaa;">
        <div style="font-size:20px; font-weight:bold; margin-top:12px;">${fish.name}</div>
        <div style="font-size:15px; color:#555; margin-top:8px;">${fish.description.replace(/\\n/g, '<br>')}</div>
      </div>
    `).join('');
    
    resultDiv.innerHTML = imagePreview + '<div style="display:flex; flex-wrap:wrap; justify-content:center;">' + allFishHTML + '</div>';
    
  } catch (error) {
    console.error('取得魚種資料時發生錯誤:', error);
    resultDiv.innerHTML = imagePreview + '<div style="color:red;">無法載入魚種資料</div>';
  }
}

// Make functions globally available
(window as any).searchByName = searchByName;