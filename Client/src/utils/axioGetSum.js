import axios from 'axios';

const axioGetSum = async ({ student_id, setSum }) => {
  try {
    console.log("student_id:", student_id);
    const response = await axios.get(`/api/task_sum?student_id=${student_id}`);
    // const response = await axios.get("/temp_sum.json");
    console.log("response.data:", response.data);
    setSum(response.data);
    
  } catch (err) {
    console.error(err);
  } finally {
    // console.log("AxioGetSum done");
  }
}

export default axioGetSum;