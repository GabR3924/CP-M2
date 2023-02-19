import React from "react";
// Importar las actions como Object Modules, sino los test no funcionarán!

// Fijense en los test que SI O SI tiene que ser un functional component, de otra forma NO VAN A PASAR LOS TEST
// Deben usar Hooks para que los test pasen.
// No realicen un destructuring de ellos, sino que utilicenlos de la siguiente forma 'React.useState' y 'React.useEffect' ,
// Si no lo hacen asi los test no van a correr.

const CreateCharacter = () => {
  return (
    <div>
        <form >
        <label htmlFor="name">Name: </label>
          <input type="text" name="name" />

          <label htmlFor="race">Race: </label>
          <input type="text" name="race" />

          <label htmlFor="faction">Faction: </label>
          <input type="text" name="faction" />

          <label htmlFor="role">Role: </label>
          <input type="text" name="role" />

          <label htmlFor="ship">Ship: </label>
          <input type="text" name="ship" />

          <button type="submit">Create Character</button>
          
        </form>
    </div>
  );
};


export default CreateCharacter;
