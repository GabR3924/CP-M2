import * as actions from "../src/redux/actions";
import * as data from "../db.json";

import HomeConnected, {
  Home,
  mapDispatchToProps,
  mapStateToProps,
} from "../src/components/Home/Home";
import { configure, mount, shallow } from "enzyme";

import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { MemoryRouter } from "react-router-dom";
import CharacterCard from "../src/components/CharacterCard/CharacterCard";
import { Provider } from "react-redux";
import React from "react";
import axios from "axios";
import configureStore from "redux-mock-store";
import isReact from "is-react";
import mainImage from "../src/img-cp2/cp-fm2-image.png";
import nock from "nock";
import nodeFetch from "node-fetch";
import thunk from "redux-thunk";

axios.defaults.adapter = require("axios/lib/adapters/http");

configure({ adapter: new Adapter() });

// Acá se mockea la action para que el test pueda funcionar correctamente, sin importar si hay un bug en ese archivo
jest.mock('../src/redux/actions/index.js', () => ({
  getCharacters: () => ({
    type: 'GET_CHARACTERS'
  })
}))

// Lo mismo para cada card
jest.mock('../src/components/CharacterCard/CharacterCard', () => () => <></>);

describe("<Home />", () => {
  let home, store, state, getCharactersSpy, componentDidMountSpy;
  global.fetch = nodeFetch;
  const mockStore = configureStore([thunk]);
  beforeEach(() => {
    // Se Mockea las request a las api
    const apiMock = nock("http://localhost:3001").persist();

    // "/characters" => Retorna la propiedad characters del archivo data.json
    apiMock.get("/characters").reply(200, data.characters);

    // "/characters/:id" => Retorna un personaje matcheado por su id
    // "/characters/:id" => Retorna un personaje matcheado por su id
    let id = null;
    apiMock
      .get((uri) => {
        id = Number(uri.split("/").pop()); // Number('undefined') => NaN
        return !!id;
      })
      .reply(200, (uri, requestBody) => {
        return data.characters.find((char) => char.id === id) || {};
      });
    state = {
      characters: [],
      characterDetail: {},
      ships: []
    };
    store = mockStore(state);
    home = mount(<HomeConnected store={store} />);
    // Si o si vas a tener que usar class component! No van a pasar ninguno de los tests si no lo haces.
    expect(isReact.classComponent(Home)).toBeTruthy();

    store.clearActions();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('Debería rederizar un "h1" con el texto "Star Wars"', () => {
    expect(home.find("h1").at(0).text()).toEqual("Star Wars");
  });

  it('Debería renderizar un "h2" con el text "May the force be with you"', () => {
    expect(home.find("h2").at(0).text()).toEqual("May the force be with you")
  })

  it('Debería renderizar en un tag "img" la imagen provista en la carpeta "img-cp2"', () => {
    // Tendrías que importar la img a tu archivo "Home.jsx" y luego usarla como source de img.
    // Podés ver como lo hacemos en este mismo archivo en la linea 16!
    expect(home.find("img").at(0).prop("src")).toEqual(mainImage);
  });

  it('La imagen debería tener un atributo "alt" con el texto "star-wars-logo"', () => {
    expect(home.find("img").at(0).prop("alt")).toEqual("star-wars-logo");
  });

  it('Debería rederizar un "h3" con el texto "Characters"', () => {
    expect(home.find("h3").at(0).text()).toEqual("Characters");
  });

  describe("connect Redux", () => {
    // 🚨IMPORTANTE TRABAJAMOS CON LA REFERENCIA DE LAS ACTIONS TE DEJAMOS COMENTARIOS PARA CADA USO LEER BIEN!!🚨
    it("Debería traer de redux nuestros personajes usando mapStateToProps", () => {
      // El estado debería tener un nombre "characters".
      expect(mapStateToProps(state)).toEqual({ characters: state.characters });
    });

    if (typeof mapDispatchToProps === "function") {
      // ESTE TEST ES POR SI HACES EL MAPDISPATCHTOPROPS COMO UNA FUNCIÓN.
      // IMPORTANTE! SI LO HACES DE ESTA FORMA LA IMPORTACION DE LAS ACTIONS DEBE SER DE LA SIGUIENTE MANERA
      // import * as actions from "./../../redux/actions/index";
      it("Debería traer por props la funcion getCharacters de Redux usando mapDispatchToProps", () => {
        // Acá testeamos que hagas todo el proceso. Utilizas la funcion "mapDispatchToProps",
        // y con ella despachas la accion "getCharacters".
        const getCharacters = jest.spyOn(actions, "getCharacters");
        const dispatch = jest.fn();
        const props = mapDispatchToProps(dispatch);
        props.getCharacters();
        expect(dispatch).toHaveBeenCalled();
        expect(getCharacters).toHaveBeenCalled();
      });
    } else {
      // ESTE TEST ES POR SI HACES EL MAPDISPATCHTOPROPS COMO UN OBJETO.
      // IMPORTANTE! SI LO HACES DE ESTA FORMA mapDispatchToProps TIENE QUE SER EL OBJETO
      it("Debería traer por props la action creator getCharacters de Redux usando mapDispatchToProps", () => {
        // Acá testeamos que hagas todo el proceso. Utilizas connect y el objeto "mapDispatchToProps",
        // traes la acción "getCharacters". Con esto podrás usarla luego en el componente.
        const getCharacters = jest.spyOn(actions, "getCharacters");
        getCharacters();
        expect(mapDispatchToProps.hasOwnProperty("getCharacters")).toBeTruthy();
        expect(getCharacters).toHaveBeenCalled();
      });
    }
  });

  describe("React LifeCycles", () => {
    getCharactersSpy = jest.fn();
    let instance;
    beforeEach(async () => {
      state = {
        characters: data.characters,
        characterDetail: {},
        ships: []
      };
      store = mockStore(state);
      home = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/home"]}>
            <HomeConnected />
          </MemoryRouter>
        </Provider>
      );
    });

    beforeAll(() => {
      // Ojo acá. Antes que corran los demás tests, chequeamos que estés usando el lifeCycle correspondiente ( componentDidMount )
      // y que en él ejecutas la action creator "getCharacters" para traerte toda esa data.
      // Si no pasan estos tests, no pasan los demás!
      componentDidMountSpy = jest.spyOn(Home.prototype, "componentDidMount");
      instance = shallow(<Home getCharacters={getCharactersSpy} />).instance();

      instance.componentDidMount();
      expect(componentDidMountSpy).toHaveBeenCalled();
      // Para que este test funcione, recordar importar las actions como object modules!
      expect(getCharactersSpy).toHaveBeenCalled();
    });

    it("Debería mapear la cantidad de personajes que hayan en el store y renderizar una <CharacterCard /> por cada una", () => {
      // Cuidado acá. Como realizamos una petición al back (código asincrónico), el componente se va a
      // renderizar más rápido. Hay un problema con esto, se va a intentar renderizar algunos datos que
      // no existen todavía, lo que es igual a un fatal error. Deberías asegurarte que existen
      // personajes y luego renderizarlos!
      // Pista: Usa un renderizado condicional.
      // IMPORTANTE: revisar el código arriba de este test, el beforeAll.
      // Ahí se está testeando el uso del lifecycle componentDidMount y que en él
      // traigas la data a renderizar.
      expect(home.find(CharacterCard)).toHaveLength(3);
    });

    it("Debería pasar como props a cada componente <CharacterCard /> las propiedades id, name, faction e image, de cada personaje", () => {
      // No olviden pasar la props KEY en el mapeo para mantener buenas practicas.
      expect(home.find(CharacterCard).at(0).props().id).toEqual(1);
      // En teoria debería asignarse como key el id del elemento a renderizar, pero al ser ids numéricos (es decir, fácilmente puede repetirse con otras key dentro del DOM),
      // pueden directamente utilizar el índice que provee array.map() en el segundo argumento.
      expect(home.find(CharacterCard).at(0).props().name).toEqual("Darth Vader");
      expect(home.find(CharacterCard).at(0).props().faction).toEqual("The Empire");
      expect(home.find(CharacterCard).at(0).props().image).toEqual(
        "https://www.quever.news/u/fotografias/m/2020/11/3/f848x477-2650_60453_5027.jpg"
      );
      expect(home.find(CharacterCard).at(1).props().id).toEqual(2);
      expect(home.find(CharacterCard).at(1).props().name).toEqual("Luke Skywalker");
      expect(home.find(CharacterCard).at(1).props().faction).toEqual("The Rebellion");
      expect(home.find(CharacterCard).at(1).props().image).toEqual(
        "https://static.wikia.nocookie.net/esstarwars/images/d/dd/Lukeonskiff.png/revision/latest/scale-to-width-down/220?cb=20180709043103"
      );

      expect(home.find(CharacterCard).at(2).props().id).toEqual(3);
      expect(home.find(CharacterCard).at(2).props().name).toEqual("Han Solo");
      expect(home.find(CharacterCard).at(2).props().faction).toEqual("The Rebellion");
      expect(home.find(CharacterCard).at(2).props().image).toEqual(
        "https://static.wikia.nocookie.net/esstarwars/images/f/fe/Han_Solo%27s_blaster.jpg/revision/latest/scale-to-width-down/350?cb=20151030182246"
      );
    });
  });
});
