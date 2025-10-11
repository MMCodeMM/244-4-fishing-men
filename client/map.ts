document.addEventListener('DOMContentLoaded', () => {
  // Header 由 index.js 處理
  
  const mapImg = document.getElementById('map-img') as HTMLImageElement;
  const spotContainer = document.getElementById('spot-container') as HTMLElement;
  
  if (mapImg && spotContainer) {
    mapImg.addEventListener('click', function(e: MouseEvent) {
      // 避免右鍵觸發
      if (e.button !== 0) return;
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
      createFlag({x, y, fish, place, time});
    });
  }

  function createFlag({x, y, fish, place, time}: {x: number, y: number, fish: string, place: string, time: string}) {
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
      delBtn.onclick = function(e2: MouseEvent) {
        e2.stopPropagation();
        flag.remove();
      };
      
      // 編輯按鈕
      const editBtn = document.createElement('button');
      editBtn.textContent = '編輯';
      editBtn.onclick = function(e2: MouseEvent) {
        e2.stopPropagation();
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
  }
});