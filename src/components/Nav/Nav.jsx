import React from "react";
import { Link } from "react-router-dom";


//NO CAMBIEN EL CLASS COMPONENT A FUNCTIONAL COMPONENT PORQUE SINO LOS TEST NO VAN A CORRER!
export default function Nav() {
    return (
      <div className="nav">
         <Link to='/'>Home</Link>
            <Link to='/character/create'>Create Character</Link>
      </div>
    );
}
