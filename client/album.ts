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
      photoItem.id = `fish-${fish.name.replace(/\s+/g, '-')}`; // 添加 ID 用於滾動定位
      photoItem.innerHTML = `
        <img src="${fish.image}" alt="${fish.name}">
        <div class="photo-title">${fish.name}</div>
        <div class="photo-description">${fish.description.replace(/\\n/g, '<br>')}</div>
      `;
      container.appendChild(photoItem);
    });
    
    // 檢查 URL 參數，如果有指定魚類則滾動到該位置
    const urlParams = new URLSearchParams(window.location.search);
    const targetFish = urlParams.get('fish');
    if (targetFish) {
      // 等待 DOM 更新後再滾動
      setTimeout(() => {
        const targetElement = document.getElementById(`fish-${targetFish.replace(/\s+/g, '-')}`);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // 添加高亮效果
          targetElement.style.boxShadow = '0 0 20px #007bff';
          setTimeout(() => {
            targetElement.style.boxShadow = '';
          }, 3000);
        }
      }, 100);
    }
    
  } catch (error) {
    console.error('無法取得魚種資料:', error);
  }
}