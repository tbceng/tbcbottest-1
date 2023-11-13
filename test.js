const { createCanvas, loadImage } = require('canvas');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const fetch = require('node-fetch');
const gm = require('gm');
const fs = require('fs');
const client = new ImageAnnotatorClient();
const path = require('path');

async function imageUrlToBuffer(imageUrl) {
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        const response = await fetch(imageUrl);
        const buffer = await response.buffer();
        return buffer;
    } else if (imageUrl.startsWith('file://')) {
        const filePath = imageUrl.slice(7); // Remove the "file://" prefix
        const buffer = await fs.promises.readFile(filePath);
        return buffer;
    } else {
        throw new Error('Unsupported image URL');
    }
}

async function convertToSupportedFormat(imageBuffer, outputDir, outputFormat) {
    // Create the output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const uniqueFilename = `converted_image_${Date.now()}.${outputFormat}`;
    const outputPath = path.join(outputDir, uniqueFilename);

    // Check if the image has already been converted
    if (fs.existsSync(outputPath)) {
      console.log(`Image already converted to ${outputPath}`);
      return outputPath;
    }

    return new Promise((resolve, reject) => {
      gm(imageBuffer)
        .setFormat(outputFormat)
        .write(outputPath, function (err) {
          if (err) {
            reject(err);
          } else {
            console.log(`Image converted to ${outputPath}`);
            resolve(outputPath);
          }
        });
    });
}

async function detectFacesInImage(apiKey, imagePath) {
    const imageContent = fs.readFileSync(imagePath).toString('base64');

    const response = await client.annotateImage({
        image: {
            content: imageContent,
        },
        features: [
            {
                type: 'FACE_DETECTION',
                maxResults: 10,
            },
        ],
    }, {
        apiKey: apiKey,
    });

    const faceAnnotations = response[0].faceAnnotations;

    const canvas = createCanvas();
    const context = canvas.getContext('2d');

    // Load the image from the file
    const image = await loadImage(imagePath);

    // Set the canvas size to match the image size
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw the image onto the canvas
    context.drawImage(image, 0, 0, image.width, image.height);

    for (const faceAnnotation of faceAnnotations) {
        const boundingBox = faceAnnotation.boundingPoly;

        // Draw a bounding box around the face
        context.strokeStyle = 'red';
        context.lineWidth = 5;
        context.strokeRect(
            boundingBox.vertices[0].x,
            boundingBox.vertices[0].y,
            boundingBox.vertices[2].x - boundingBox.vertices[0].x,
            boundingBox.vertices[2].y - boundingBox.vertices[0].y
        );
    }

    // Log the annotated image to the console
    console.log(canvas.toDataURL());
}

// Usage example
const apiKey = 'YOUR_API_KEY';
const imageUrl = 'https://i.insider.com/62fea863ec781d001868c1f4?width=1136&format=jpeg';

async function processImage(apiKey, imageUrl) {
    const imageBuffer = await imageUrlToBuffer(imageUrl);

    const outputDir = path.join(__dirname, 'output');
    const convertedImagePath = await convertToSupportedFormat(imageBuffer, outputDir, 'jpeg');

    try {
        await detectFacesInImage(apiKey, convertedImagePath);
    } finally {
        // Delete the converted image file after processing
        if (fs.existsSync(convertedImagePath)) {
            fs.unlinkSync(convertedImagePath);
            console.log(`Converted image file deleted: ${convertedImagePath}`);
        }
    }
}

processImage(apiKey, imageUrl);
