import React from "react";
import { BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Nav from "../../my-app/src/components/Nav";
import Home from "./components/Home/Home"
import CharacterDetail from './components/CharacterDetail/CharacterDetail'
import CreateCharacter from './components/CreateCharacter/CreateCharacter'
import Ships from './components/Ships/Ships'


function App() {


  return (
    <div>
      <h1>Hello</h1>
      {/* <Switch>

        <Route exact path="/" element={<Home/>}/>
        <Route  path="/character/:id" element={CharacterDetail}/>
        <Route  path="/character/create" element={CreateCharacter}/>
        <Route  path="/ships" element={Ships}/>
      </Switch> */}
    </div>
  );
}
export default App;
