const { default: axios } = require("axios");

const api = axios.create({
  baseURL: process.env.URL_SANTA_JOANA,
});

export default api 
