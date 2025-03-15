const cal_sum = (tasks_array) => {
  const plus_sum = tasks_array.filter(row => row.trialresult === "+").length;
  const minus_sum = tasks_array.filter(row => row.trialresult === "-").length;
  const p_sum = tasks_array.filter(row => row.trialresult === "P").length;
  const ot_sum = tasks_array.filter(row => row.trialresult === "OT").length;
  
  return {
    plus_sum,
    minus_sum,
    p_sum,
    ot_sum,
  };
};

module.exports = cal_sum;