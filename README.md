# MetaBall Animation in React Native

## 🚀 Overview
This project demonstrates an interactive **MetaBall animation** using **React Native, Reanimated, and Skia**. The animation features smooth physics-based motion, sticky and bouncy interactions, and visually appealing blur and gradient effects.

## ✨ Features
- 🌀 **Smooth Metaball Effect** with dynamic interactions
- 🔄 **Realistic bouncing & physics-based motion**
- 🎨 **Glowing gradients and blur for stunning visuals**
- 🎭 **Touchable and draggable elements**
- ⚡ **Highly performant with Reanimated & Skia**

## 🛠️ Tech Stack
- **React Native**
- **Reanimated** (for animations and physics-based effects)
- **Skia** (for rendering and visual effects)
- **Gesture Handler** (for interactive touch events)

## 📦 Installation
```sh
# Clone the repository
git clone https://github.com/your-username/metaball-animation.git
cd metaball-animation

# Install dependencies
yarn install  # or npm install

# Run the app
yarn start  # or npm start
```

## 📸 Preview
🚀 Check out the animation in action! 🎥 [Link to demo video]

## 🏗️ Usage
Simply import the `Metaball` component into your React Native project:

```jsx
import Metaball from './Metaball';

const App = () => {
  return <Metaball />;
};

export default App;
```

### 🎮 Controls
- **Add** ➝ Adds a new metaball
- **Sticky Mode** ➝ Snaps metaballs to the center
- **Reset** ➝ Resets the animation
- **Moving Mode** ➝ Toggles automatic movement

## 🎨 Customization
You can tweak the physics, color effects, and responsiveness:

- Adjust **radius and speed** in `CircleItem.tsx`
- Modify **gradient colors** in the `SweepGradient` component
- Change the **blur intensity** in the `ColorMatrix`

## 📝 License
This project is licensed under the **MIT License**.

## 📬 Contact
For any questions or feedback, reach out to **[Your Name]** via **[your email]** or open an issue on GitHub!

Happy coding! 🚀

