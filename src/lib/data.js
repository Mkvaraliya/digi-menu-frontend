// src/lib/data.js
import springRolls from "@/assets/spring-rolls.jpg";
import manchurian from "@/assets/manchurian.jpg";
import soup from "@/assets/soup.jpg";
import paneerButterMasala from "@/assets/paneer-butter-masala.jpg";
import kadaiPaneer from "@/assets/kadai-paneer.jpg";
import paneerTikka from "@/assets/paneer-tikka.jpg";
import kajuCurry from "@/assets/kaju-curry.jpg";
import kajuMasala from "@/assets/kaju-masala.jpg";
import kajuPaneer from "@/assets/kaju-paneer.jpg";
import gulabJamun from "@/assets/gulab-jamun.jpg";
import rasmalai from "@/assets/rasmalai.jpg";
import iceCream from "@/assets/ice-cream.jpg";

export const dishes = [
  // Starters
  {
    id: "spring-rolls",
    name: "Spring Rolls",
    price: 120,
    category: "Starters",
    type: "Starter",
    spiceLevel: "Mild",
    image: springRolls,
    description:
      "Crispy golden spring rolls filled with fresh vegetables and served with tangy dipping sauce.",
    ingredients: ["Cabbage", "Carrots", "Bell Peppers", "Spring Roll Wrappers", "Soy Sauce", "Ginger"],
    recipe:
      "Finely chop vegetables and sauté with ginger and soy sauce. Wrap in spring roll sheets and deep fry until golden and crispy. Serve hot with sweet chili sauce.",
    nutrition: { calories: 180, protein: "4g", carbs: "28g", fat: "6g" },
  },
  {
    id: "manchurian",
    name: "Manchurian",
    price: 150,
    category: "Starters",
    type: "Starter",
    spiceLevel: "Medium",
    image: manchurian,
    description:
      "Delicious vegetable balls in a tangy Indo-Chinese sauce with aromatic spices.",
    ingredients: ["Cabbage", "Cauliflower", "Carrots", "Cornflour", "Soy Sauce", "Garlic", "Green Chilies"],
    recipe:
      "Make vegetable balls with grated vegetables and cornflour, deep fry until crispy. Prepare sauce with soy sauce, garlic, and spices. Toss the balls in the sauce and serve hot.",
    nutrition: { calories: 220, protein: "6g", carbs: "32g", fat: "8g" },
  },
  {
    id: "soup",
    name: "Soup",
    price: 100,
    category: "Starters",
    type: "Starter",
    spiceLevel: "Mild",
    image: soup,
    description: "Warm and comforting creamy soup with fresh herbs and aromatic spices.",
    ingredients: ["Mixed Vegetables", "Vegetable Stock", "Cream", "Butter", "Herbs", "Black Pepper"],
    recipe:
      "Sauté vegetables in butter, add stock and simmer until tender. Blend until smooth, add cream and season with herbs and pepper. Serve hot with a garnish of fresh herbs.",
    nutrition: { calories: 140, protein: "3g", carbs: "18g", fat: "6g" },
  },
  // Paneer Dishes
  {
    id: "paneer-butter-masala",
    name: "Paneer Butter Masala",
    price: 220,
    category: "Paneer Dishes",
    type: "Main Course",
    spiceLevel: "Medium",
    image: paneerButterMasala,
    description: "Rich and creamy tomato-based curry with soft paneer cubes in aromatic spices.",
    ingredients: ["Paneer", "Tomatoes", "Cream", "Butter", "Cashews", "Garam Masala", "Kasuri Methi"],
    recipe:
      "Prepare a smooth tomato-cashew gravy with butter and cream. Add paneer cubes and simmer in the rich sauce. Finish with kasuri methi and a dollop of butter. Serve with naan or rice.",
    nutrition: { calories: 380, protein: "18g", carbs: "22g", fat: "26g" },
  },
  {
    id: "kadai-paneer",
    name: "Kadai Paneer",
    price: 240,
    category: "Paneer Dishes",
    type: "Main Course",
    spiceLevel: "Hot",
    image: kadaiPaneer,
    description: "Spicy and flavorful paneer cooked with bell peppers and aromatic kadai masala.",
    ingredients: ["Paneer", "Bell Peppers", "Onions", "Tomatoes", "Kadai Masala", "Coriander", "Ginger-Garlic"],
    recipe:
      "Sauté onions, bell peppers, and tomatoes with kadai masala. Add paneer cubes and cook until the flavors blend. Garnish with fresh coriander and serve hot with Indian bread.",
    nutrition: { calories: 350, protein: "20g", carbs: "18g", fat: "24g" },
  },
  {
    id: "paneer-tikka",
    name: "Paneer Tikka",
    price: 200,
    category: "Paneer Dishes",
    type: "Starter",
    spiceLevel: "Medium",
    image: paneerTikka,
    description: "Grilled paneer marinated in yogurt and spices with charred bell peppers.",
    ingredients: ["Paneer", "Yogurt", "Bell Peppers", "Tikka Masala", "Lemon", "Ginger-Garlic", "Cream"],
    recipe:
      "Marinate paneer and vegetables in yogurt, spices, and cream. Thread onto skewers and grill until charred. Serve hot with mint chutney and lemon wedges.",
    nutrition: { calories: 280, protein: "16g", carbs: "14g", fat: "18g" },
  },
  // Kaju Dishes
  {
    id: "kaju-curry",
    name: "Kaju Curry",
    price: 250,
    category: "Kaju Dishes",
    type: "Main Course",
    spiceLevel: "Medium",
    image: kajuCurry,
    description: "Creamy cashew curry with whole cashews in a rich white gravy.",
    ingredients: ["Cashews", "Cream", "Onions", "Tomatoes", "Cardamom", "White Pepper", "Butter"],
    recipe:
      "Prepare a smooth white gravy with cashew paste, cream, and mild spices. Add roasted whole cashews and simmer until the flavors meld. Finish with butter and serve with naan.",
    nutrition: { calories: 420, protein: "12g", carbs: "28g", fat: "32g" },
  },
  {
    id: "kaju-masala",
    name: "Kaju Masala",
    price: 260,
    category: "Kaju Dishes",
    type: "Main Course",
    spiceLevel: "Hot",
    image: kajuMasala,
    description: "Spicy cashew curry in a rich tomato-onion gravy with aromatic spices.",
    ingredients: ["Cashews", "Tomatoes", "Onions", "Garam Masala", "Red Chili", "Coriander", "Cumin"],
    recipe:
      "Create a spicy tomato-onion base with roasted spices. Add roasted cashews and cook until the gravy thickens. Garnish with fresh coriander and serve hot.",
    nutrition: { calories: 440, protein: "14g", carbs: "30g", fat: "34g" },
  },
  {
    id: "kaju-paneer",
    name: "Kaju Paneer",
    price: 280,
    category: "Kaju Dishes",
    type: "Main Course",
    spiceLevel: "Medium",
    image: kajuPaneer,
    description: "Luxurious combination of cashews and paneer in a creamy orange curry.",
    ingredients: ["Cashews", "Paneer", "Tomatoes", "Cream", "Onions", "Garam Masala", "Saffron"],
    recipe:
      "Prepare a rich cashew-tomato gravy with cream and aromatic spices. Add paneer cubes and whole cashews. Infuse with saffron and finish with a swirl of cream.",
    nutrition: { calories: 480, protein: "22g", carbs: "26g", fat: "36g" },
  },
  // Desserts
  {
    id: "gulab-jamun",
    name: "Gulab Jamun",
    price: 100,
    category: "Desserts",
    type: "Dessert",
    spiceLevel: "None",
    image: gulabJamun,
    description: "Soft and spongy milk dumplings soaked in aromatic rose-cardamom syrup.",
    ingredients: ["Milk Powder", "Flour", "Cardamom", "Sugar", "Rose Water", "Saffron", "Ghee"],
    recipe:
      "Make soft dough with milk powder and flour, shape into balls and deep fry until golden. Soak in warm sugar syrup infused with cardamom and rose water. Serve warm or chilled.",
    nutrition: { calories: 320, protein: "6g", carbs: "52g", fat: "10g" },
  },
  {
    id: "rasmalai",
    name: "Rasmalai",
    price: 120,
    category: "Desserts",
    type: "Dessert",
    spiceLevel: "None",
    image: rasmalai,
    description: "Delicate cottage cheese discs in rich saffron-flavored creamy milk.",
    ingredients: ["Cottage Cheese", "Milk", "Sugar", "Saffron", "Cardamom", "Pistachios", "Almonds"],
    recipe:
      "Prepare soft cottage cheese patties and cook in sugar syrup. Soak in reduced milk flavored with saffron and cardamom. Garnish with chopped nuts and serve chilled.",
    nutrition: { calories: 280, protein: "10g", carbs: "42g", fat: "8g" },
  },
  {
    id: "ice-cream",
    name: "Ice Cream",
    price: 90,
    category: "Desserts",
    type: "Dessert",
    spiceLevel: "None",
    image: iceCream,
    description: "Premium artisan ice cream with rich flavors and delightful toppings.",
    ingredients: ["Cream", "Milk", "Sugar", "Vanilla", "Fresh Fruits", "Chocolate", "Nuts"],
    recipe:
      "Prepare premium ice cream base with fresh cream and milk. Churn until smooth and freeze. Serve in elegant bowls with fresh fruits, chocolate sauce, and chopped nuts.",
    nutrition: { calories: 250, protein: "4g", carbs: "32g", fat: "12g" },
  },
];

export const categories = [
  { id: "starters", name: "Starters", image: springRolls },
  { id: "paneer-dishes", name: "Paneer Dishes", image: paneerButterMasala },
  { id: "kaju-dishes", name: "Kaju Dishes", image: kajuCurry },
  { id: "desserts", name: "Desserts", image: gulabJamun },
];
