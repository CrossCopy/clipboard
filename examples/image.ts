import clipboard from '../index'

console.log('has text: ', clipboard.hasText())
console.log('has image: ', clipboard.hasImage())
if (clipboard.hasImage()) {
  console.log('image base64', await clipboard.getImageBase64())
}
