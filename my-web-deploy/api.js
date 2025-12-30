// Simple API handler
document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const deployForm = document.getElementById('deploy-form');
  const siteNameInput = document.getElementById('site-name');
  const urlPreview = document.getElementById('url-preview');
  const fileUploadArea = document.getElementById('file-upload-area');
  const fileInput = document.getElementById('file-input');
  const fileInfo = document.getElementById('file-info');
  const fileNameDisplay = document.getElementById('file-name-display');
  const fileSizeDisplay = document.getElementById('file-size-display');
  const removeFileButton = document.getElementById('remove-file');
  const deployButton = document.getElementById('deploy-button');
  const deployButtonText = deployButton.querySelector('span');
  const deployButtonIcon = deployButton.querySelector('i');
  const resultSection = document.getElementById('result-section');
  const resultUrl = document.getElementById('result-url');
  const copyButton = document.getElementById('copy-button');
  const viewButton = document.getElementById('view-button');
  
  let currentFile = null;
  
  // Update URL preview
  siteNameInput.addEventListener('input', function() {
    const name = cleanUrl(this.value.trim()) || 'mysite';
    urlPreview.textContent = name;
  });
  
  function cleanUrl(text) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
  
  // File upload
  fileUploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  
  function handleFileSelect() {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      
      if (!file.name.endsWith('.html')) {
        alert('Hanya file HTML (.html)');
        return;
      }
      
      currentFile = file;
      fileNameDisplay.textContent = file.name;
      fileSizeDisplay.textContent = formatSize(file.size);
      fileInfo.classList.add('show');
    }
  }
  
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' Bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
  
  removeFileButton.addEventListener('click', function(e) {
    e.stopPropagation();
    currentFile = null;
    fileInfo.classList.remove('show');
    fileInput.value = '';
  });
  
  // Form submit
  deployForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const siteName = cleanUrl(siteNameInput.value.trim()) || 'mysite';
    
    if (!currentFile) {
      alert('Pilih file HTML dulu');
      return;
    }
    
    if (siteName.length < 2) {
      alert('Nama minimal 2 karakter');
      return;
    }
    
    // Loading
    deployButton.disabled = true;
    deployButtonText.textContent = 'Deploying...';
    deployButtonIcon.className = 'fas fa-spinner fa-spin';
    
    try {
      // Read file
      const htmlContent = await readFile(currentFile);
      
      // Call API
      const response = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteName, htmlContent })
      });
      
      const result = await response.json();
      
      // Show result
      resultUrl.textContent = result.url;
      resultSection.classList.add('show');
      
      alert('Deploy berhasil! (simulasi)');
      
    } catch (error) {
      console.error(error);
      alert('Deploy gagal: ' + error.message);
    } finally {
      deployButton.disabled = false;
      deployButtonText.textContent = 'Deploy Ke Vercel';
      deployButtonIcon.className = 'fas fa-bolt';
    }
  });
  
  function readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(new Error('Gagal baca file'));
      reader.readAsText(file);
    });
  }
  
  // Copy URL
  copyButton.addEventListener('click', function() {
    const url = resultUrl.textContent;
    navigator.clipboard.writeText(url).then(() => {
      alert('URL disalin!');
    });
  });
  
  // View website
  viewButton.addEventListener('click', function() {
    const url = resultUrl.textContent;
    window.open(url, '_blank');
  });
  
  // Initialize
  urlPreview.textContent = cleanUrl(siteNameInput.value.trim()) || 'mysite';
});
