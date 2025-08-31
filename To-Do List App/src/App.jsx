import Body from "./components/Body";
import { AuthProvider } from "./components/AuthContext";
import AndroidKeyboardHandler from "./components/AndroidKeyboardHandler";

function App() {
  return (
    <AuthProvider>
      <div>
        <AndroidKeyboardHandler />
        <Body />
      </div>
    </AuthProvider>
  );
}

export default App;
