import * as actions from "../src/redux/actions";
import * as data from "../db.json";
import ShipCard from "../src/components/ShipCard/ShipCard";
import Ships from "../src/components/Ships/Ships";
import { configure, mount, shallow } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import * as ReactRedux from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import axios from "axios";
import configureStore from "redux-mock-store";
import isReact from "is-react";
import nock from "nock";
import nodeFetch from "node-fetch";
import thunk from "redux-thunk";

axios.defaults.adapter = require("axios/lib/adapters/http");

configure({ adapter: new Adapter() });

// Acá se mockea la action para que el test pueda funcionar correctamente, sin importar si hay un bug en ese archivo
jest.mock('../src/redux/actions/index.js', () => ({
  getShips: () => ({
    type: 'GET_SHIPS',
  })
}))
describe("<Home />", () => {
  beforeAll(() => {
     // Si o si vas a tener que usar functional component para el componente Ships! No van a pasar ninguno de los tests si no lo haces.
     // Si o si vas a tener que usar class component para el componente ShipCard! No van a pasar ninguno de los tests si no lo haces.
     expect(isReact.classComponent(Ships)).toBeFalsy();
     expect(isReact.classComponent(ShipCard)).toBeTruthy();
  })
  let ships, shipCard, useEffect, useSelectorFn, useSelectorStub;
  global.fetch = nodeFetch;
  const ship = data.characters.map((c) => ({ name: c.ship.name, image: c.ship.image }))
  const mockStore = configureStore([thunk]);
  const store = () => {
    let state = {
      characters: {},
      characterDetail: {},
      ships: ship
    };
    return mockStore(state);
  };
  beforeEach(() => {
    // Se Mockea las request a las api
    const apiMock = nock("http://localhost:3001").persist();

    // "/characters" => Retorna la propiedad characters del archivo data.json
    apiMock.get("/characters").reply(200, data.characters);

    // "/characters/:id" => Retorna una personaje matcheado por su id
    // "/characters/:id" => Retorna una personaje matcheado por su id
    let id = null;
    apiMock
      .get((uri) => {
        id = Number(uri.split("/").pop()); // Number('undefined') => NaN
        return !!id;
      })
      .reply(200, (uri, requestBody) => {
        return data.characters.find((char) => char.id === id) || {};
      });
    const mockUseEffect = () => useEffect.mockImplementation((fn) => fn());
    useSelectorStub = jest.spyOn(ReactRedux, "useSelector");
    useSelectorFn = () => useSelectorStub.mockReturnValue(store().getState().ships);
    useEffect = jest.spyOn(React, "useEffect");
    ships = () => mount(
      <ReactRedux.Provider store={store()}>
        <MemoryRouter initialEntries={['/ships']}>
          <Ships />
        </MemoryRouter>
      </ReactRedux.Provider>
    );
    shipCard = (s) => mount(
      <ReactRedux.Provider store={store()}>
        <MemoryRouter>
          <ShipCard name={s.name} image={s.image}/>
        </MemoryRouter>
      </ReactRedux.Provider>
    )
    mockUseEffect();
    mockUseEffect();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.restoreAllMocks();
  });

  it("Ships - Deberia usar un useEffect y dentro de este, despachar la action getShips", () => {
    const useDispatch = jest.spyOn(ReactRedux, "useDispatch");
    // 🚨IMPORTANTE TRABAJAMOS CON LA REFERENCIA DE LAS ACTIONS, LA IMPORTACION DE LAS ACTIONS DEBE SER DE LA SIGUIENTE MANERA🚨
    // import * as actions from "../src/redux/actions";
    const getShips = jest.spyOn(actions, "getShips");
    ships();
    expect(useEffect).toHaveBeenCalled();
    expect(useDispatch).toHaveBeenCalled();
    expect(getShips).toHaveBeenCalled();
  });
  
  it('Ships - Debería rederizar un "h1" con el texto "The most iconic Ships!"', () => {
    expect(ships().find("h1").at(0).text()).toEqual("The most iconic Ships!");
  });

  it("Ships - Deberia renderizar las naves una vez montado el componente y cargado el store", () => {
    useSelectorFn();
    const mountedShips = ships();
    expect(mountedShips.find(ShipCard).at(0).props().name).toEqual("Tie Fighter");
    expect(mountedShips.find(ShipCard).at(1).props().name).toEqual("Millenium Falcon");
    expect(mountedShips.find(ShipCard).at(2).props().name).toEqual("X-Wing");
    expect(mountedShips.find(ShipCard).at(0).props().image).toEqual("https://lumiere-a.akamaihd.net/v1/images/vaders-tie-fighter_8bcb92e1.jpeg?region=0%2C147%2C1560%2C878&width=768");
    expect(mountedShips.find(ShipCard).at(1).props().image).toEqual("https://static.wikia.nocookie.net/esstarwars/images/8/80/X-wing_Fathead.png/revision/latest/scale-to-width-down/350?cb=20190624005938");
    expect(mountedShips.find(ShipCard).at(2).props().image).toEqual("https://static.wikia.nocookie.net/esstarwars/images/5/52/Millennium_Falcon_Fathead_TROS.png/revision/latest/scale-to-width-down/350?cb=20191220220841");
    expect(useEffect).toHaveBeenCalled();
    expect(useSelectorStub).toHaveBeenCalled();
  });

  it("ShipCard - Deberia renderizar un tag 'h3' con el nombre de la nave", () => {
    expect(shipCard(ship[0]).find("h3").at(0).text()).toEqual(ship[0].name);
    expect(shipCard(ship[1]).find("h3").at(0).text()).toEqual(ship[1].name);
    expect(shipCard(ship[2]).find("h3").at(0).text()).toEqual(ship[2].name);
  });

  it("ShipCard - Deberia renderizar un tag 'img' con la imagen de la nave", () => {
    expect(shipCard(ship[0]).find("img").prop("src")).toEqual(ship[0].image)
    expect(shipCard(ship[1]).find("img").prop("src")).toEqual(ship[1].image)
    expect(shipCard(ship[2]).find("img").prop("src")).toEqual(ship[2].image)
  });

  it("ShipCard - Deberia agregarle a cada imagen el atributo 'alt' con el nombre de la nave", () => {
    expect(shipCard(ship[0]).find("img").prop("alt")).toEqual(ship[0].name)
    expect(shipCard(ship[1]).find("img").prop("alt")).toEqual(ship[1].name)
    expect(shipCard(ship[2]).find("img").prop("alt")).toEqual(ship[2].name)
  });

});