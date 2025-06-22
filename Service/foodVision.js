import { ClarifaiStub, grpc } from 'clarifai-nodejs-grpc';
import { fallbackFoodClassifier } from '../util/localFood101Classifier.js';
import { predictWithTfjs } from '../util/tfjsFoodClassifier.js'; // <-- You need to implement this

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set("authorization", "Key " + process.env.CLARIFAI_API_KEY);

export async function detectFoodNameFromImage(imageUrl) {
  return new Promise((resolve, reject) => {
    stub.PostModelOutputs(
      {
        model_id: "food-item-recognition",
        inputs: [{ data: { image: { url: imageUrl } } }]
      },
      metadata,
      async (err, response) => {
        if (err || response.status.code !== 10000) {
          // Try TensorFlow.js model if Clarifai fails
          try {
            const tfjsResult = await predictWithTfjs(imageUrl);
            if (tfjsResult) return resolve(tfjsResult);
          } catch (e) {
            // Ignore and fallback
          }
          const fallback = await fallbackFoodClassifier(imageUrl);
          return resolve(fallback);
        }

        const top = response.outputs[0].data.concepts[0];
        if (!top || top.value < 0.75) {
          // Try TensorFlow.js model if Clarifai is not confident
          try {
            const tfjsResult = await predictWithTfjs(imageUrl);
            if (tfjsResult) return resolve(tfjsResult);
          } catch (e) {
            // Ignore and fallback
          }
          const fallback = await fallbackFoodClassifier(imageUrl);
          return resolve(fallback);
        }

        return resolve(top.name || 'unknown');
      }
    );
  });
}