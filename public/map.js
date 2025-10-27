"use strict";
(() => {
  // client/map.ts
  document.addEventListener("DOMContentLoaded", () => {
    if (window.isWaitingForMapClick === void 0) {
      window.isWaitingForMapClick = false;
    }
    if (window.pendingPhotoForMapping === void 0) {
      window.pendingPhotoForMapping = null;
    }
    const mapImg = document.getElementById("map-img");
    const spotContainer = document.getElementById("spot-container");
    const userInfo = document.getElementById("user-info");
    const loginStatus = document.getElementById("login-status");
    let currentUser = null;
    function checkLoginStatus() {
      const userData = localStorage.getItem("fishing_currentUser");
      if (userData) {
        currentUser = JSON.parse(userData);
        if (userInfo) {
          userInfo.textContent = `\u6B61\u8FCE\uFF0C${currentUser.username}\uFF01\u60A8\u53EF\u4EE5\u5728\u5730\u5716\u4E0A\u65B0\u589E\u91E3\u9EDE\u6A19\u8A18\u3002`;
          loginStatus.style.backgroundColor = "#d4edda";
          loginStatus.style.border = "1px solid #c3e6cb";
          loginStatus.style.color = "#155724";
        }
        return true;
      } else {
        currentUser = null;
        if (userInfo) {
          userInfo.textContent = "\u8ACB\u5148\u767B\u5165\u624D\u80FD\u4F7F\u7528\u5730\u5716\u6A19\u8A18\u529F\u80FD\u3002";
          loginStatus.style.backgroundColor = "#f8d7da";
          loginStatus.style.border = "1px solid #f5c6cb";
          loginStatus.style.color = "#721c24";
        }
        return false;
      }
    }
    async function loadUserFlags() {
      if (!currentUser) return;
      try {
        const response = await fetch(`/api/map-flags/${currentUser.username}`);
        const data = await response.json();
        if (data.success && data.flags) {
          console.log(`\u8F09\u5165 ${data.flags.length} \u500B\u5730\u5716\u6A19\u8A18`);
          data.flags.forEach((flag) => {
            createFlag({
              x: flag.x,
              y: flag.y,
              fish: flag.fish,
              place: flag.place,
              time: flag.time,
              id: flag.id
            }, false);
          });
        }
      } catch (error) {
        console.error("\u8F09\u5165\u5730\u5716\u6A19\u8A18\u5931\u6557:", error);
      }
    }
    function checkPendingMapFlag() {
      const pendingFlag = localStorage.getItem("pendingMapFlag");
      if (pendingFlag) {
        try {
          const flagData = JSON.parse(pendingFlag);
          localStorage.removeItem("pendingMapFlag");
          if (!checkLoginStatus()) {
            alert("\u8ACB\u5148\u767B\u5165\u624D\u80FD\u6DFB\u52A0\u5730\u5716\u6A19\u8A18\uFF01");
            return;
          }
          if (flagData.fromMapClick) {
            handleMapClickPhotoSelection(flagData);
          } else {
            showAlbumPhotoForMapping(flagData);
          }
        } catch (error) {
          console.error("\u8655\u7406\u5F85\u8655\u7406\u6A19\u8A18\u5931\u6557:", error);
          localStorage.removeItem("pendingMapFlag");
        }
      }
    }
    function showAlbumPhotoForMapping(photoData) {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      overlay.style.zIndex = "1000";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      const modal = document.createElement("div");
      modal.style.backgroundColor = "white";
      modal.style.padding = "30px";
      modal.style.borderRadius = "10px";
      modal.style.maxWidth = "500px";
      modal.style.textAlign = "center";
      modal.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
      modal.innerHTML = `
      <h3 style="color: #2c3e50; margin-bottom: 20px;">\u{1F4F8} \u4F86\u81EA\u76F8\u518A\u7684\u7167\u7247</h3>
      <img src="${photoData.imageData}" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-bottom: 15px;">
      <p style="margin: 10px 0; color: #34495e;"><strong>\u4F4D\u7F6E\uFF1A</strong>${photoData.location}</p>
      <p style="margin: 10px 0; color: #34495e;"><strong>\u4E0A\u50B3\u6642\u9593\uFF1A</strong>${new Date(photoData.uploadDate).toLocaleString("zh-TW")}</p>
      <hr style="margin: 20px 0;">
      <p style="color: #e74c3c; font-weight: bold; margin: 15px 0;">\u{1F3AF} \u8ACB\u5728\u5730\u5716\u4E0A\u9EDE\u64CA\u8981\u6DFB\u52A0\u6A19\u8A18\u7684\u4F4D\u7F6E</p>
      <div style="margin-top: 20px;">
        <button id="cancelMapping" style="padding: 10px 20px; margin: 0 10px; background-color: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer;">\u78BA\u5B9A</button>
      </div>
    `;
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      const cancelBtn = modal.querySelector("#cancelMapping");
      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
      };
      window.pendingPhotoForMapping = photoData;
      window.isWaitingForMapClick = true;
      console.log("\u8A2D\u7F6E\u5834\u666F\u4E00\u72C0\u614B:", {
        isWaitingForMapClick: window.isWaitingForMapClick,
        pendingPhotoForMapping: window.pendingPhotoForMapping
      });
      if (userInfo) {
        const originalText = userInfo.textContent;
        userInfo.style.backgroundColor = "#fff3cd";
        userInfo.style.color = "#856404";
        userInfo.textContent = "\u{1F3AF} \u8ACB\u5728\u5730\u5716\u4E0A\u9EDE\u64CA\u8981\u6DFB\u52A0\u6A19\u8A18\u7684\u4F4D\u7F6E\uFF0C\u6216\u53D6\u6D88\u64CD\u4F5C";
        window.originalUserInfoStyle = {
          text: originalText,
          backgroundColor: loginStatus.style.backgroundColor,
          color: loginStatus.style.color
        };
      }
    }
    function handleMapClickPhotoSelection(flagData) {
      console.log("\u8655\u7406\u4F86\u81EA\u5730\u5716\u9EDE\u64CA\u7684\u7167\u7247\u9078\u64C7:", flagData);
      const fish = `\u7167\u7247\u6A19\u8A18 - ${flagData.location}`;
      const place = flagData.location;
      const time = new Date(flagData.uploadDate).toLocaleDateString("zh-TW");
      createFlag({
        x: flagData.x,
        y: flagData.y,
        fish,
        place,
        time,
        photoId: flagData.photoId
      }, true);
      alert("\u{1F4F8} \u5DF2\u6210\u529F\u5C07\u9078\u64C7\u7684\u7167\u7247\u6DFB\u52A0\u70BA\u5730\u5716\u6A19\u8A18\uFF01");
      localStorage.setItem("flagCreated", Date.now().toString());
      localStorage.setItem("needAlbumRefresh", "true");
      setTimeout(() => {
        window.location.reload();
      }, 1e3);
    }
    function restoreUserInfo() {
      const originalStyle = window.originalUserInfoStyle;
      if (originalStyle && userInfo) {
        userInfo.textContent = originalStyle.text;
        loginStatus.style.backgroundColor = originalStyle.backgroundColor;
        loginStatus.style.color = originalStyle.color;
      }
    }
    function showCreateFlagConfirmDialog(x, y) {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "1000";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      const dialog = document.createElement("div");
      dialog.style.backgroundColor = "white";
      dialog.style.padding = "30px";
      dialog.style.borderRadius = "10px";
      dialog.style.maxWidth = "400px";
      dialog.style.textAlign = "center";
      dialog.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
      dialog.innerHTML = `
      <h3 style="color: #2c3e50; margin-bottom: 20px;">\u{1F3AF} \u60A8\u60F3\u8981\u5728\u6B64\u4F4D\u7F6E\u5275\u5EFA\u6A19\u8A18\u55CE\uFF1F</h3>
      <p style="margin: 15px 0; color: #34495e;">\u9EDE\u64CA\u300C\u78BA\u5B9A\u300D\u5C07\u8DF3\u8F49\u5230\u76F8\u518A\u9078\u64C7\u7167\u7247</p>
      <div style="margin: 20px 0;">
        <button id="confirmCreate" style="padding: 12px 25px; margin: 0 10px; background-color: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">\u78BA\u5B9A</button>
        <button id="cancelCreate" style="padding: 12px 25px; margin: 0 10px; background-color: #95a5a6; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">\u53D6\u6D88</button>
      </div>
    `;
      overlay.appendChild(dialog);
      document.body.appendChild(overlay);
      const confirmBtn = dialog.querySelector("#confirmCreate");
      confirmBtn.onclick = () => {
        document.body.removeChild(overlay);
        localStorage.setItem("pendingMapFlag", JSON.stringify({
          x,
          y,
          fromMapClick: true,
          // 標識這是從地圖點擊過來的
          timestamp: Date.now()
        }));
        window.location.href = "/my_album.html";
      };
      const cancelBtn = dialog.querySelector("#cancelCreate");
      cancelBtn.onclick = () => {
        document.body.removeChild(overlay);
      };
    }
    async function saveFlagToServer(flagData) {
      if (!currentUser) return false;
      try {
        const response = await fetch("/api/map-flags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: currentUser.username,
            ...flagData
          })
        });
        const result = await response.json();
        if (result.success) {
          console.log("\u6A19\u8A18\u5132\u5B58\u6210\u529F:", result);
          return result.flagId;
        } else {
          console.error("\u5132\u5B58\u5931\u6557:", result.message);
          alert("\u5132\u5B58\u5931\u6557: " + result.message);
          return false;
        }
      } catch (error) {
        console.error("\u7DB2\u8DEF\u932F\u8AA4:", error);
        alert("\u7DB2\u8DEF\u932F\u8AA4\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66");
        return false;
      }
    }
    async function deleteFlagFromServer(flagId) {
      if (!currentUser) return false;
      try {
        const response = await fetch(`/api/map-flags/${currentUser.username}/${flagId}`, {
          method: "DELETE"
        });
        const result = await response.json();
        if (result.success) {
          console.log("\u6A19\u8A18\u522A\u9664\u6210\u529F");
          return true;
        } else {
          console.error("\u522A\u9664\u5931\u6557:", result.message);
          return false;
        }
      } catch (error) {
        console.error("\u7DB2\u8DEF\u932F\u8AA4:", error);
        return false;
      }
    }
    if (mapImg && spotContainer) {
      mapImg.addEventListener("click", function(e) {
        if (e.button !== 0) return;
        if (!checkLoginStatus()) {
          alert("\u8ACB\u5148\u767B\u5165\u624D\u80FD\u65B0\u589E\u91E3\u9EDE\u6A19\u8A18\uFF01\u8ACB\u524D\u5F80\u767B\u5165\u9801\u9762\u9032\u884C\u767B\u5165\u3002");
          return;
        }
        const rect = mapImg.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width * 100;
        const y = (e.clientY - rect.top) / rect.height * 100;
        console.log("\u5730\u5716\u9EDE\u64CA\u6AA2\u67E5\u72C0\u614B:", {
          isWaitingForMapClick: window.isWaitingForMapClick,
          pendingPhotoForMapping: window.pendingPhotoForMapping
        });
        if (window.isWaitingForMapClick && window.pendingPhotoForMapping) {
          console.log("\u5834\u666F\u4E00\uFF1A\u4F86\u81EA\u76F8\u518A\uFF0C\u76F4\u63A5\u5275\u5EFA\u6A19\u8A18");
          const photoData = window.pendingPhotoForMapping;
          const fish = `\u7167\u7247\u6A19\u8A18 - ${photoData.location}`;
          const place = photoData.location;
          const time = new Date(photoData.uploadDate).toLocaleDateString("zh-TW");
          createFlag({ x, y, fish, place, time, photoId: photoData.photoId }, true);
          window.isWaitingForMapClick = false;
          window.pendingPhotoForMapping = null;
          const overlay = document.querySelector('div[style*="position: fixed"][style*="z-index: 1000"]');
          if (overlay) {
            document.body.removeChild(overlay);
          }
          restoreUserInfo();
          localStorage.setItem("flagCreated", Date.now().toString());
          localStorage.setItem("needAlbumRefresh", "true");
          alert("\u{1F4F8} \u5DF2\u6210\u529F\u5C07\u76F8\u518A\u7167\u7247\u6DFB\u52A0\u70BA\u5730\u5716\u6A19\u8A18\uFF01");
          setTimeout(() => {
            window.location.reload();
          }, 1e3);
          return;
        }
        console.log("\u5834\u666F\u4E8C\uFF1A\u5730\u5716\u9EDE\u64CA\uFF0C\u986F\u793A\u78BA\u8A8D\u5C0D\u8A71\u6846");
        showCreateFlagConfirmDialog(x, y);
      });
    }
    checkLoginStatus();
    loadUserFlags();
    checkPendingMapFlag();
    window.addEventListener("storage", (e) => {
      if (e.key === "currentUser") {
        checkLoginStatus();
        if (spotContainer) {
          spotContainer.innerHTML = "";
        }
        loadUserFlags();
      }
    });
    function createFlag({ x, y, fish, place, time, id, photoId }, saveToServer = true) {
      const flag = document.createElement("div");
      flag.style.position = "absolute";
      flag.style.left = x + "%";
      flag.style.top = y + "%";
      flag.style.transform = "translate(-50%, -100%)";
      flag.style.cursor = "pointer";
      flag.style.pointerEvents = "auto";
      function wrapPlaceText(text) {
        const isChinese = (c) => /[\u4e00-\u9fa5]/.test(c);
        let lines = [];
        let line = "";
        let count = 0;
        for (let i = 0; i < text.length; i++) {
          const c = text[i];
          if (isChinese(c)) {
            count += 1;
            if (count > 10) {
              lines.push(line);
              line = "";
              count = 1;
            }
          } else {
            count += 1;
            if (count > 25) {
              lines.push(line);
              line = "";
              count = 1;
            }
          }
          line += c;
        }
        if (line) lines.push(line);
        return lines.join("<br>");
      }
      flag.innerHTML = `
      <svg width="24" height="32" viewBox="0 0 24 32" style="vertical-align:bottom;">
        <polygon points="2,2 20,8 2,14" fill="#e74c3c" stroke="#c0392b" stroke-width="2"/>
        <rect x="2" y="2" width="2" height="28" fill="#555"/>
      </svg>
      <div class="flag-info" style="display:none; position:absolute; left:28px; top:0; background:rgba(255,255,255,0.95); padding:6px 12px; border-radius:6px; box-shadow:0 2px 8px #aaa; font-size:14px; min-width:120px; z-index:20; border:1.5px solid rgb(71, 30, 153);">
        <div><b>\u9B5A\u540D\uFF1A</b><span class="fish-name">${fish}</span></div>
        <div><b>\u5730\u9EDE\uFF1A</b><span class="fish-place">${wrapPlaceText(place)}</span></div>
        <div><b>\u6642\u9593\uFF1A</b><span class="fish-time">${time}</span></div>
      </div>
    `;
      flag.addEventListener("mouseenter", function() {
        const info = flag.querySelector(".flag-info");
        if (info) info.style.display = "block";
      });
      flag.addEventListener("mouseleave", function() {
        const info = flag.querySelector(".flag-info");
        if (info) info.style.display = "none";
      });
      flag.addEventListener("contextmenu", function(ev) {
        ev.preventDefault();
        if (flag.querySelector(".flag-menu")) return;
        const menu = document.createElement("div");
        menu.className = "flag-menu";
        menu.style.position = "absolute";
        menu.style.right = "28px";
        menu.style.top = "60px";
        const delBtn = document.createElement("button");
        delBtn.textContent = "\u522A\u9664";
        delBtn.onclick = async function(e2) {
          e2.stopPropagation();
          if (!checkLoginStatus()) {
            alert("\u8ACB\u5148\u767B\u5165\u624D\u80FD\u522A\u9664\u6A19\u8A18\uFF01");
            return;
          }
          if (confirm("\u78BA\u5B9A\u8981\u522A\u9664\u9019\u500B\u91E3\u9EDE\u6A19\u8A18\u55CE\uFF1F")) {
            if (id && await deleteFlagFromServer(id)) {
              flag.remove();
              alert("\u6A19\u8A18\u5DF2\u522A\u9664\u4E26\u540C\u6B65\u5230\u60A8\u7684\u6703\u54E1\u8CC7\u6599");
              localStorage.setItem("flagDeleted", Date.now().toString());
            } else if (!id) {
              flag.remove();
            } else {
              alert("\u522A\u9664\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66");
            }
          }
        };
        const editBtn = document.createElement("button");
        editBtn.textContent = "\u7DE8\u8F2F";
        editBtn.onclick = function(e2) {
          e2.stopPropagation();
          if (!checkLoginStatus()) {
            alert("\u8ACB\u5148\u767B\u5165\u624D\u80FD\u7DE8\u8F2F\u6A19\u8A18\uFF01");
            return;
          }
          const fishSpan = flag.querySelector(".fish-name");
          const placeSpan = flag.querySelector(".fish-place");
          const timeSpan = flag.querySelector(".fish-time");
          const newFish = prompt("\u8ACB\u8F38\u5165\u9B5A\u540D:", fishSpan.textContent || "");
          if (!newFish) return;
          const oldPlace = placeSpan.innerText.replace(/\n/g, "");
          const newPlace = prompt("\u8ACB\u8F38\u5165\u5730\u9EDE:", oldPlace);
          if (!newPlace) return;
          const newTime = prompt("\u8ACB\u8F38\u5165\u6642\u9593:", timeSpan.textContent || "");
          if (!newTime) return;
          fishSpan.textContent = newFish;
          placeSpan.innerHTML = wrapPlaceText(newPlace);
          timeSpan.textContent = newTime;
          alert("\u6A19\u8A18\u5DF2\u66F4\u65B0\uFF01\n\u6CE8\u610F\uFF1A\u7DE8\u8F2F\u529F\u80FD\u76EE\u524D\u53EA\u5728\u672C\u5730\u751F\u6548\uFF0C\u4F3A\u670D\u5668\u540C\u6B65\u529F\u80FD\u5C07\u5728\u672A\u4F86\u7248\u672C\u4E2D\u5BE6\u4F5C\u3002");
        };
        menu.appendChild(editBtn);
        menu.appendChild(delBtn);
        document.addEventListener("click", function docClick(ev2) {
          if (!menu.contains(ev2.target)) {
            menu.remove();
            document.removeEventListener("click", docClick);
          }
        });
        flag.appendChild(menu);
      });
      spotContainer.appendChild(flag);
      let flagId = id;
      if (saveToServer && currentUser) {
        saveFlagToServer({ x, y, fish, place, time, photoId }).then((savedFlagId) => {
          if (savedFlagId) {
            flagId = savedFlagId;
            console.log("\u6A19\u8A18\u5DF2\u5132\u5B58\u5230\u6703\u54E1\u8CC7\u6599\uFF0CID:", flagId);
            const successMsg = document.createElement("div");
            successMsg.style.position = "fixed";
            successMsg.style.top = "20px";
            successMsg.style.right = "20px";
            successMsg.style.backgroundColor = "#d4edda";
            successMsg.style.border = "1px solid #c3e6cb";
            successMsg.style.color = "#155724";
            successMsg.style.padding = "10px 15px";
            successMsg.style.borderRadius = "5px";
            successMsg.style.zIndex = "1000";
            successMsg.textContent = "\u91E3\u9EDE\u6A19\u8A18\u5DF2\u5132\u5B58\u5230\u60A8\u7684\u6703\u54E1\u8CC7\u6599\uFF01";
            document.body.appendChild(successMsg);
            setTimeout(() => {
              if (successMsg.parentNode) {
                successMsg.parentNode.removeChild(successMsg);
              }
            }, 3e3);
          }
        });
      }
    }
  });
})();
