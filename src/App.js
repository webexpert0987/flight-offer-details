import React, { useState } from 'react';

function App() {
  const [offers, setOffers] = useState([]);

  // Function to parse XML
  const parseXML = (xmlText) => {
    const parser = new DOMParser();
    return parser.parseFromString(xmlText, 'application/xml');
  };

  // Function to extract and combine offers
  const extractOffers = (xmlDoc) => {
    const ns = "http://www.iata.org/IATA/2015/00/2019.2/IATA_AirShoppingRS";
    const offerNodes = xmlDoc.getElementsByTagNameNS(ns, 'Offer');
    const paxSegments = xmlDoc.getElementsByTagNameNS(ns, 'PaxSegment');
    const extractedOffers = {};

    Array.from(offerNodes).forEach((offerNode) => {
      const offerItem = offerNode.getElementsByTagNameNS(ns, 'OfferItem')[0];
      const fareDetail = offerItem.getElementsByTagNameNS(ns, 'FareDetail')[0];
      const fareComponent = fareDetail.getElementsByTagNameNS(ns, 'FareComponent')[0];
      const price = offerItem.getElementsByTagNameNS(ns, 'Price')[0];

      // Extract basic offer details
      const cabinTypeCode = fareComponent.getElementsByTagNameNS(ns, 'CabinTypeCode')[0]?.textContent || 'N/A';
      const cabinTypeName = fareComponent.getElementsByTagNameNS(ns, 'CabinTypeName')[0]?.textContent || 'N/A';
      const fareBasisCode = fareComponent.getElementsByTagNameNS(ns, 'FareBasisCode')[0]?.textContent || 'N/A';
      const baseAmount = price.getElementsByTagNameNS(ns, 'BaseAmount')[0]?.textContent || '0';
      const totalAmount = price.getElementsByTagNameNS(ns, 'TotalAmount')[0]?.textContent || '0';
      const paxSegmentRefID = fareComponent.getElementsByTagNameNS(ns, 'PaxSegmentRefID')[0]?.textContent;

      // Locate the PaxSegment
      let paxSegment = null;
      Array.from(paxSegments).forEach((segment) => {
        const segmentID = segment.getElementsByTagNameNS(ns, 'PaxSegmentID')[0]?.textContent;
        if (segmentID === paxSegmentRefID) {
          paxSegment = segment;
        }
      });

      if (paxSegment) {
        const departure = paxSegment.getElementsByTagNameNS(ns, 'Dep')[0];
        const arrival = paxSegment.getElementsByTagNameNS(ns, 'Arrival')[0];

        const depDateTime = departure?.getElementsByTagNameNS(ns, 'AircraftScheduledDateTime')[0]?.textContent || 'N/A';
        const depCode = departure?.getElementsByTagNameNS(ns, 'IATA_LocationCode')[0]?.textContent || 'N/A';
        const arrDateTime = arrival?.getElementsByTagNameNS(ns, 'AircraftScheduledDateTime')[0]?.textContent || 'N/A';
        const arrCode = arrival?.getElementsByTagNameNS(ns, 'IATA_LocationCode')[0]?.textContent || 'N/A';

        // Group by Origin and Destination
        const key = `${depCode}-${arrCode}`;
        if (!extractedOffers[key]) {
          extractedOffers[key] = {
            route: `${depCode} to ${arrCode}`,
            segments: [],
            totalBaseAmount: 0,
            totalAmount: 0,
          };
        }

        extractedOffers[key].segments.push({
          depDateTime,
          arrDateTime,
          cabinTypeCode,
          cabinTypeName,
          fareBasisCode,
          baseAmount: parseFloat(baseAmount),
          totalAmount: parseFloat(totalAmount),
        });

        extractedOffers[key].totalBaseAmount += parseFloat(baseAmount);
        extractedOffers[key].totalAmount += parseFloat(totalAmount);
      }
    });

    // Convert object to array for easier rendering
    setOffers(Object.values(extractedOffers));
  };

  // Handle file input
  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.xml')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const xmlDoc = parseXML(e.target.result);
        extractOffers(xmlDoc);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid XML file.');
    }
  };
  const customStyle = {
    loopbox: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px'
    },
    boxtd: {
      padding: '5px 10px'
    },
    boxtdFirst: {
      padding: '5px 10px',
      fontWeight: '600',
      color: 'rgb(255 157 12)'
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#4CAF50' }}>Flight Offers</h1>
      <input 
        type="file" 
        accept=".xml" 
        onChange={handleFileInput} 
        style={{
          display: 'block',
          margin: '20px auto',
          padding: '10px',
          fontSize: '16px',
        }} 
      />
      <div>
        {offers.length > 0 ? (
          offers.map((offer, index) => (
            <div 
              key={index} 
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                margin: '20px',
                padding: '20px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 style={{ color: '#2196F3', marginBottom: '10px' }}>Route: {offer.route}</h2>
              <p><strong>Total Base Price:</strong> {offer.totalBaseAmount.toFixed(2)} EUR</p>
              <p><strong>Total Price:</strong> {offer.totalAmount.toFixed(2)} EUR</p>
              <h3 style={{ color: '#FF9800', marginTop: '20px' }}>Flight Segments:</h3>
              <div style={customStyle.loopbox}>
                {offer.segments.map((segment, idx) => (
                  <div
                    key={idx} 
                    style={{
                      background: '#FFF',
                      padding: '20px',
                      margin: '0px',
                      borderRadius: '5px',
                      width: '25%',
                      border: '1px solid #eee'
                    }}
                  >
                    <table>
                      <tbody>
                        <tr>
                        <td style={customStyle.boxtdFirst}>Departure:</td>
                        <td style={customStyle.boxtd}>{segment.depDateTime}</td>
                        </tr>
                        <tr>
                        <td style={customStyle.boxtdFirst}>Arrival:</td>
                        <td style={customStyle.boxtd}>{segment.arrDateTime}</td>
                        </tr>
                        <tr>
                        <td style={customStyle.boxtdFirst}>Cabin:</td>
                        <td style={customStyle.boxtd}>{segment.cabinTypeCode} - {segment.cabinTypeName}</td>
                        </tr>
                        <tr>
                        <td style={customStyle.boxtdFirst}>Fare Basis:</td>
                        <td style={customStyle.boxtd}>{segment.fareBasisCode}</td>
                        </tr>
                        <tr>
                        <td style={customStyle.boxtdFirst}>Base Price:</td>
                        <td style={customStyle.boxtd}>{segment.baseAmount.toFixed(2)} EUR</td>
                        </tr>
                        <tr>
                        <td style={customStyle.boxtdFirst}>Total Price:</td>
                        <td style={customStyle.boxtd}>{segment.totalAmount.toFixed(2)} EUR</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            No offers to display. Upload an XML file to begin.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
