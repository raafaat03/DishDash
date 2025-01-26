const apiKey = process.env.API_KEY;

export const searchRecipes = async (searchTerm: string, page: number) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/complexSearch");

  const queryParams = {
    apiKey,
    query: searchTerm,
    number: "10",
    offset: (page * 10).toString(),
  };
  url.search = new URLSearchParams(queryParams).toString();

  try {
    const searchResponse = await fetch(url.toString());
    if (!searchResponse.ok) {
      throw new Error(`Error fetching recipes: ${searchResponse.statusText}`);
    }
    const resultsJson = await searchResponse.json();
    return resultsJson;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getRecipeSummary = async (recipeId: string) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL(`https://api.spoonacular.com/recipes/${recipeId}/summary`);
  const params = {
    apiKey: apiKey,
  };
  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Error fetching recipe summary: ${response.statusText}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getFavouriteRecipesByIDs = async (ids: string[]) => {
  if (!apiKey) {
    throw new Error("API Key not found");
  }

  const url = new URL("https://api.spoonacular.com/recipes/informationBulk");
  const params = {
    apiKey: apiKey,
    ids: ids.join(","),
  };
  url.search = new URLSearchParams(params).toString();

  try {
    const searchResponse = await fetch(url.toString());
    if (!searchResponse.ok) {
      throw new Error(`Error fetching favourite recipes: ${searchResponse.statusText}`);
    }
    const json = await searchResponse.json();
    return { results: json };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
