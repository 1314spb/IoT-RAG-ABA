import axios from 'axios';

const axioGenerate = async (payload) => {
  try {
    // console.log("payload:", payload);
    console.log("Hello from axioGenerate.js");
    console.log("payload:", payload);
    const response = await axios.post('/api/generate', payload);
    // const response = await axios.post('/temp_generate_res.json');

    console.log("response.data (from axioGenerate.js):", response.data);
    return response.data;
  } catch (err) {
    console.error(err);
  }
}

export default axioGenerate;