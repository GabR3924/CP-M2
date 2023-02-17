import * as actions from "../src/redux/actions";
import * as data from "../db.json";

import { configure, mount } from "enzyme";

import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import CreateCharacter from "../src/components/CreateCharacter/CreateCharacter";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import configureStore from "redux-mock-store";
import isReact from "is-react";
import thunk from "redux-thunk";

configure({ adapter: new Adapter() });

jest.mock('../src/redux/actions/index', () => ({
  CREATE_CHARACTER: "CREATE_CHARACTER",
  createCharacter: (payload) => ({
    type: 'CREATE_CHARACTER',
    payload: {
      ...payload,
      id: 4
    }
  })
}))

describe("<CreateCharacter/>", () => {
  const state = { characters: data.characters };
  const mockStore = configureStore([thunk]);
  const { CREATE_CHARACTER } = actions;

  // RECUERDEN USAR FUNCTIONAL COMPONENT EN LUGAR DE CLASS COMPONENT
  beforeAll(() => expect(isReact.classComponent(CreateCharacter)).toBeFalsy());

  describe("Formulario de Creación de Personaje", () => {
    let createCharacter;
    let store = mockStore(state);
    beforeEach(() => {
      createCharacter = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/characters/create"]}>
            <CreateCharacter />
          </MemoryRouter>
        </Provider>
      );
    });

    it("Debe renderizar un formulario", () => {
      expect(createCharacter.find("form").length).toBe(1);
    });

    it('Debe renderizar un label para el nombre con el texto "Name: "', () => {
      expect(createCharacter.find("label").at(0).text()).toEqual("Name: ");
    });

    it('Debe renderizar un input de tipo text con la propiedad "name" igual a "name"', () => {
      expect(createCharacter.find('input[name="name"]').length).toBe(1);
    });

    it('Debe renderizar un label para la raza con el texto "Race:', () => {
      expect(createCharacter.find("label").at(1).text()).toBe("Race: ");
    });

    it('Debe renderizar un input de tipo text con la propiedad "name" igual a "race"', () => {
      expect(createCharacter.find('input[name="race"]').length).toBe(1);
    });
    it('Debe renderizar un label con el texto "Faction:', () => {
      expect(createCharacter.find("label").at(2).text()).toBe("Faction: ");
    });
    it('Debe renderizar un input de tipo text con la propiedad name igual a "faction"', () => {
      expect(createCharacter.find('input[name="faction"]').length).toBe(1);
    });

    it('Debe renderizar in label para el rol del personaje con el texto "Role: "', () => {
      expect(createCharacter.find("label").at(3).text()).toEqual("Role: ");
    });
    it('Debe renderizar un input de tipo text con la propiedad "name" igual a "role', () => {
      expect(createCharacter.find('input[name="role"]').length).toBe(1);
    });

    it('Debe renderizar un label para asignar la nave del personaje con el texto "Ship: "', () => {
      expect(createCharacter.find('label').at(4).text()).toEqual('Ship: ');
    });

    it('Debe renderizar un input de tipo text cona la propiedad "name" igual a "ship"', () => {
      expect(createCharacter.find('input[name="ship"]').length).toBe(1);
    });

    it('Debería renderizar un input de button submit y con texto "Create Character"', () => {
      expect(createCharacter.find('button[type="submit"]').length).toBe(1);
      expect(createCharacter.find('button[type="submit"]').text()).toBe(
        "Create Character"
      );
    });
  });

  describe("Manejo de estados locales", () => {
    let useState, useStateSpy, createCharacter;
    let store = mockStore(state);
    beforeEach(() => {
      useState = jest.fn();
      useStateSpy = jest.spyOn(React, "useState");
      useStateSpy.mockImplementation((initialState) => [
        initialState,
        useState,
      ]);

      createCharacter = mount(
        <Provider store={store}>
          <CreateCharacter />
        </Provider>
      );
    });

    // Revisen bien que tipo de dato utilizamos en cada propiedad.
    it("Deberia inicializar de forma correcta los valores del useState", () => {
      expect(useStateSpy).toHaveBeenCalledWith({
        name: "",
        race: "",
        role: "",
        faction: "",
        ship: {
          name: ""
        }
      });
    });

    describe("Name input", () => {
      it('Debe reconocer cuando hay un cambio en el valor del input "name"', () => {
        createCharacter.find('input[name="name"]').simulate("change", {
          target: { name: "name", value: "Chewbacca" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "Chewbacca",
          race: "",
          role: "",
          faction: "",
          ship: {
            name: ""
          }
        });

        createCharacter.find('input[name="name"]').simulate("change", {
          target: { name: "name", value: "The Emperor" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "The Emperor",
          race: "",
          role: "",
          faction: "",
          ship: {
            name: ""
          }
        });
      });
    });

    describe("Race input", () => {
      it('Debe reconocer cuando hay un cambio en el valor del input "Race"', () => {
        createCharacter.find('input[name="race"]').simulate("change", {
          target: { name: "race", value: "Wookie" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "Wookie",
          role: "",
          faction: "",
          ship: {
            name: ""
          }
        });

        createCharacter.find('input[name="race"]').simulate("change", {
          target: { name: "race", value: "Ewok" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "Ewok",
          role: "",
          faction: "",
          ship: {
            name: ""
          }
        });
      });
    });

    describe("Role input", () => {
      it('Debe reconocer cuando hay un cambio en el valor del input "role"', () => {
        createCharacter.find('input[name="role"]').simulate("change", {
          target: { name: "role", value: "Sith" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "",
          role: "Sith",
          faction: "",
          ship: {
            name: ""
          }
        });

        createCharacter.find('input[name="role"]').simulate("change", {
          target: { name: "role", value: "Padawan" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "",
          role: "Padawan",
          faction: "",
          ship: {
            name: ""
          }
        });
      });
    });

    describe("Faction input", () => {
      it('Debe reconocer cuando hay un cambio en el valor del input "faction"', () => {
        createCharacter.find('input[name="faction"]').simulate("change", {
          target: { name: "faction", value: "The Empire" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "",
          role: "",
          faction: "The Empire",
          ship: {
            name: ""
          }
        });

        createCharacter.find('input[name="faction"]').simulate("change", {
          target: { name: "faction", value: "Hutt Clan" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "",
          role: "",
          faction: "Hutt Clan",
          ship: {
            name: ""
          }
        });
      });
    });
    describe("Ship input", () => {
      it("Debe reconocer cuando hay un cambio en el valor del input 'ship'", () => {
        createCharacter.find('input[name="ship"]').simulate("change", {
          target: { name: "ship", value: "Y-Wing" }
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "",
          role: "",
          faction: "",
          ship: {
            name: "Y-Wing"
          }
        });
        createCharacter.find('input[name="ship"]').simulate("change", {
          target: { name: "ship", value: "Tie Interceptor" },
        });
        expect(useState).toHaveBeenCalledWith({
          name: "",
          race: "",
          role: "",
          faction: "",
          ship: {
            name: "Tie Interceptor"
          }
        });
      });
    });
  });

  describe("Dispatch al store", () => {
    // 🚨IMPORTANTE TRABAJAMOS CON LA REFERENCIA DE LAS ACTIONS LA IMPORTACION DE LAS ACTIONS DEBE SER DE LA SIGUIENTE MANERA🚨
    // import * as actions from "./../../redux/actions/index";

    let createCharacter, useState, useStateSpy;
    let store = mockStore(state);

    beforeEach(() => {
      useState = jest.fn();
      useStateSpy = jest.spyOn(React, "useState");
      useStateSpy.mockImplementation((initialState) => [
        initialState,
        useState,
      ]);
      store = mockStore(state, actions.createCharacter);
      store.clearActions();
      createCharacter = mount(
        <Provider store={store}>
          <MemoryRouter initialEntries={["/characters/create"]}>
            <CreateCharacter />
          </MemoryRouter>
        </Provider>
      );
    });

    afterEach(() => jest.restoreAllMocks());

    it("Debe disparar la acción createCharacter con los datos del state cuando se haga submit del form.", () => {
      const createCharacterSpy = jest.spyOn(actions, "createCharacter");
      createCharacter.find("form").simulate("submit");
      expect(store.getActions()).toEqual([
        {
          type: CREATE_CHARACTER,
          payload: {
            name: "",
            race: "",
            role: "",
            faction: "",
            ship: {
              name: ""
            },
            id: 4,
          },
        },
      ]);
      expect(CreateCharacter.toString().includes("useDispatch")).toBe(true);
      // Para que este test funcione, recordar importar las actions como object modules!
      expect(createCharacterSpy).toHaveBeenCalled();
    });

    it('Debe evitar que se refresque la página luego de hacer submit con el uso del evento "preventDefault"', () => {
      const event = { preventDefault: () => {} };
      jest.spyOn(event, "preventDefault");
      createCharacter.find("form").simulate("submit", event);
      expect(event.preventDefault).toBeCalled();
    });
  });
});
