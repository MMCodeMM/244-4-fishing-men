document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理，這裡只處理相簿功能
  displayAllFish();
});

// 直接顯示 API 的所有魚種
async function displayAllFish() {
  try {
    // 使用原有的 API 取得所有魚種
    const res = await fetch('/api/fish');
    const fishList = await res.json();
    
    const container = document.getElementById('photoContainer') as HTMLElement;
    
    if (!container) {
      console.error('找不到 photoContainer 元素');
      return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 顯示所有魚種
    fishList.forEach((fish: any) => {
      const photoItem = document.createElement('div');
      photoItem.className = 'photo-item';
      photoItem.innerHTML = `
        <img src="${fish.image}" alt="${fish.name}">
        <div class="photo-title">${fish.name}</div>
        <div class="photo-description">${fish.description.replace(/\\n/g, '<br>')}</div>
      `;
      container.appendChild(photoItem);
    });
    
    console.log('顯示所有魚種:', fishList);
    
  } catch (error) {
    console.error('無法取得魚種資料:', error);
  }
}