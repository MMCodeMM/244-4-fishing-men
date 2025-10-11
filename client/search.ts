document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理，這裡只處理搜尋功能
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

// Make function globally available
(window as any).searchByName = searchByName;