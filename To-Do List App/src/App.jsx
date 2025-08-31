import Body from "./components/Body"
import { AuthProvider } from "./components/AuthContext"

function App() {  
  return (
    <AuthProvider>
      <div>
        <Body/>
      </div>
    </AuthProvider>
  );
}

export default App
