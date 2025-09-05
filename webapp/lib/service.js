import axios from "axios";

const api = axios.create({
  baseURL: "./api",
});

const get = async (url, config) => {
  return  api.get(url, config);
};

const post = async (url, data, config) => {
  return  api.post(url, data, config);
};

const put = async (url, data, config) => {
  return api.put(url, data, config);
};

const del = async (url, config) => {
  return api.delete(url, config);
};

export default { get, post, put, del };