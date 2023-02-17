import rootReducer from "../src/redux/reducer";
import {
  createCharacter,
  deleteCharacter,
  GET_CHARACTERS,
  GET_CHARACTER_DETAIL,
  GET_SHIPS,
} from "../src/redux/actions";
import * as data from "../db.json";

// Acá se mockean las actions para que el test pueda funcionar correctamente, sin importar si hay un bug en ese archivo
jest.mock('../src/redux/actions', () => ({
  __esmodules: true,
  GET_CHARACTERS: 'GET_CHARACTERS',
  DELETE_CHARACTER: 'DELETE_CHARACTER',
  GET_CHARACTER_DETAIL: 'GET_CHARACTER_DETAIL',
  GET_SHIPS: 'GET_SHIPS',
  CREATE_CHARACTER: 'CREATE_CHARACTER',
  createCharacter: (payload) => ({
    type: "CREATE_CHARACTER",
    payload
  }),
  deleteCharacter: (payload) => ({
    type: "DELETE_CHARACTER",
    payload
  }),
  getCharacterDetail: (payload) => ({
    type: 'GET_CHARACTER_DETAIL',
    payload
  }) 
}));

describe("Reducer", () => {
  const state = {
    characters: [],
    ships: [],
    characterDetail: {},
  };

  it("Debería retornar el estado inicial si no se pasa un type válido", () => {
    expect(rootReducer(undefined, [])).toEqual({
      characters: [],
      ships: [],
      characterDetail: {},
    });
  });

  it('Debería guardar en nuestro state los personajes obtenidos de nuestro llamado al back cuando action type es "GET_CHARACTERS"', () => {
    const result = rootReducer(state, {
      type: GET_CHARACTERS,
      payload: data.characters,
    });
    // Acuerdense que el state inicial no tiene que mutar!
    expect(result).not.toEqual(state);
    expect(result).toEqual({
      characters: data.characters, // Cuando ejecutes los tests, vas a ver bien lo que espera que le llegue a nuestro estado!
      ships: [],
      characterDetail: {},
    });
  });

  it('Debería guardar en nuestro state el personaje obtenido de nuestro llamado al back cuando action type es "GET_CHARACTER_DETAIL"', () => {
    const result = rootReducer(state, {
      type: GET_CHARACTER_DETAIL,
      payload: data.characters[0],
    });
    // Acuerdense que el state inicial no tiene que mutar!
    expect(result).not.toEqual(state);
    expect(result).toEqual({
      characters: [],
      characterDetail: data.characters[0],
      ships: [],
    });
  });

  it('Debería crear un nuevo personaje y guardarlo en nuestro estado de "character" cuando action type es "CREATE_CHARACTER"', () => {
    const state = {
      characters: data.characters,
      ships: [],
      characterDetail: {},
    };

    const payload1 = {
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
    };

    const payload2 = {
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
    };

    const allCharactersType1 = [
      ...data.characters,
      {
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
    ];
    const allCharactersType2 = [
      ...allCharactersType1,
      {
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
    ];
    const firstChar = rootReducer(state, createCharacter(payload1));
    const secondChar = rootReducer(
      { ...state,  characters: allCharactersType1 },
      createCharacter(payload2)
    );

    // Acuerdense que el state inicial no tiene que mutar!
    expect(firstChar).not.toEqual(state);
    expect(secondChar).not.toEqual(state);

    expect(firstChar).toEqual({
      characters: allCharactersType1,
      ships: [],
      characterDetail: {},
    });
    expect(secondChar).toEqual({
      characterDetail: {},
      characters: allCharactersType2,
      ships: [],
    });
  });

  it('Debería eliminar un personaje de nuestro store cuando action type es "DELETE_CHARACTER"', () => {
    // Caso 1
    const payload = 4;
    const state = {
      characters: [
        {
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
        }
      ],
      characterDetail: {},
      ships: [],
    };
    
    expect(rootReducer(state, deleteCharacter(payload))).toEqual({
      characters: [],
      characterDetail: {},
      ships: [],
    });

    //Caso 2
    const payload2 = 4;
    const state2 = {
      characters: [
        {
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
        {
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
      ],
      characterDetail: {},
      ships: [],
    };

    expect(rootReducer(state2, deleteCharacter(payload2))).toEqual({
      characters: [
        {
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
      ],
      characterDetail: {},
      ships: [],
    });
  });

  it('Debería guardar en nuestro state "ships" la informacion que viene del payload cuando action type es "GET_SHIPS"', () => {
    const payload = [data.characters[0].ship, data.characters[1]];

    const result = rootReducer(state, {
      type: GET_SHIPS,
      payload: payload,
    });
    // Acuerdense que el state inicial no tiene que mutar!
    expect(result).not.toEqual(state);
    expect(result).toEqual({
      characters: [],
      characterDetail: {},
      ships: payload,
    });
  });
});
