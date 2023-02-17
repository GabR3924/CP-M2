/* eslint-disable jest/no-conditional-expect */

import * as data from "../db.json";

import {
  CREATE_CHARACTER,
  DELETE_CHARACTER,
  GET_CHARACTERS,
  GET_CHARACTER_DETAIL,
  GET_SHIPS,
  createCharacter,
  deleteCharacter,
  getCharacters,
  getCharacterDetail,
  getShips,
} from "../src/redux/actions";

import axios from "axios";
import configureStore from "redux-mock-store";
import nock from "nock";
import nodeFetch from "node-fetch";
import thunk from "redux-thunk";

axios.defaults.adapter = require("axios/lib/adapters/http");

describe("Actions", () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore({ characters: [] });
  global.fetch = nodeFetch;
  beforeEach(() => {
    store.clearActions();

    // Se Mockea las request a las api
    const apiMock = nock("http://localhost:3001").persist();

    // "/character" => Retorna la propiedad characters del archivo data.json
    apiMock.get("/characters").reply(200, data.characters);

    // "/character/:id" => Retorna una personaje matcheado por su id
    let id = null;
    apiMock
      .get((uri) => {
        id = Number(uri.split("/").pop()); // Number('undefined') => NaN
        return !!id;
      })
      .reply(200, (uri, requestBody) => {
        return data.characters.find((c) => c.id === id) || {};
      });
  });

  afterEach(() => {
    nock.cleanAll();
  });

    it("getCharacters - Debería hacer un dispatch con las propiedades type GET_CHARACTERS y como payload, el resultado del fetch al link provisto", async () => {
      return store
        .dispatch(getCharacters())
        .then(() => {
          const actions = store.getActions();
          expect(actions[0].payload.length).toBe(3);
          expect(actions[0]).toEqual({
            type: GET_CHARACTERS,
            payload: data.characters,
          });
        })
        .catch((err) => {
          // En caso de que haya un error al mandar la petición al back, el error entrara aquí. Podrás visualizarlo en la consola.

          console.error(err);
          expect(err).toBeUndefined();
        });
    });

    it("getCharacterDetail - Debería hacer un dispatch con las propiedades type GET_CHARACTER_DETAIL y como payload, el resultado del fetch al link provisto", async () => {
      const payload = data.characters[Math.floor(Math.random() * data.characters.length)];
      return store
        .dispatch(getCharacterDetail(payload.id))
        .then(() => {
          const actions = store.getActions();
          expect(actions[0]).toStrictEqual({
            type: GET_CHARACTER_DETAIL,
            payload: { ...payload },
          });
        })
        .catch((err) => {
          // El catch lo utilizamos para "agarrar" cualquier tipo de errores a la hora de hacer la petición al back. Solo va a entrar si el test no sale como es pedido.
          // Para ver que está pasando deberías revisar la consola.
          console.error(err);
          expect(err).toBeUndefined();
        });
    });

    it("getCharacterDetail - Debería traer una personaje distinta si el id requerido es otro (evitar hardcodeos)", async () => {
      const payload = data.characters[1];
      return store
        .dispatch(getCharacterDetail(payload.id))
        .then(() => {
          const actions = store.getActions();
          expect(actions[0]).toStrictEqual({
            type: GET_CHARACTER_DETAIL,
            payload: { ...payload },
          });
        })
        .catch((err) => {
          // El catch lo utilizamos para "agarrar" cualquier tipo de errores a la hora de hacer la petición al back. Solo va a entrar si el test no sale como es pedido.
          // Para ver que está pasando deberías revisar la consola.
          console.error(err);
          expect(err).toBeUndefined();
        });
  });

    it('createCharacter - Debería retornar una action con las propiedades type CREATE_CHARACTER y payload: contiene los values recibidos como argumento y un ID incremental en la action "createCharacter"', () => {
      // Para que este test pase, deberan declarar una variable id que su valor inicialice en 4. Lo hacemos para que no haya conflicto entre los id's que nosotros ya tenemos.
      // Si revisan el archivo db.json verán la lista de personajes.
      const payload1 = {
        name: "Boba Fett",
        race: "Clone",
        role: "Bounty Hunter",
        faction: "Hutt Clan",
        image: "https://pics.filmaffinity.com/Uno_de_los_nuestros-657659084-large.jpg",
        ship: {
          name: "Slave I",
          image: "https://bbts1.azureedge.net/images/p/full/2020/01/3762d250-aea8-441d-8c64-9b8d8e129b20.jpg"
        },
      };
      const payload2 = {
        name: "The Mandalorian",
        race: "Human",
        role: "Bounty Hunter",
        faction: "None",
        image: "https://static.wikia.nocookie.net/esstarwars/images/2/29/MandoS2PosterES.jpg/revision/latest/scale-to-width-down/337?cb=20201001205530",
        ship: {
          name: "Razor Crest",
          image: "https://static.wikia.nocookie.net/starwars/images/2/2e/RazorCrest-TSWB.png/revision/latest/scale-to-width-down/500?cb=20210727042448"
        }
      };

      expect(createCharacter(payload1)).toEqual({
        type: CREATE_CHARACTER,
        payload: {
          id: 4,
          name: "Boba Fett",
          race: "Clone",
          role: "Bounty Hunter",
          faction: "Hutt Clan",
          image: "https://pics.filmaffinity.com/Uno_de_los_nuestros-657659084-large.jpg",
          ship: {
            name: "Slave I",
            image: "https://bbts1.azureedge.net/images/p/full/2020/01/3762d250-aea8-441d-8c64-9b8d8e129b20.jpg"
          },
        },
      });

      expect(createCharacter(payload2)).toEqual({
        type: "CREATE_CHARACTER",
        payload: {
          id: 5,
          name: "The Mandalorian",
          race: "Human",
          role: "Bounty Hunter",
          faction: "None",
          image: "https://static.wikia.nocookie.net/esstarwars/images/2/29/MandoS2PosterES.jpg/revision/latest/scale-to-width-down/337?cb=20201001205530",
          ship: {
            name: "Razor Crest",
            image: "https://static.wikia.nocookie.net/starwars/images/2/2e/RazorCrest-TSWB.png/revision/latest/scale-to-width-down/500?cb=20210727042448"
          }
        },
      });
  });

    it("deleteCharacter - Debería retornar una action con las propiedades type DELETE_CHARACTER y como payload el id de la personaje a eliminar. Recibe el id por argumento", () => {
      expect(deleteCharacter(1)).toEqual({ type: DELETE_CHARACTER, payload: 1 });
      expect(deleteCharacter(2)).toEqual({ type: DELETE_CHARACTER, payload: 2 });
  });

  // Acá deben hacer un map() de data.characters y devolver la propiedad 'ship' de cada objeto
  it("getShips - Debería retornar una action con las propiedades type GET_SHIPS y obtener como payload las naves de los personajes", () => {
    const payload1 = [data.characters[0].ship, data.characters[1].ship, data.characters[2].ship];
    return store
    .dispatch(getShips())
    .then(() => {
      const actions = store.getActions();
      expect(actions[0].payload.length).toBe(3);
      expect(actions[0]).toEqual({
        type: GET_SHIPS,
        payload: payload1,
      });
    })
    .catch((err) => {
      // En caso de que haya un error al mandar la petición al back, el error entrara aquí. Podrás visualizarlo en la consola.
      console.error(err);
      expect(err).toBeUndefined();
    });
  });
});
