import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);

async function run() {
  const newProduct = {
    name: 'Smart 4K Television 55"',
    categoryId: 'electronics',
    subCategory: 'Smartphones',
    price: 399.99,
    images: ['https://i.ibb.co.com/b5sYFPpf/61mh-BSKOin-L-AC-SL1500.jpg'],
    description: 'High definition 4K TV with Smart capabilities, stunning visuals, and immersive audio.',
    stock: 25,
    rating: 4.8,
    reviewCount: 42,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await addDoc(collection(db, 'products'), newProduct);
  console.log('Added product!');
  process.exit(0);
}
run();
