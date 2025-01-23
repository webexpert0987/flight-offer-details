import React, { useState } from 'react';
import './App.css';

function App() {
  const [offers, setOffers] = useState([]);
  
  // Function to parse XML file
  function parseXML(xmlText) {
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, "text/xml");
  }

  // Function to display offers from the parsed XML
  function displayOffers(xmlDoc) {
    const offers = xmlDoc.getElementsByTagName('Offer');
    const offerList = [];

    for (let i = 0; i < offers.length; i++) {
      const offer = offers[i];
      const offerItem = offer.getElementsByTagName('OfferItem')[0];

      // Extracting details from the XML
      const cabinTypeCode = offerItem.getElementsByTagName('CabinTypeCode')[0]?.textContent || 'N/A';
      const cabinTypeName = offerItem.getElementsByTagName('CabinTypeName')[0]?.textContent || 'N/A';
      const fareBasisCode = offerItem.getElementsByTagName('FareBasisCode')[0]?.textContent || 'N/A';
      const baseAmount = offerItem.getElementsByTagName('BaseAmount')[0]?.textContent || 'N/A';
      const totalAmount = offerItem.getElementsByTagName('TotalAmount')[0]?.textContent || 'N/A';
      const baggageAllowance = offerItem.getElementsByTagName('BaggageAllowance')[0]?.textContent || 'N/A';
      const offerDate = offerItem.getElementsByTagName('OfferDate')[0]?.textContent || 'N/A';
      const departureDate = offerItem.getElementsByTagName('DepartureDate')[0]?.textContent || 'N/A';
      const arrivalDate = offerItem.getElementsByTagName('ArrivalDate')[0]?.textContent || 'N/A';

      // Store the offer in the list
      offerList.push({
        cabinTypeCode,
        cabinTypeName,
        fareBasisCode,
        baseAmount,
        totalAmount,
        baggageAllowance,
        offerDate,
        departureDate,
        arrivalDate,
      });
    }

    // Update the state with the offers
    setOffers(offerList);
  }

  // Handle file input and parse XML when selected
  function handleFileInput(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xml')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const xmlText = e.target.result;
        const xmlDoc = parseXML(xmlText);
        displayOffers(xmlDoc);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid XML file.');
    }
  }

  return (
    <div className="App">
      <h1>Flight Offer Details</h1>
      <input type="file" onChange={handleFileInput} accept=".xml" />
      <div id="offerList">
        {offers.length > 0 ? (
          offers.map((offer, index) => (
            <div className="offer-container" key={index}>
              <div className="offer-header">
                <h2>Offer #{index + 1}</h2>
                <span className="offer-price">{offer.baseAmount} EUR (Total: {offer.totalAmount} EUR)</span>
              </div>
              <div className="details">
                <div><label>Cabin Type:</label> {offer.cabinTypeCode} - {offer.cabinTypeName}</div>
                <div><label>Fare Basis Code:</label> {offer.fareBasisCode}</div>
                <div><label>Base Amount:</label> {offer.baseAmount} EUR</div>
                <div><label>Total Amount:</label> {offer.totalAmount} EUR</div>
                <div><label>Baggage Allowance:</label> {offer.baggageAllowance}</div>
                <div><label>Offer Date:</label> {offer.offerDate}</div>
                <div><label>Departure Date:</label> {offer.departureDate}</div>
                <div><label>Arrival Date:</label> {offer.arrivalDate}</div>
              </div>
            </div>
          ))
        ) : (
          <p>No offers to display. Please upload an XML file.</p>
        )}
      </div>
    </div>
  );
}

export default App;
