import * as tf from '@tensorflow/tfjs-node';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Adjust these paths and labels as needed
const MODEL_PATH = path.resolve('./trained_model/model.json');
const LABELS_PATH = path.resolve('./trained_model/labels.json');

let model;
let labels;

// Load model and labels once
async function loadModelAndLabels() {
  if (!model) {
    model = await tf.loadLayersModel(`file://${MODEL_PATH}`);
  }
  if (!labels) {
    labels = JSON.parse(fs.readFileSync(LABELS_PATH, 'utf-8'));
  }
}

// Helper to fetch and decode image from URL
async function fetchImageTensor(imageUrl) {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(arrayBuffer);
  const imageTensor = tf.node.decodeImage(imageBuffer, 3)
    .resizeNearestNeighbor([224, 224]) // adjust size to your model's input
    .expandDims(0)
    .toFloat()
    .div(tf.scalar(255));
  return imageTensor;
}

export async function predictWithTfjs(imageUrl) {
  try {
    await loadModelAndLabels();
    const imageTensor = await fetchImageTensor(imageUrl);
    const prediction = model.predict(imageTensor);
    const predictionArray = prediction.dataSync();
    const topIdx = predictionArray.indexOf(Math.max(...predictionArray));
    imageTensor.dispose();
    prediction.dispose && prediction.dispose();

    // Return the predicted label
    return labels[topIdx] || null;
  } catch (e) {
    console.error('TFJS prediction error:', e);
    return null;
  }
}