import React, { Component } from 'react';
import './App.css';
const LineChart = require('react-chartjs').Line;

class App extends Component {
  constructor(props){
    super(props);
    this.state = {location: 'Crosshaven',
      date: '2015-09-15',
      rows: [],
      AtmosphericPressure: {},
      WindSpeed: {},
      Gust: {},
      WindDirection: {}
    };
    this.changeLocation = this.changeLocation.bind(this);
    this.changeDate = this.changeDate.bind(this);
  }

  componentDidMount() {
    fetch('/api/day', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({location: this.state.location, date: this.state.date})
    }).then(res => res.json()).then(rows => this.setState({rows: rows}));
  }

  changeLocation(event) {
    this.setState({location: event.target.value}, this.getDay);
  }

  changeDate(event) {
    this.setState({date: event.target.value}, this.getDay);
  }

  getDay() {
    fetch('/api/day', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({location: this.state.location, date: this.state.date})
    }).then(res => res.json()).then(rows => this.setState({rows: rows}));
  }

  renderWindDirectionTable() {
    return <div className="table">
      <table>
        <tbody>
        <tr><th>Time</th><th>Wind Direction(degrees)</th><th>Wind Direction (compass)</th></tr>
        {this.state.rows.map(row => {
          return <tr><td>{new Date(row.time).getHours()}</td><td>{row['WindDirection']}</td><td>{getCompassDirection(row['WindDirection'])}</td></tr>;
        })}
        </tbody>
      </table>
    </div>
  }

  renderChart(attribute, secondattribute) {
    let labels = [];
    let values = [];
    let secondValues = [];
    this.state.rows.forEach(row => {
      labels.push(new Date(row.time).getHours());
      values.push(row[attribute]);
      secondValues.push(row[secondattribute]);
    });
    let data = {
      labels: labels,
      datasets: [{
        label: attribute,
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(51, 153, 255,1)",
        pointColor: "rgba(255, 0, 0,1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: values
      }]
    };

    if (secondattribute) {
      data.datasets.push({
        label: secondattribute,
        fillColor: "rgba(220,220,220,0.2)",
        strokeColor: "rgba(153, 204, 0,1)",
        pointColor: "rgba(0, 0, 102, 1)",
        pointStrokeColor: "#fff",
        pointHighlightFill: "#fff",
        pointHighlightStroke: "rgba(220,220,220,1)",
        data: secondValues
      })
    }

    return <LineChart data={data} width="600" height="250"/>;
  }

  renderAPStats() {
    let min = 0;
    let max = 0;
    let total = 0;
    this.state.rows.forEach(row => {
      let current = row['AtmosphericPressure'];
      if (current > max) {
        max = current;
      } else if ( min === 0 || current < min ) {
        min = current;
      }
      total += current;
    });
    let average = Number(total / this.state.rows.length).toFixed(2);
    return (<div>Average: {average}mb Max: {max}mb Min: {min}mb </div>)
  }

  renderGustStats() {
    // WS = Wind Speed
    let minWS = 0;
    let maxWS = 0;
    let totalWS = 0;
    let minGust = 0;
    let maxGust = 0;
    let totalGust = 0;
    this.state.rows.forEach(row => {
      let currentWS = row['WindSpeed'];
      let currentGust = row['Gust'];
      if (currentWS > maxWS) {
        maxWS = currentWS;
      } else if (minWS === 0 || currentWS < minWS) {
        minWS = currentWS;
      }
      if (currentGust > maxGust) {
        maxGust = currentGust;
      } else if (minGust === 0 || currentGust < minGust) {
        minGust = currentGust;
      }
      totalWS += currentWS;
      totalGust += currentGust;
    });
    let averageWS = Number(totalWS / this.state.rows.length).toFixed(2);
    let averageGust = Number(totalGust / this.state.rows.length).toFixed(2);
    return (<div>
      <div>Average Wind speed: {averageWS}kn Max Wind speed: {maxWS}kn Min Wind speed: {minWS}kn</div>
      <div>Average Gust: {averageGust}kn Max Gust: {maxGust}kn Min Gust: {minGust}kn</div>
    </div>)
  }

  renderLocations() {
    return (<select value={this.state.location} onChange={this.changeLocation}>
      <option value="Crosshaven">Crosshaven</option>
      <option value="Rosscarbery">Rosscarbery</option>
      <option value="Youghal">Youghal</option>
      <option value="Kinsale">Kinsale</option>
      <option value="Cobh">Cobh</option>
      <option value="Skibbereen">Skibbereen</option>
      <option value="Bantry">Bantry</option>
      <option value="Ballydehob">Ballydehob</option>
    </select>);
  }

  renderDate() {
    return <input type="date" value={this.state.date} onChange={this.changeDate} min="2001-02-06" max="2017-07-20"/>;
  }

  renderAvailable() {
    return <div>
      <h4>Atmospheric Pressure</h4>
      <div>{this.state.rows.length > 0 && this.renderChart('AtmosphericPressure')}</div>
      {this.renderAPStats()}
      <h4>Wind Speed vs Gust</h4>
      <div>{this.state.rows.length > 0 && this.renderChart('WindSpeed', 'Gust')}</div>
      {this.renderGustStats()}
      <h4>Wind Direction</h4>
      <div>{this.renderWindDirectionTable()}</div>
    </div>
  }

  render() {
    return (
      <div className="App">
      <h1>Assignment - Paul Laureano</h1>
      <div>
        <strong>Location:</strong>
        {this.renderLocations()}
        <strong>Date:</strong>
        {this.renderDate()}
      </div>
        <h2>Weather patterns in {this.state.location} on {this.state.date}</h2>
        {this.state.rows.length > 1 && this.renderAvailable()}
        {this.state.rows.length < 1 && <p>No data available</p>}
  </div>
  );
  }
}

const getCompassDirection = (degree) => {
  if (degree >= 0 && degree <= 11.25) return "N";
  if (degree > 348.75 && degree <= 360) return "N";
  if (degree > 11.25 && degree <= 33.75) return "NNE";
  if (degree > 33.75 && degree <= 56.25) return "NE";
  if (degree > 56.25 && degree <= 78.75) return "ENE";
  if (degree > 78.75 && degree <= 101.25) return "E";
  if (degree > 101.25 && degree <= 123.75) return "ESE";
  if (degree > 123.75 && degree <= 146.25) return "SE";
  if (degree > 146.25 && degree <= 168.75) return "SSE";
  if (degree > 168.75 && degree <= 191.25) return "S";
  if (degree > 191.25 && degree <= 213.75) return "SSW";
  if (degree > 213.75 && degree <= 236.25) return "SW";
  if (degree > 236.25 && degree <= 258.75) return "WSW";
  if (degree > 258.75 && degree <= 281.25) return "W";
  if (degree > 281.25 && degree <= 303.75) return "WNW";
  if (degree > 303.75 && degree <= 326.25) return "NW";
  if (degree > 326.25 && degree <= 348.75) return "NNW";
};

/**
 *  {this.state.rows && this.state.rows.map(row =>
    <div>{row.locationID} {row.time} {row.AtmosphericPressure} {row.WindDirection} {row.WindSpeed} {row.Gust}</div>
    )}
 */
export default App;
