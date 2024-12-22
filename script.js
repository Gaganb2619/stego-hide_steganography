// script.js

// Encode the message into the image
document.getElementById('encodeButton').addEventListener('click', () => {
    const fileInput = document.getElementById('imageUpload');
    const message = document.getElementById('message').value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    if (fileInput.files[0] && message) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Encoding the message into the image's pixels
                let messageIndex = 0;
                let binaryMessage = '';
                for (let i = 0; i < message.length; i++) {
                    binaryMessage += message.charCodeAt(i).toString(2).padStart(8, '0');
                }
                binaryMessage += '1111111111111110';  // Add delimiter to signify end of message

                let pixelIndex = 0;
                for (let i = 0; i < binaryMessage.length; i++) {
                    if (binaryMessage[i] === '1') {
                        data[pixelIndex * 4] |= 1;  // Set the LSB of the red channel to 1
                    } else {
                        data[pixelIndex * 4] &= ~1;  // Set the LSB of the red channel to 0
                    }
                    pixelIndex++;
                }

                // Put the modified image data back on the canvas
                ctx.putImageData(imageData, 0, 0);

                // Create a download link for the encoded image
                const encodedImage = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.href = encodedImage;
                link.download = 'encoded_image.png';
                link.click();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert('Please upload an image and enter a message.');
    }
});

// Decode the message from the image
document.getElementById('decodeButton').addEventListener('click', () => {
    const fileInput = document.getElementById('decodeImageUpload');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const decodedMessage = document.getElementById('decodedMessage');

    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // Decode the hidden message from the image's pixels
                let binaryMessage = '';
                for (let i = 0; i < data.length; i += 4) {
                    binaryMessage += (data[i] & 1);  // Get the LSB of the red channel
                }

                // Convert binary to text
                let message = '';
                for (let i = 0; i < binaryMessage.length; i += 8) {
                    const byte = binaryMessage.slice(i, i + 8);
                    if (byte === '11111111') break;  // End delimiter reached
                    message += String.fromCharCode(parseInt(byte, 2));
                }

                decodedMessage.value = message;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        alert('Please upload an image.');
    }
});
