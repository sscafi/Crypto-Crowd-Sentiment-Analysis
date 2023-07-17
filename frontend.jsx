// App.js

import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [cryptocurrency, setCryptocurrency] = useState('');
  const [sentimentData, setSentimentData] = useState([]);
  const [averageScore, setAverageScore] = useState(null);

  const handleCryptocurrencyChange = (event) => {
    setCryptocurrency(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.get(`/sentiment/${cryptocurrency}`);
      setSentimentData(response.data.sentimentData);
      setAverageScore(response.data.averageScore);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Cryptocurrency Sentiment Analysis</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Cryptocurrency:
          <input type="text" value={cryptocurrency} onChange={handleCryptocurrencyChange} />
        </label>
        <button type="submit">Analyze</button>
      </form>

      {averageScore !== null && (
        <div>
          <h2>Average Sentiment Score: {averageScore}</h2>
          <ul>
            {sentimentData.map((data, index) => (
              <li key={index}>
                <p>{data.text}</p>
                <p>Score: {data.score}, Comparative: {data.comparative}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
