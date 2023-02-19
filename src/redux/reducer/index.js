// Importa las action types acá
const initialState = {
  characters: [],
  characterDetail: {},
  ships: [],
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    // Acá va tu código:
    case GET_CHARACTERS:
            return{
                ...state,
                Characters:action.payload
            }

    case GET_CHARACTER_DETAIL:
            return{
                ...state,
                Characters:action.payload
              }        

    default:
            return state;
  }
};

export default rootReducer;
