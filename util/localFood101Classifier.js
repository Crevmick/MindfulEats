/**
 * This simulates a fallback food classifier based on local dishes
 * Replace or extend this with real ML or static keyword checks later
 */

export async function fallbackFoodClassifier(imageUrl) {
  console.log("🍲 Fallback model used for image:", imageUrl);

  // Optional: match keywords in the URL or image file name
  if (imageUrl.toLowerCase().includes('jollof')) return 'Jollof Rice';
  if (imageUrl.toLowerCase().includes('egusi')) return 'Egusi Soup';
  if (imageUrl.toLowerCase().includes('eba')) return 'Eba and Soup';
  if (imageUrl.toLowerCase().includes('suya')) return 'Suya';
  if (imageUrl.toLowerCase().includes('moi')) return 'Moi Moi';
  if (imageUrl.toLowerCase().includes('beans')) return 'Beans and Plantain';

  // Default fallback
  const localDishes = [
    'Jollof Rice',
    'Egusi Soup',
    'Eba and Okra',
    'Fried Rice',
    'Moi Moi',
    'Amala and Ewedu',
    'Suya',
    'Boiled Yam and Sauce'
  ];

  // Randomly pick one for demo/testing
  const randomIndex = Math.floor(Math.random() * localDishes.length);
  return localDishes[randomIndex];
}
