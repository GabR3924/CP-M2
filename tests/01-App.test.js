import * as data from "../db.json";

import { configure, mount } from "enzyme";


import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import App from "../src/App";
import CreateCharacter from "../src/components/CreateCharacter/CreateCharacter";
import Home from "../src/components/Home/Home";
import Ships from "../src/components/Ships/Ships";
import { MemoryRouter } from "react-router-dom";
import CharacterDetail from "../src/components/CharacterDetail/CharacterDetail";
import Nav from "../src/components/Nav/Nav";
import { Provider } from "react-redux";
import React from "react";
import axios from "axios";
import configureStore from "redux-mock-store";
import nock from "nock";
import nodeFetch from "node-fetch";
import thunk from "redux-thunk";

axios.defaults.adapter = require("axios/lib/adapters/http");

configure({ adapter: new Adapter() });

// Mocks de los componentes, acá se pueden hardcodear para que funcionen SI o SI
// De esa manera sin importar si hay errores en alguno de ellos, nos fijamos de que sean montados en app.js
jest.mock('../src/components/Ships/Ships', () => () => <></>)
jest.mock('../src/components/CharacterDetail/CharacterDetail', () => () => <></>);
jest.mock('../src/components/Nav/Nav', () => () => <></>);
jest.mock('../src/components/CreateCharacter/CreateCharacter', () => () => <></>);
jest.mock('../src/components/Home/Home', () => () => <></>);

describe("<App />", () => {
  global.fetch = nodeFetch;

  let store;
  const routes = ["/", "/character/1", "/character/create", "/ships"];
  const mockStore = configureStore([thunk]);
  const state = {
    characters: data.main,
    CharacterDetail: {  },
  };

  beforeEach(async () => {
    // Se Mockea las request a las api
    const apiMock = nock("http://localhost:3001").persist();

    // "/characters" => Retorna la propiedad characters del archivo data.json
    apiMock.get("/characters").reply(200, data.main);

    // "/characters/:id" => Retorna un personaje matcheado por su id
    let id = null;
    apiMock
      .get((uri) => {
        id = Number(uri.split("/").pop()); // Number('undefined') => NaN
        return !!id;
      })
      .reply(200, (uri, requestBody) => {
        const character =  data.main.characters.find((c) => c.id === id) || {};
        return {...character, ship: data.main.ships.find((s) => s.name === character.name)}
      });
  });

  store = mockStore(state);

  const componentToUse = (route) => {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <App />
        </MemoryRouter>
      </Provider>
    );
  };
  describe("Nav:", () => {
    it('Debería ser renderizado en la ruta "/"', () => {
      const app = mount(componentToUse(routes[0]));
      expect(app.find(Nav)).toHaveLength(1);
    });

    it('Debería ser renderizado en la ruta "/character/:id"', () => {
      const app = mount(componentToUse(routes[1]));
      expect(app.find(Nav)).toHaveLength(1);
    });
    it('Debería ser renderizado en la ruta "/character/create"', () => {
      const app = mount(componentToUse(routes[2]));
      expect(app.find(Nav)).toHaveLength(1);
    });
  });

  describe("Home:", () => {
    it('El componente "Home" se debería renderizar solamente en la ruta "/"', () => {
      const app = mount(componentToUse(routes[0]));
      expect(app.find(CharacterDetail)).toHaveLength(0);
      expect(app.find(CreateCharacter)).toHaveLength(0);
      expect(app.find(Ships)).toHaveLength(0);
      expect(app.find(Home)).toHaveLength(1);
    });
    it('El componente "Home" no deberia mostrarse en ninguna otra ruta', () => {
      const app = mount(componentToUse(routes[0]));
      expect(app.find(Home)).toHaveLength(1);

      const app2 = mount(componentToUse(routes[1]));
      expect(app2.find(Home)).toHaveLength(0);

      const app3 = mount(componentToUse(routes[2]));
      expect(app3.find(Home)).toHaveLength(0);
    });
  });

  describe("CharacterDetail:", () => {
    it('La ruta "/character/:id" deberia mostrar solo el componente CharacterDetail', () => {
      const app = mount(componentToUse(routes[1]));
      expect(app.find(CharacterDetail)).toHaveLength(1);
      expect(app.find(Home)).toHaveLength(0);
      expect(app.find(CreateCharacter)).toHaveLength(0);
      expect(app.find(Ships)).toHaveLength(0);
    });
  });

  describe("CreateCharacter:", () => {
    it('La ruta "/character/create" deberia mostrar solo el componente CreateCharacter', () => {
      const app = mount(componentToUse(routes[2]));
      expect(app.find(CreateCharacter)).toHaveLength(1);
      expect(app.find(Nav)).toHaveLength(1);
      expect(app.find(Home)).toHaveLength(0);
      expect(app.find(Ships)).toHaveLength(0);
    });
  });
  describe("Ships:", () => {
    it("La ruta '/ships' deberia mostrar solo el componente Ships", () => {
      const app = mount(componentToUse(routes[3]));
      expect(app.find(CreateCharacter)).toHaveLength(0);
      expect(app.find(Nav)).toHaveLength(1);
      expect(app.find(Home)).toHaveLength(0);
      expect(app.find(Ships)).toHaveLength(1);
    });
  });
});
