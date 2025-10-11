// My Album functionality for image upload and management

// Global variable to store uploaded image data
let uploadedImageData: string | null = null;

// Initialize the album functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAlbum();
});

function initializeAlbum(): void {
    // Add image button click handler
    const addImageButton = document.getElementById('addImageButton') as HTMLButtonElement;
    if (addImageButton) {
        addImageButton.addEventListener('click', function() {
            const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
            if (imageUpload) {
                imageUpload.click(); // Trigger file selection
            }
        });
    }

    // Image upload change handler
    const imageUpload = document.getElementById('imageUpload') as HTMLInputElement;
    if (imageUpload) {
        imageUpload.addEventListener('change', function(event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e: ProgressEvent<FileReader>) {
                    // Display the uploaded image, replacing the previous one
                    const img = document.getElementById('uploadedImage') as HTMLImageElement;
                    if (img && e.target?.result) {
                        img.src = e.target.result as string;
                        img.style.display = 'block'; // Show image
                        uploadedImageData = e.target.result as string; // Save image data
                    }
                };
                
                reader.readAsDataURL(file); // Read file as data URL
            }
        });
    }

    // Submit image button click handler
    const submitImageButton = document.getElementById('submitImageButton') as HTMLButtonElement;
    if (submitImageButton) {
        submitImageButton.addEventListener('click', function() {
            if (uploadedImageData) {
                alert('相片已提交！'); // Alert user that photo is submitted
                // Here you can add AJAX request or other submission logic
                
                // After successful submission, show new upload section
                addNewUploadSection();
            } else {
                alert('請先上傳一張圖片！');
            }
        });
    }
}

function addNewUploadSection(): void {
    const newSection = document.createElement('div');
    newSection.className = 'upload-section';
    newSection.innerHTML = `
        <div style="display: flex; align-items: center; margin-top: 10px;">
            <input type="file" accept="image/*" style="display: none;" onchange="handleNewImageUpload(event)">
            <button style="border: none; background-color: #4CAF50; color: white; padding: 5px 10px; cursor: pointer; margin-left: 10px;" onclick="this.previousElementSibling.click();">
                上傳新圖片
            </button>
            <button style="border: none; background-color: #007BFF; color: white; padding: 5px 10px; cursor: pointer; margin-left: 10px;">
                提交新相片
            </button>
        </div>
        <div class="image-container">
            <img src="" alt="Uploaded Image" style="display:none;">
        </div>
    `;
    
    const newImageContainer = document.getElementById('newImageContainer');
    if (newImageContainer) {
        newImageContainer.appendChild(newSection);
    }
}

// Global function for handling new image uploads (called from inline onclick)
(window as any).handleNewImageUpload = function(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
        const reader = new FileReader();
        const img = target.nextElementSibling?.nextElementSibling?.children[0] as HTMLImageElement;

        reader.onload = function(e: ProgressEvent<FileReader>) {
            if (img && e.target?.result) {
                img.src = e.target.result as string;
                img.style.display = 'block'; // Show image
            }
        };
        
        reader.readAsDataURL(file); // Read file as data URL
    }
};