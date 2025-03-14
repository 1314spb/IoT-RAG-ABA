const cal_percent = (tasks_array) => {
  const plus_average_percent = tasks_array.filter(row => row.trialresult === "+").length / tasks_array.length;
  const minus_average_percent = tasks_array.filter(row => row.trialresult === "-").length / tasks_array.length;
  const p_average_percent = tasks_array.filter(row => row.trialresult === "P").length / tasks_array.length;
  const ot_average_percent = tasks_array.filter(row => row.trialresult === "OT").length / tasks_array.length;

  return {
    plus_average_percent,
    minus_average_percent,
    p_average_percent,
    ot_average_percent,
  };
};

module.exports = cal_percent;