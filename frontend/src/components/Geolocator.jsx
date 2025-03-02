import React from 'react';

class Geolocator extends React.Component {
  constructor() {
    super();
    this.state = {
      geolocation: null,
    //   lastUpdate: new Date(Date.now())
    };
  }

  render() {
    // return <button onClick={this.manageClick}>{lastUpdate.toString()}</button>;
    // return <button onClick={this.manageClick}>{"pressme"}</button>;
    setInterval(this.manageClick, 1000)
  }
  manageClick() {
    // console.log("button pressed")
    if (navigator.geolocation) {
        // console.log("has geolocator enabled")
        navigator.geolocation.getCurrentPosition((pos) => {
            // console.log("found location");
            // console.log(pos);
            fetch('/location', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(pos)
              })
              .then(response => response.json())
              .then(data => console.log(data))
              .catch(error => console.error(error));
              
        })
    }
  }


}

export default Geolocator;
