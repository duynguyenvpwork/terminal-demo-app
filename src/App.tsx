import 'xterm/css/xterm.css'
import {
  Routes,
  Route,
  useNavigate
} from "react-router-dom";
import loadable from "@loadable/component";
import styles from "./App.module.css"

const LocalTerminal = loadable(() => import("./Terminal/LocalTerminal"), {
  fallback: <h1>loading ...</h1>,
});

const Ssh = loadable(() => import("./Terminal/Ssh"), {
  fallback: <h1>loading ...</h1>,
});

function App() {
  const navigate = useNavigate()
  const handleLocalTerminal = () => {
    navigate("local-terminal")
  }
  const handleSsh = () => {
    navigate("ssh")
  }
  return (
    <div className={styles.app}>
      <div className={styles["app_controls"]}>
        <button className={styles["app_controls_button"]} onClick={handleLocalTerminal}>Local-Terminal</button>
        <button className={styles["app_controls_button"]} onClick={handleSsh}>SSH</button>
      </div>
      <Routes>
        <Route path="local-terminal" element={<LocalTerminal />} />
        <Route path="ssh" element={<Ssh />} />
      </Routes>
    </div>
  );
}

export default App;