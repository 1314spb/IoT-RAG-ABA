import axios from "axios";

const taskOnSave = async (
  editedTask,
  setAxioedData,
  setEditingTaskIds,
  setEditingData
) => {
  const taskId = editedTask.id;

  try {
    const response = await axios.patch(`/api/taskOnSave/${taskId}`, editedTask);
    console.log("Task updated on server:", response.data);

    setAxioedData((prevData) => {
      const updatedSessions = prevData.sessions.map((task) =>
        task.id === taskId ? { ...task, ...editedTask } : task
      );
      return { ...prevData, sessions: updatedSessions };
    });

    setEditingTaskIds((prev) => prev.filter((id) => id !== taskId));
    setEditingData((prev) => {
      const newEditingData = { ...prev };
      delete newEditingData[taskId];
      return newEditingData;
    });
  } catch (error) {
    console.error("Error updating task:", error);
    alert("Failed to update task. Please try again later.");
  }
};

export default taskOnSave;