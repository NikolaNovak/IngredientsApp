import React, { useReducer, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import ErrorModal from "../UI/ErrorModal";
import Search from "./Search";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((currentIngredient) => currentIngredient.id !== action.id);
    default:
      throw new Error("Should not be reached!");
  }
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return { ...currentHttpState, loading: true };
    case "RESPONSE":
      return { ...currentHttpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.errorMessage };
    case "CLEAR_ERROR":
      return { ...currentHttpState, error: null };
    default:
      throw new Error("Should not be reached!");
  }
};

const Ingredients = () => {
  const [userIngredients, dispatchIngredients] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: true, error: null });

  const addIngredientHandler = (ingredient) => {
    dispatchHttp({ type: "SEND" });
    fetch("https://react-hooks-update-76b67.firebaseio.com/ingredients.json", {
      method: "POST",
      body: JSON.stringify(ingredient),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json();
      })
      .then((responseData) => {
        dispatchIngredients({ type: "ADD", ingredient: { id: responseData.name, ...ingredient } });
      })
      .catch((error) => {
        dispatchHttp({ type: "ERROR", errorMessage: error.message });
      });
  };

  const removeIngredientHandler = (ingredientId) => {
    dispatchHttp({ type: "SEND" });
    fetch(`https://react-hooks-update-76b67.firebaseio.com/ingredients/${ingredientId}.json`, {
      method: "DELETE",
    })
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        dispatchIngredients({ type: "DELETE", id: ingredientId });
      })
      .catch((error) => {
        dispatchHttp({ type: "ERROR", errorMessage: error.message });
      });
  };

  const filteredIngredientsHandler = useCallback((filteredIngredients) => {
    dispatchHttp({ type: "RESPONSE" });
    dispatchIngredients({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const clearError = () => {
    dispatchHttp({ type: "CLEAR_ERROR" });
  };

  return (
    <div className="App">
      {httpState.error && <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>}
      <IngredientForm onAddIngredient={addIngredientHandler} loading={httpState.loading} />
      <section>
        <Search onLoadIngredients={filteredIngredientsHandler} />
        <IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
      </section>
    </div>
  );
};

export default Ingredients;
