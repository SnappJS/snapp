
import snapp from "../src/snapp.js"
import Links from "./components/Links"

const App = () => {

  const count = snapp.dynamic(0)

  return <div className="center-div">
      
      <img style={{width: "auto", height: "200px"}} src="assets/snapp.png" alt="snapp" />
      <h2>Welcome to snapp {() => count.value}</h2>

      <button 
        className="button"
        onClick={() => count.update(count.value + 1)}
      >
      Click To Count
      </button>

      <Links />
  </div>

}

const SnappBody = document.querySelector("#snapp-body");
snapp.render(SnappBody, App())