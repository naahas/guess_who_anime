const { createClient } = require ('@clickhouse/client')



const bdd = createClient({
    url: 'https://kmwqw7w4h7.germanywestcentral.azure.clickhouse.cloud:8443',
    username: 'default',
    password: '_wLdyBztU9gz7',
    format: 'json', 
});





async function getAllQuestions() {
    try {
        const query = 'SELECT * FROM questions';  
        const resultSet = await bdd.query({ query });
        const rows = await resultSet.json(); 
        return rows.data;
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
}




async function insertUsedQ(room_id, question_id) {
    try {
        const query = 'INSERT INTO game_questions (room_id, question_id) VALUES (?, ?)';
        await bdd.query({ query, values: [room_id, question_id] });
        console.log('Question inserted successfully.');
    } catch (error) {
        console.error('Error inserting question:', error.message);
    }
}





async function getRandomQuestion() {
    try {
        const query = 'SELECT * FROM questions ORDER BY RAND() LIMIT 1';  
        const resultSet = await bdd.query({ query });
        const rows = await resultSet.json(); 
        return rows.data;
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
}





async function geteMainstreamQuestion() {
    try {
        const query = 'SELECT * FROM questions WHERE serie_ans IN (SELECT serie from mainstream_serie) ORDER BY RAND() LIMIT 1';  
        const resultSet = await bdd.query({ query });
        const rows = await resultSet.json(); 
        return rows.data;
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
}



async function getSerieQuestion(serie) {
    try {
        const query = `SELECT * FROM questions WHERE serie_ans = '${serie}' ORDER BY RAND() LIMIT 1`;  
        const resultSet = await bdd.query({ query });
        const rows = await resultSet.json(); 
        return rows.data;
    } catch (error) {
        console.error('Error executing query:', error.message);
    }
}







module.exports = {
  bdd,
  getAllQuestions,
  insertUsedQ,
  getRandomQuestion,
  geteMainstreamQuestion,
  getSerieQuestion
};