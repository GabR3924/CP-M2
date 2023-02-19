import "./home.css";
import React, { Component } from "react";

import { connect } from "react-redux";
// Importar las actions como Object Modules y no hacerles destructuring, sino los test no funcionarán!
// Ej: import * as actions from '...'
// Aparte Fijense en los test que SI O SI tiene que ser un class component, de otra forma NO VAN A PASAR LOS TEST.

export class Home extends Component {
  render() {
    return (
      <div className="home">
        <h1>Star Wars</h1>
        <h2>May the force be with you</h2>
        <img src="cp-fm2-image.png" alt="star-wars-logo" />
        <h3>Characters</h3>
      </div>
    );
  }
}

export const mapStateToProps = (state) => { }

export const mapDispatchToProps = (dispatch) => { }

export default connect(mapStateToProps, mapDispatchToProps)(Home);
