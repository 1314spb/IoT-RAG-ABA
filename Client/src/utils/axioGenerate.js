import axios from 'axios';

const axioGenerate = async ({ payload }) => {
  try {
    console.log("payload:", payload);

    const response = await axios.post('/api/generate', payload);

    console.log("response.data:", response.data);
    return response.data;
  } catch (err) {
    console.error(err);
  }
}

export default axioGenerate;