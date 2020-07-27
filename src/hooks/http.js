import { useReducer, useCallback } from "react";

const initState = {
  loading: false,
  error: null,
  data: null,
  extra: null,
  identifier: null,
};

const httpReducer = (currentHttpState, action) => {
  switch (action.type) {
    case "SEND":
      return {
        ...currentHttpState,
        loading: true,
        data: null,
        extra: null,
        identifier: action.identifier,
      };
    case "RESPONSE":
      return {
        ...currentHttpState,
        loading: false,
        data: action.responseData,
        extra: action.extra,
      };
    case "ERROR":
      return { ...currentHttpState, loading: false, error: action.errorMessage };
    case "CLEAR":
      return initState;
    default:
      throw new Error("[HttpReducer] Should not be reached!");
  }
};

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, initState);

  const sendRequest = useCallback((url, method, body, extra, identifier) => {
    dispatchHttp({ type: "SEND", identifier: identifier });
    fetch(url, {
      method: method,
      body: body,
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((responseData) =>
        dispatchHttp({ type: "RESPONSE", responseData: responseData, extra: extra })
      )
      .catch((error) => dispatchHttp({ type: "ERROR", errorMessage: error.message }));
  }, []);

  const clear = useCallback(() => dispatchHttp({ type: "CLEAR" }), []);

  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest: sendRequest,
    reqExtra: httpState.extra,
    reqIdentifier: httpState.identifier,
    clear: clear,
  };
};

export default useHttp;
