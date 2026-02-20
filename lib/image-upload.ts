export async function compressImage(file: File, maxSizeKB: number = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas not supported'))
        
        // Calculate dimensions (max 400x400 for profile pics)
        let width = img.width
        let height = img.height
        const maxDim = 400
        
        if (width > height && width > maxDim) {
          height = (height * maxDim) / width
          width = maxDim
        } else if (height > maxDim) {
          width = (width * maxDim) / height
          height = maxDim
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        // Compress with quality adjustment
        let quality = 0.9
        const compress = () => {
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          const sizeKB = (dataUrl.length * 3) / 4 / 1024
          
          if (sizeKB > maxSizeKB && quality > 0.1) {
            quality -= 0.1
            compress()
          } else {
            resolve(dataUrl)
          }
        }
        
        compress()
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
