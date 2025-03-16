import axios from 'axios';

const axioGenerate = async ({ payload }) => {
  try {
    const response = await axios.post('/api/generate', payload);
    // const response = await axios.post('/temp_generate_res.json');
  
    // console.log("response.data (from axioGenerate.js):", response.data);
    return response.data;
  } catch (err) {
    console.error(err);
  }
}

export default axioGenerate;