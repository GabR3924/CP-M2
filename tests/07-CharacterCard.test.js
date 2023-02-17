import * as actions from "../src/redux/actions/index";
import * as data from "../db.json";

import { Link, MemoryRouter } from "react-router-dom";
import { configure, mount } from "enzyme";

import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import CharacterCardConnected from "../src/components/CharacterCard/CharacterCard";
import { Provider } from "react-redux";
import React from "react";
import configureStore from "redux-mock-store";
import thunk from "redux-thunk";

configure({ adapter: new Adapter() });

jest.mock('../src/redux/actions/index', () => ({
  deleteCharacter: () => ({
    type: 'DELETE_CHARACTER'
  })
}))

describe("<CharacterCard />", () => {
  let characterCard, state, store;
  const mockStore = configureStore([thunk]);
  let characters = data.characters;
  state = {
    characters: [],
    chracterDetail: {},
    ships: [],
  };
  store = mockStore(state);
  beforeEach(() => {
    characterCard = (c) =>
      mount(
        <Provider store={store}>
          <MemoryRouter>
            <CharacterCardConnected
              id={c.id}
              name={c.name}
              faction={c.faction}
              image={c.image}
            />
          </MemoryRouter>
        </Provider>
      );
  });

  afterEach(() => jest.restoreAllMocks());

  describe("Estructura", () => {
    it('Debería renderizar un "button" con el texto "X"', () => {
      const wrapper = characterCard(characters[0]);
      expect(wrapper.find("button").text()).toBe("X");
    });

    it('Debería renderizar un tag "h3" que muestre el "name" de cada personaje', () => {
      expect(characterCard(characters[0]).find("h3").at(0).text()).toBe("Darth Vader");
      expect(characterCard(characters[1]).find("h3").at(0).text()).toBe("Luke Skywalker");
      expect(characterCard(characters[2]).find("h3").at(0).text()).toBe("Han Solo");
    });

    it("Debería renderizar la imagen de cada personaje y un alt con el nombre del mismo", () => {
      expect(characterCard(characters[0]).find("img").prop("src")).toBe(
        characters[0].image
      );
      expect(characterCard(characters[0]).find("img").prop("alt")).toBe(characters[0].name);
      expect(characterCard(characters[1]).find("img").prop("src")).toBe(
        characters[1].image
      );
      expect(characterCard(characters[1]).find("img").prop("alt")).toBe(characters[1].name);
    });

    it('Debería renderizar un tag "p" que muestre la "faction" del personaje', () => {
      expect(characterCard(characters[0]).find("p").at(0).text()).toBe("The Empire");
      expect(characterCard(characters[1]).find("p").at(0).text()).toBe("The Rebellion");
      expect(characterCard(characters[2]).find("p").at(0).text()).toBe("The Rebellion");
    });

    it('Debería renderizar un componente <Link> que encierre el "name" de cada personaje y redirija a "/character/:id"', () => {
      // El valor de "id" lo tenes que sacar de las props, recuerda que les estas pasando una propiedad "id".
      expect(characterCard(characters[0]).find(Link)).toHaveLength(1);
      expect(characterCard(characters[0]).find(Link).at(0).prop("to")).toEqual(
        "/character/1"
      );
    });
  });

  describe("Dispatch to store", () => {
    it("Debería hacer un dispatch al store utilizando la action 'deleteCharacter' al hacer click en el boton creado para poder eliminar un personaje a través de su id", () => {
      const deleteCharacterspy = jest.spyOn(actions, "deleteCharacter");
      const characterCard = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CharacterCardConnected
              id={characters[0].id}
              name={characters[0].name}
              faction={characters[0].faction}
              image={characters[0].image}
            />
          </MemoryRouter>
        </Provider>
      );
      characterCard.find("button").simulate("click");
      // Para que estos test funcionen, recordar importar las actions como object modules!
      expect(deleteCharacterspy).toHaveBeenCalled();
      expect(deleteCharacterspy).toHaveBeenCalledWith(characters[0].id);

      const characterCard2 = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CharacterCardConnected
              id={characters[1].id}
              name={characters[1].name}
              faction={characters[1].faction}
              image={characters[1].image}
            />
          </MemoryRouter>
        </Provider>
      );
      characterCard2.find("button").simulate("click");
      expect(deleteCharacterspy).toHaveBeenCalled();
      expect(deleteCharacterspy).toHaveBeenCalledWith(characters[1].id);
    });
  });
});
