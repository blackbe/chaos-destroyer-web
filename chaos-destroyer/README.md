const getWins = async (startDate, endDate) => {
    const response = await apiService(`https://api.dominioncardgame.com/wins?start_date=${startDate}&end_date=${endDate}`, 'GET');
    return response.data;
};