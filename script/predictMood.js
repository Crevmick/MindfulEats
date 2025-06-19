import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';

const moodMap = { 'Frustrated': 0, 'Sad': 1, 'Anxious': 2, 'Neutral': 3, 'Grateful': 4, 'Happy': 5 };
const mealMap = { 'breakfast': 0, 'lunch': 1, 'dinner': 2, 'snack': 3 };

const rawData = JSON.parse(fs.readFileSync('./mealMoodData.json', 'utf8'));

const inputs = rawData.map(d => [
  d.mealSizeCode ?? 1,
  d.hungerBefore,
  d.hungerAfter,
  mealMap[d.mealType] ?? 0,
  d.hourOfDay
]);

const labels = rawData.map(d => moodMap[d.moodScore]);

const xs = tf.tensor2d(inputs);
const ys = tf.tensor1d(labels, 'int32');

const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [5], units: 32, activation: 'relu' }));
model.add(tf.layers.dense({ units: 16, activation: 'relu' }));
model.add(tf.layers.dense({ units: 6, activation: 'softmax' }));

model.compile({
  optimizer: 'adam',
  loss: 'sparseCategoricalCrossentropy',
  metrics: ['accuracy']
});

await model.fit(xs, ys, {
  epochs: 40,
  batchSize: 16,
  shuffle: true,
  validationSplit: 0.2,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}`);
    }
  }
});

await model.save('file://./trained_model');
console.log('✅ Model trained and saved at ./trained_model');
