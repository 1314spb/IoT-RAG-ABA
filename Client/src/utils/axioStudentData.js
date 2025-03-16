import axios from "axios";

const axioStudentData = async (studentId, { setLoading, setError, setAxioedData, setSelectedDate }) => {
  try {
    setLoading(true);
    setError(null);
    const response = await axios.get(`/api/students/${studentId}`);
    // const response = await axios.get("/temp_filter.json");
    
    // console.log("Axioed temp data: ", response.data);

    if (response.data.sessions.length === 0) {
      setAxioedData({ sessions: [], student_id: response.data.student_id });
    } else {
      setAxioedData(response.data);
    }
    setSelectedDate({ startDate: null, endDate: null });
  } catch (error) {
    console.error("Error fetching student data:", error);
    setError("Cannot fetch data from the server");
  } finally {
    setLoading(false);
  }

  // axios.get("/temp_filter.json")
  // axios.get(`/api/students/${studentId}`)
  //   .then(response => {
  //     console.log("Axioed temp data: ", response.data);
  //     if (response.data.sessions.length === 0) {
  //       setAxioedData({ sessions: [], student_id: response.data.student_id });
  //     } else {
  //       setAxioedData(response.data);
  //     }
  //     setSelectedDate({ startDate: null, endDate: null });
  //   })
  //   .catch(err => {
  //     console.error(err);
  //     setError("Cannot fetch data from the server");
  //   })
  //   .finally(() => setLoading(false));
};

export default axioStudentData;