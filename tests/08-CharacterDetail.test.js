import React from "react";
import { configure, mount } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import { MemoryRouter } from "react-router-dom";
import * as ReactRedux from "react-redux";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";
import isReact from "is-react";

import CharacterDetail from "../src/components/CharacterDetail/CharacterDetail";
import * as data from "../db.json";
import * as actions from "../src/redux/actions";
import axios from "axios";
import nock from "nock";
import nodeFetch from "node-fetch";
axios.defaults.adapter = require("axios/lib/adapters/http");

configure({ adapter: new Adapter() });

jest.mock('../src/redux/actions/index', () => ({
  getCharacterDetail: () => ({
    type: 'GET_CHARACTER_DETAIL'
  })
}));

describe("<CharacterDetail />", () => {
  global.fetch = nodeFetch;
  let characterDetail, useSelectorStub, useSelectorFn, useEffect;
  const noChar = {
    id: 1,
    name: "The Mandalorian",
    race: "Human",
    role: "Bounty Hunter",
    faction: "None",
    image: "https://static.wikia.nocookie.net/esstarwars/images/2/29/MandoS2PosterES.jpg/revision/latest/scale-to-width-down/337?cb=20201001205530",
    ship: {
      name: "Razor Crest",
      image: "https://static.wikia.nocookie.net/starwars/images/2/2e/RazorCrest-TSWB.png/revision/latest/scale-to-width-down/500?cb=20210727042448"
    },
  };

  const match = (id) => ({
    params: { id },
    isExact: true,
    path: "/characters/:id",
    url: `/characters/${id}`,
  });
  const mockStore = configureStore([thunk]);

  const store = (id) => {
    let state = {
      characters: data.characters.concat(noChar),
      characterDetail: id !== 10 ? data.characters[id - 1] : data.characters.concat(noChar),
    };
    return mockStore(state);
  };
  // Si o si vas a tener que usar functional component! No van a correr ninguno de los tests si no lo haces!
  // También fijate que vas a tener que usar algunos hooks. Tanto de React como de Redux!
  // Los hooks de React si o si los tenes que usar "React.useState", "React.useEffect". El test no los reconoce
  // cuando se hace destructuring de estos métodos === test no corren.
  beforeAll(() => expect(isReact.classComponent(CharacterDetail)).toBeFalsy());
  const mockUseEffect = () => useEffect.mockImplementation((fn) => fn());

  beforeEach(() => {
    // Se Mockea las request a las api
    const apiMock = nock("http://localhost:3001").persist();

    // "/characters" => Retorna la propiedad characters del archivo data.json
    apiMock.get("/characters").reply(200, data.characters);

    // "/characters/:id" => Retorna un personaje matcheado por su id

    let id = null;
    apiMock
      .get((uri) => {
        id = Number(uri.split("/").pop()); // Number('undefined') => NaN
        return !!id;
      })
      .reply(200, (uri, requestBody) => {
        return data.characters.find((c) => c.id === id) || {};
      });
    useSelectorStub = jest.spyOn(ReactRedux, "useSelector");
    useSelectorFn = (id) =>
      useSelectorStub.mockReturnValue(store(id).getState().characterDetail);
    useEffect = jest.spyOn(React, "useEffect");
    characterDetail = (id) =>
      mount(
        <ReactRedux.Provider store={store(id)}>
          <MemoryRouter initialEntries={[`/characters/${id}`]}>
            <CharacterDetail match={match(id)} />
          </MemoryRouter>
        </ReactRedux.Provider>
      );
    mockUseEffect();
    mockUseEffect();
  });

  afterEach(() => jest.restoreAllMocks());

  it("Debería usar un useEffect y dentro de este, despachar la acción getCharacterDetail, pasandole como argumento el ID del personaje a renderizar", async () => {
    // 🚨IMPORTANTE TRABAJAMOS CON LA REFERENCIA DE LAS ACTIONS LA IMPORTACION DE LAS ACTIONS DEBE SER DE LA SIGUIENTE MANERA🚨
    // Nuevamente testeamos todo el proceso. Tenes que usar un useEffect, y despachar la acción "getChracterDetail".
    const useDispatch = jest.spyOn(ReactRedux, "useDispatch");
    const getCharacterDetail = jest.spyOn(actions, "getCharacterDetail");
    characterDetail(1);
    expect(useEffect).toHaveBeenCalled();
    expect(useDispatch).toHaveBeenCalled();
    // Para que este test funcione, es necesario importar las actions como object modules!
    expect(getCharacterDetail).toHaveBeenCalled();

    characterDetail(2);
    expect(useEffect).toHaveBeenCalled();
    expect(useDispatch).toHaveBeenCalled();
    expect(getCharacterDetail).toHaveBeenCalled();
  });

  describe('Debería recibir por props el objeto "match". Utilizar el "id" de "params" para despachar la action "getCharacterDetail"', () => {
    const character = data.characters[0];
    it("Deberia renderizar el name del personaje.", () => {
      useSelectorFn(1);
      expect(characterDetail(1).text().includes(character.name)).toEqual(true);
      expect(useSelectorStub).toHaveBeenCalled();
      expect(useEffect).toHaveBeenCalled();
    });
    it("Deberia renderizar la facción del personaje.", () => {
      useSelectorFn(1);
      expect(characterDetail(1).text().includes(character.faction)).toEqual(true);
      expect(useSelectorStub).toHaveBeenCalled();
      expect(useEffect).toHaveBeenCalled();
    });
    it("Deberia renderizar el rol del personaje.", () => {
      useSelectorFn(1);
      expect(characterDetail(1).text().includes(character.role)).toEqual(true);
      expect(useSelectorStub).toHaveBeenCalled();
      expect(useEffect).toHaveBeenCalled();
    });
    it("Deberia renderizar la raza del personaje.", () => {
      useSelectorFn(1);
      expect(characterDetail(1).text().includes(character.race)).toEqual(true);
      expect(useSelectorStub).toHaveBeenCalled();
      expect(useEffect).toHaveBeenCalled();
    });
    it("Debería renderizar la imagen de cada personaje y un alt con el nombre del mismo", () => {
      expect(characterDetail(1).find("img").at(0).prop("src")).toBe(character.image);
      expect(characterDetail(1).find("img").at(0).prop("alt")).toBe(character.name);
    });
    it("Debería renderizar el nombre de la nave", () => {
      expect(characterDetail(1).text().includes(character.ship.name)).toEqual(true);
    })
    it("Debería renderizar la imagen de la nave y su atributo 'alt' como el nombre de la misma", () => {
      expect(characterDetail(1).find("img").at(1).prop("src")).toEqual(character.ship.image);
      expect(characterDetail(1).find("img").at(1).prop("alt")).toEqual(character.ship.name)
    })
  });
});
