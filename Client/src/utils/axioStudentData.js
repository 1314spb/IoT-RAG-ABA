// axioStudentData.js
import axios from "axios";

/**
 * @param {number} studentId
 * @param {object} callbacks
 * @param {function} callbacks.setLoading
 * @param {function} callbacks.setError
 * @param {function} callbacks.setAxioedData
 * @param {function} callbacks.setSelectedDate
 */
export const axioStudentData = (studentId, { setLoading, setError, setAxioedData, setSelectedDate }) => {
  setLoading(true);
  setError(null);

  // axios.get("/temp_filter.json")
  axios.get(`/api/students/${studentId}`)
    .then(response => {
      console.log("Axioed temp data: ", response.data);
      if (response.data.sessions.length === 0) {
        setAxioedData({ sessions: [], student_id: response.data.student_id });
      } else {
        
        setAxioedData(response.data);
      }
      setSelectedDate({ startDate: null, endDate: null });
    })
    .catch(err => {
      console.error(err);
      setError("Cannot fetch data from the server");
    })
    .finally(() => setLoading(false));
};