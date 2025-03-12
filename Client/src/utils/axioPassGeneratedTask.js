import axios from 'axios';

export const axioPassGeneratedTask = async ({ setLoading, setError, setTasks, student_id }) => {
  setLoading(true);
  setError(null);
  try {
    // console.log("Hello from axioPassGeneratedTask");
    // const response = await axios.get('/temp_past_generated_tasks.json');
    const response = await axios.get(`/api/past_gen_tasks?student_id=${student_id}`);

    console.log("response.data:", response.data);
    const sortedTasks = response.data.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setTasks(sortedTasks);
  } catch (err) {
    console.error(err);
    setError('Cannot connect to server');
  } finally {
    setLoading(false);
  }
};